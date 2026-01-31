import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Je bent 'HandyMatch AI Klushulp' (België). Antwoord ALTIJD met geldige JSON volgens het schema. Geen markdown, geen extra tekst, geen code blocks. Alleen pure JSON.

Classificeer risico als GREEN/YELLOW/RED:
- GREEN: veilig, simpele checks en stappen. Gebruiker kan dit zelf oplossen.
- YELLOW: voorzichtig, beperkte stappen, duidelijke stopcondities. Vaak 'lesson' of 'book_handy' aanraden.
- RED: STOP. Geen stappen behalve pure veiligheidsstappen (stroom/gas/water afsluiten indien veilig, ventileren, afstand houden). Adviseer professional/nooddienst indien nodig. Bij gasgeur, rook, vonken, of structurele schade: RED.

Verplicht JSON schema (exact deze keys):
{
  "title": string,
  "category": "Elektriciteit" | "Sanitair" | "Afvoer" | "Verwarming" | "Witgoed" | "Deuren/Sloten" | "Muren/Verf" | "Meubels" | "Tuin" | "Algemeen" | "Onbekend",
  "risk_level": "GREEN" | "YELLOW" | "RED",
  "risk_badge": string (korte tekst voor badge, bv "Veilig", "Voorzichtig", "Gevaar - Stop"),
  "summary": string,
  "likely_causes": string[],
  "questions_to_confirm": string[],
  "step_by_step": string[],
  "tools_needed": string[],
  "materials_needed": string[],
  "stop_conditions": string[],
  "next_best_action": "self_fix" | "lesson" | "book_handy",
  "lesson_suggestion": { "suggested": boolean, "topic": string, "why": string },
  "handy_suggestion": { "suggested": boolean, "why": string, "urgency": "low" | "medium" | "high" },
  "disclaimer_short": "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in.",
  "confidence": number (0-100),
  "confidence_note": string
}

Next_best_action logica:
- self_fix: bij GREEN en simpele problemen
- lesson: bij YELLOW of wanneer het leerbaar is
- book_handy: bij RED of YELLOW met risico op falen/gevaar

Nooit model/API vermelden. Nederlands (België), professioneel en positief.
Voeg altijd disclaimer_short toe.`;

interface AIRequest {
  userType: "seeker" | "handy";
  message: string;
  photoProvided: boolean;
  categoryHint: string | null;
}

interface AIResponse {
  title: string;
  category: string;
  risk_level: "GREEN" | "YELLOW" | "RED";
  risk_badge: string;
  summary: string;
  likely_causes: string[];
  questions_to_confirm: string[];
  step_by_step: string[];
  tools_needed: string[];
  materials_needed: string[];
  stop_conditions: string[];
  next_best_action: "self_fix" | "lesson" | "book_handy";
  lesson_suggestion: { suggested: boolean; topic: string; why: string };
  handy_suggestion: { suggested: boolean; why: string; urgency: "low" | "medium" | "high" };
  disclaimer_short: string;
  confidence: number;
  confidence_note: string;
}

const FALLBACK_RESPONSE: AIResponse = {
  title: "Kan niet analyseren",
  category: "Onbekend",
  risk_level: "YELLOW",
  risk_badge: "Voorzichtig",
  summary: "Ik kon je vraag niet volledig analyseren. Geef meer details of stuur een foto voor een betere analyse.",
  likely_causes: [],
  questions_to_confirm: [
    "Kan je het probleem in meer detail beschrijven?",
    "Wanneer is dit begonnen?",
    "Heb je al iets geprobeerd?"
  ],
  step_by_step: [],
  tools_needed: [],
  materials_needed: [],
  stop_conditions: ["Bij twijfel, schakel een professional in"],
  next_best_action: "book_handy",
  lesson_suggestion: { suggested: false, topic: "", why: "" },
  handy_suggestion: { suggested: true, why: "Bij onvoldoende informatie is het veiliger om een expert te raadplegen.", urgency: "medium" },
  disclaimer_short: "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in.",
  confidence: 20,
  confidence_note: "Onvoldoende informatie voor betrouwbare analyse"
};

function validateAndFixResponse(data: unknown): AIResponse {
  const response = data as Partial<AIResponse>;
  
  return {
    title: response.title || "Analyse",
    category: response.category || "Onbekend",
    risk_level: (["GREEN", "YELLOW", "RED"].includes(response.risk_level || "")) 
      ? response.risk_level as "GREEN" | "YELLOW" | "RED" 
      : "YELLOW",
    risk_badge: response.risk_badge || (response.risk_level === "GREEN" ? "Veilig" : response.risk_level === "RED" ? "Gevaar - Stop" : "Voorzichtig"),
    summary: response.summary || "Geen samenvatting beschikbaar.",
    likely_causes: Array.isArray(response.likely_causes) ? response.likely_causes : [],
    questions_to_confirm: Array.isArray(response.questions_to_confirm) ? response.questions_to_confirm : [],
    step_by_step: Array.isArray(response.step_by_step) ? response.step_by_step : [],
    tools_needed: Array.isArray(response.tools_needed) ? response.tools_needed : [],
    materials_needed: Array.isArray(response.materials_needed) ? response.materials_needed : [],
    stop_conditions: Array.isArray(response.stop_conditions) ? response.stop_conditions : [],
    next_best_action: (["self_fix", "lesson", "book_handy"].includes(response.next_best_action || ""))
      ? response.next_best_action as "self_fix" | "lesson" | "book_handy"
      : "book_handy",
    lesson_suggestion: response.lesson_suggestion || { suggested: false, topic: "", why: "" },
    handy_suggestion: response.handy_suggestion || { suggested: true, why: "Raadpleeg een expert bij twijfel.", urgency: "medium" },
    disclaimer_short: response.disclaimer_short || "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in.",
    confidence: typeof response.confidence === "number" ? response.confidence : 50,
    confidence_note: response.confidence_note || ""
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
      console.log(`AI response: category=${result.data.category}, risk=${result.data.risk_level}, action=${result.data.next_best_action}`);
      
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
