import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Je bent de AI Klushulp van de HandyMatch-app.
De UI is reeds gebouwd en mag op geen enkele manier aangepast worden.

Jouw taak is uitsluitend het leveren van betrouwbare, veilige en gestructureerde hulp voor klusproblemen, zodat:
- gebruikers eerst zelf kunnen proberen,
- daarna eventueel een les/tutorial volgen,
- en pas als laatste stap een Handy inschakelen.

🎯 ABSOLUUT DOEL
Je moet altijd en uitsluitend een geldig JSON-object teruggeven dat exact voldoet aan het HM_AI_V1 schema.
❌ Geen uitleg
❌ Geen markdown
❌ Geen vrije tekst
❌ Geen extra velden
❌ Geen ontbrekende velden

🧱 VERPLICHT JSON-CONTRACT (HM_AI_V1)
{
  "debug_contract_version": "HM_AI_V1",
  "risk_level": "GREEN" | "YELLOW" | "RED",
  "category": string,
  "title": string,
  "summary": string,
  "likely_causes": string[],
  "questions_to_confirm": string[],
  "steps": string[],
  "tools": string[],
  "materials": string[],
  "stop_conditions": string[],
  "lesson_suggestion": {
    "suggested": boolean,
    "title": string | null,
    "lesson_id": string | null
  },
  "handy_suggestion": {
    "suggested": boolean,
    "reason": string | null
  },
  "disclaimer": string
}

⚠️ VEILIGHEIDSLOGICA (VERPLICHT TOE TE PASSEN)
Bepaal het risiconiveau objectief, volgens deze vaste regels:

GREEN:
- eenvoudig, lokaal probleem
- zichtbaar en bereikbaar
- geen elektriciteit, geen druk, geen chemie

YELLOW:
- risico op water- of gevolgschade
- sifon losmaken, voorzichtig werken
- mogelijk dieper liggend probleem

RED:
- water komt omhoog
- meerdere afvoeren tegelijk
- rioolgeur
- combinatie water + elektriciteit
- structurele leidingen of muren

➡️ Bij RED:
- geen stappenplan (steps = lege array)
- handy_suggestion.suggested = true

🧠 INHOUDELIJKE REGELS
Stappenplan (steps):
- Alleen concrete, veilige, uitvoerbare stappen
- Genummerd en logisch opgebouwd
- Geen aannames
- Stop zodra risico stijgt

Stopcondities (stop_conditions):
- Altijd aanwezig
- Duidelijk en beslissend
- Gericht op veiligheid en schadebeperking

Les-suggestie:
- suggested = true bij onderhoud, herhaalbare taken of preventie
- Nooit verplicht, altijd optioneel

Handy-suggestie:
- Alleen true bij RED of YELLOW met duidelijke onzekerheid
- Altijd met heldere reden

🔒 DISCLAIMER (VERPLICHT)
Gebruik altijd: "Dit is indicatief advies. Stop bij twijfel, gevaar of schade en schakel een professional in."

🚫 STRIKT VERBODEN
- Vrije tekst buiten JSON
- Emojis
- Subjectieve taal
- UI-aanwijzingen
- Juridische claims
- Absoluut taalgebruik ("altijd", "nooit veilig")

Geef nu uitsluitend het JSON-object terug dat voldoet aan HM_AI_V1.`;

interface AIRequest {
  userType: "seeker" | "handy";
  message: string;
  photoProvided: boolean;
  categoryHint: string | null;
}

interface AIResponse {
  debug_contract_version: string;
  risk_level: "GREEN" | "YELLOW" | "RED";
  category: string;
  title: string;
  summary: string;
  likely_causes: string[];
  questions_to_confirm: string[];
  steps: string[];
  tools: string[];
  materials: string[];
  stop_conditions: string[];
  lesson_suggestion: { suggested: boolean; title: string | null; lesson_id: string | null };
  handy_suggestion: { suggested: boolean; reason: string | null };
  disclaimer: string;
}

const FALLBACK_RESPONSE: AIResponse = {
  debug_contract_version: "HM_AI_V1",
  risk_level: "YELLOW",
  category: "Onbekend",
  title: "Kan niet analyseren",
  summary: "Ik kon je vraag niet volledig analyseren. Geef meer details of stuur een foto voor een betere analyse.",
  likely_causes: [],
  questions_to_confirm: [
    "Kan je het probleem in meer detail beschrijven?",
    "Wanneer is dit begonnen?",
    "Heb je al iets geprobeerd?"
  ],
  steps: [],
  tools: [],
  materials: [],
  stop_conditions: ["Bij twijfel, schakel een professional in"],
  lesson_suggestion: { suggested: false, title: null, lesson_id: null },
  handy_suggestion: { suggested: true, reason: "Bij onvoldoende informatie is het veiliger om een expert te raadplegen." },
  disclaimer: "Dit is indicatief advies. Stop bij twijfel, gevaar of schade en schakel een professional in."
};

function validateAndFixResponse(data: unknown): AIResponse {
  const response = data as Partial<AIResponse>;
  
  return {
    debug_contract_version: "HM_AI_V1",
    risk_level: (["GREEN", "YELLOW", "RED"].includes(response.risk_level || "")) 
      ? response.risk_level as "GREEN" | "YELLOW" | "RED" 
      : "YELLOW",
    category: response.category || "Onbekend",
    title: response.title || "Analyse",
    summary: response.summary || "Geen samenvatting beschikbaar.",
    likely_causes: Array.isArray(response.likely_causes) ? response.likely_causes : [],
    questions_to_confirm: Array.isArray(response.questions_to_confirm) ? response.questions_to_confirm : [],
    steps: Array.isArray(response.steps) ? response.steps : [],
    tools: Array.isArray(response.tools) ? response.tools : [],
    materials: Array.isArray(response.materials) ? response.materials : [],
    stop_conditions: Array.isArray(response.stop_conditions) ? response.stop_conditions : [],
    lesson_suggestion: response.lesson_suggestion || { suggested: false, title: null, lesson_id: null },
    handy_suggestion: response.handy_suggestion || { suggested: true, reason: "Raadpleeg een expert bij twijfel." },
    disclaimer: response.disclaimer || "Dit is indicatief advies. Stop bij twijfel, gevaar of schade en schakel een professional in."
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
      const validated = validateAndFixResponse(parsed);
      return { success: true, data: validated };
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
      console.log(`AI response: category=${result.data.category}, risk=${result.data.risk_level}, handy_suggested=${result.data.handy_suggestion.suggested}`);
      
      return new Response(
        JSON.stringify({ ok: true, data: result.data }),
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
