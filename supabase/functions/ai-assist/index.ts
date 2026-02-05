import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `ROL
Je bent HandyMatch AI, een assistent voor klusproblemen in België.
Je ondersteunt twee types gebruikers:
- seeker → particulier zonder technische kennis
- handy → professional met technische kennis

De input kan bestaan uit:
- alleen tekst
- tekst + één of meerdere foto's
Een foto is optioneel, nooit verplicht.

DOEL (ABSOLUUT)
Geef korte, correcte en veilige hulp, afgestemd op het gebruikersprofiel, met als logica:
1. Begrijpen wat het probleem is
2. Veilig advies geven (indien mogelijk)
3. Duidelijk aangeven of je het begrijpt of niet
4. Indien nodig: extra info, les/tutorial of inschakelen van een Handy

❌ Geen lange uitleg
❌ Geen speculatie
❌ Geen meerdere scenario's tegelijk

GEBRUIKERSPROFIEL-LOGICA
Als userType = seeker:
- Gebruik eenvoudige taal
- Geen vakjargon
- Max. 5 stappen
- Focus op: "kan ik dit veilig zelf doen?"
- Leg niet uit hoe iets werkt, alleen wat te doen

Als userType = handy:
- Gebruik technische termen
- Ga dieper waar nuttig (diagnose, oorzaken)
- Minder uitleg, meer precisie
- Focus op: oorzaak → oplossing → risico's

FOTO-ANALYSE (ALLEEN ALS FOTO AANWEZIG IS)
Als er een foto is:
- Beschrijf objectief wat zichtbaar is
- Geef expliciet aan of je het probleem begrijpt: "vision_confidence": "high" | "medium" | "low"
- Benoem maximaal één hoofdprobleem
- Geef alleen een oplossing als confidence ≠ low
- Duid visueel aan waar het probleem zit (beschrijvend)

Als foto onduidelijk is:
- Zeg dat expliciet
- Vraag gerichte extra info of extra foto
- Geef geen oplossing

RISICOLOGICA (VERPLICHT)
GREEN:
- veilig, eenvoudig
- lokaal zichtbaar
- geen elektriciteit, gas, structurele ingreep

YELLOW:
- voorzichtig
- kans op gevolgschade
- beperkte stappen + duidelijke stopcondities

RED:
- water + elektriciteit
- gas, rioolgeur, brand
- structurele schade
- meerdere systemen tegelijk

➡️ Bij RED:
- geen stappenplan
- altijd escaleren

VERPLICHT JSON-FORMAT
Geef uitsluitend dit JSON-object terug:

{
  "debug_contract_version": "HM_AI_V1",
  "user_type": "seeker" | "handy",
  "input_type": "text_only" | "text_with_photo",
  "vision_confidence": "high" | "medium" | "low" | null,
  "understood": boolean,
  "risk_level": "GREEN" | "YELLOW" | "RED",
  "category": string,
  "main_issue": string | null,
  "issue_location_description": string | null,
  "what_is_visible": string[],
  "suggested_steps": string[],
  "stop_conditions": string[],
  "next_action": "continue_self_fix" | "request_more_info" | "lesson" | "book_handy",
  "lesson_suggestion": {
    "suggested": boolean,
    "topic": string | null
  },
  "handy_suggestion": {
    "suggested": boolean,
    "reason": string | null
  },
  "explanation_if_uncertain": string | null,
  "disclaimer": "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in."
}

BELANGRIJKE REGELS
- Geen uitleg buiten JSON
- Geen emoji's
- Geen UI-teksten ("klik hier", "bekijk les")
- CTA's worden door de app bepaald, niet door jou
- Als understood = false → geen stappen

BESLISSINGSLOGICA next_action
- "continue_self_fix" → GREEN + understood = true
- "lesson" → YELLOW of herhaalbare taak
- "request_more_info" → vision_confidence = low of onduidelijke vraag
- "book_handy" → RED of twijfel/gevaar

Je antwoord moet kort, correct en beslissend zijn.
Geef nu uitsluitend het JSON-object terug.`;

interface AIRequest {
  userType: "seeker" | "handy";
  message: string;
  photoProvided: boolean;
  categoryHint: string | null;
}

interface AIResponse {
  debug_contract_version: string;
  user_type: "seeker" | "handy";
  input_type: "text_only" | "text_with_photo";
  vision_confidence: "high" | "medium" | "low" | null;
  understood: boolean;
  risk_level: "GREEN" | "YELLOW" | "RED";
  category: string;
  main_issue: string | null;
  issue_location_description: string | null;
  what_is_visible: string[];
  suggested_steps: string[];
  stop_conditions: string[];
  next_action: "continue_self_fix" | "request_more_info" | "lesson" | "book_handy";
  lesson_suggestion: { suggested: boolean; topic: string | null };
  handy_suggestion: { suggested: boolean; reason: string | null };
  explanation_if_uncertain: string | null;
  disclaimer: string;
}

const FALLBACK_RESPONSE: AIResponse = {
  debug_contract_version: "HM_AI_V1",
  user_type: "seeker",
  input_type: "text_only",
  vision_confidence: null,
  understood: false,
  risk_level: "YELLOW",
  category: "Onbekend",
  main_issue: null,
  issue_location_description: null,
  what_is_visible: [],
  suggested_steps: [],
  stop_conditions: ["Bij twijfel, schakel een professional in"],
  next_action: "request_more_info",
  lesson_suggestion: { suggested: false, topic: null },
  handy_suggestion: { suggested: true, reason: "Bij onvoldoende informatie is het veiliger om een expert te raadplegen." },
  explanation_if_uncertain: "Ik kon je vraag niet volledig analyseren. Geef meer details of stuur een foto.",
  disclaimer: "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in."
};

function validateAndFixResponse(data: unknown, userType: string, photoProvided: boolean): AIResponse {
  const response = data as Partial<AIResponse>;
  
  const riskLevel = (["GREEN", "YELLOW", "RED"].includes(response.risk_level || "")) 
    ? response.risk_level as "GREEN" | "YELLOW" | "RED" 
    : "YELLOW";
  
  const understood = response.understood !== undefined ? response.understood : true;
  
  let nextAction: AIResponse["next_action"] = response.next_action || "continue_self_fix";
  if (!["continue_self_fix", "request_more_info", "lesson", "book_handy"].includes(nextAction)) {
    nextAction = riskLevel === "RED" ? "book_handy" : understood ? "continue_self_fix" : "request_more_info";
  }
  
  return {
    debug_contract_version: "HM_AI_V1",
    user_type: userType === "handy" ? "handy" : "seeker",
    input_type: photoProvided ? "text_with_photo" : "text_only",
    vision_confidence: photoProvided ? (response.vision_confidence || "medium") : null,
    understood,
    risk_level: riskLevel,
    category: response.category || "Onbekend",
    main_issue: response.main_issue || null,
    issue_location_description: response.issue_location_description || null,
    what_is_visible: Array.isArray(response.what_is_visible) ? response.what_is_visible : [],
    suggested_steps: Array.isArray(response.suggested_steps) ? response.suggested_steps : [],
    stop_conditions: Array.isArray(response.stop_conditions) ? response.stop_conditions : [],
    next_action: nextAction,
    lesson_suggestion: response.lesson_suggestion || { suggested: false, topic: null },
    handy_suggestion: response.handy_suggestion || { suggested: riskLevel === "RED", reason: riskLevel === "RED" ? "Schakel een professional in." : null },
    explanation_if_uncertain: response.explanation_if_uncertain || null,
    disclaimer: response.disclaimer || "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in."
  };
}

async function callAI(messages: Array<{ role: string; content: string }>): Promise<{ success: boolean; data?: AIResponse; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY is not configured");
    return { success: false, error: "AI service niet geconfigureerd" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return { success: false, error: "Te veel verzoeken, probeer het later opnieuw" };
      }
      if (response.status === 402) {
        return { success: false, error: "AI credits opgebruikt" };
      }
      
      return { success: false, error: "AI service tijdelijk niet beschikbaar" };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      return { success: false, error: "Geen antwoord ontvangen van AI" };
    }

    // Try to parse JSON - handle markdown code blocks
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Try to find JSON object directly
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }
    }

    try {
      const parsed = JSON.parse(jsonStr);
      return { success: true, data: parsed };
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return { success: false, error: "Ongeldig antwoordformaat" };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "AI reageert niet op tijd" };
    }
    console.error("AI call error:", error);
    return { success: false, error: "Verbindingsfout met AI" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userType, message, photoProvided, categoryHint }: AIRequest = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Bericht is verplicht", fallback: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing AI request: userType=${userType}, message length=${message.length}, photo=${photoProvided}`);

    // Build context
    let userContext = "";
    if (userType === "handy") {
      userContext = "[Context: De gebruiker is een Handy (vakman/klusser) die advies zoekt]\n\n";
    } else {
      userContext = "[Context: De gebruiker is iemand die hulp zoekt bij een klusprobleem thuis]\n\n";
    }
    
    if (categoryHint) {
      userContext += `[Categorie hint: ${categoryHint}]\n\n`;
    }
    
    if (photoProvided) {
      userContext += "[De gebruiker heeft een foto toegevoegd]\n\n";
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContext + message }
    ];

    // First attempt
    let result = await callAI(messages);

    // If parsing failed, try repair call
    if (!result.success && result.error === "Ongeldig antwoordformaat") {
      console.log("Attempting repair call...");
      
      const repairMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContext + message },
        { role: "assistant", content: "Ik zal je vraag analyseren..." },
        { role: "user", content: "Return ONLY valid JSON per schema. No prose, no markdown, no explanation. Just the JSON object." }
      ];
      
      result = await callAI(repairMessages);
    }

    if (result.success && result.data) {
      const validated = validateAndFixResponse(result.data, userType, photoProvided);
      console.log(`AI response: category=${validated.category}, risk=${validated.risk_level}, next_action=${validated.next_action}`);
      
      return new Response(
        JSON.stringify({ ok: true, data: validated }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return fallback with error info
    console.log(`Returning fallback due to: ${result.error}`);
    
    return new Response(
      JSON.stringify({ ok: false, error: result.error, fallback: FALLBACK_RESPONSE }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Request error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : "Onbekende fout", 
        fallback: FALLBACK_RESPONSE 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
