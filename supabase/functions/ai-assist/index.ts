import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Je bent de HandyMatch AI Coach, een praktische en veiligheidsgerichte assistent voor klusadvies.

## JOUW ROL
- Geef stap-voor-stap begeleiding voor huishoudelijke reparaties en onderhoud
- Stel eerst 1-3 verduidelijkingsvragen als informatie ontbreekt
- Wees altijd veiligheidsbewust en realistisch over wat een leek kan doen

## SAFETY RULES - STRICT TOEPASSEN

### RED (ALTIJD STOPPEN + PROFESSIONAL AANRADEN):
- Gasgeur of vermoeden van gaslek
- Rook, vonken, brandgeur, smeltende kabels
- Elektriciteit + water/vocht in dezelfde zone
- Zekeringkast/verdeelkast openen of bedrading blootleggen
- Structurele scheuren/balken, instortingsrisico
- Asbestverdacht materiaal (vóór 1994, isolatie, golfplaten)
- Ernstig letsel of medische nood

### YELLOW (VOORZICHTIG, ALLEEN LAAG-RISICO STAPPEN):
- Onvoldoende informatie om veilig advies te geven
- Complexe installatie of systeem
- Probleem blijft na 2 pogingen
- Mogelijk verborgen lekkage (achter muur/vloer)
- Verwarming/boiler met druk/veiligheidsventiel betrokken

### GREEN (LAAG RISICO, ZELF TE DOEN):
- Sifon reinigen
- Kraan rubbertje vervangen
- Ontstoppen zonder agressieve chemicaliën
- Simpele montage en onderhoud

## OUTPUT FORMAAT
Je MOET altijd antwoorden in EXACT dit JSON-schema, zonder extra tekst ervoor of erna:

{
  "category": "Elektriciteit" | "Sanitair" | "Afvoer" | "Verwarming" | "Witgoed" | "Deuren/Sloten" | "Muren/Verf" | "Meubels" | "Tuin" | "Algemeen" | "Onbekend",
  "risk_level": "green" | "yellow" | "red",
  "summary": "Korte samenvatting van het probleem en advies",
  "likely_causes": ["Mogelijke oorzaak 1", "Mogelijke oorzaak 2"],
  "questions_to_confirm": ["Vraag 1 om situatie te verduidelijken", "Vraag 2"],
  "steps": ["Stap 1", "Stap 2", "Stap 3"],
  "tools_needed": ["Gereedschap 1", "Gereedschap 2"],
  "materials_needed": ["Materiaal 1", "Materiaal 2"],
  "stop_conditions": ["Stop direct als...", "Neem contact op met professional als..."],
  "recommend_handy": true/false,
  "handy_reason": "Reden waarom een professional nodig is (of lege string)"
}

## BELANGRIJKE REGELS
- Geef NOOIT instructies voor gevaarlijke handelingen
- Bij RED: recommend_handy moet true zijn, steps moet leeg of minimaal zijn
- Bij YELLOW: alleen veilige diagnostische stappen, adviseer pro bij twijfel
- Eindig altijd met duidelijke stopcondities
- Dit is indicatief advies, op eigen risico, bij twijfel professional inschakelen`;

interface AIRequest {
  text: string;
  userType: "seeker" | "handy";
  images: string[];
}

interface AIResponse {
  category: string;
  risk_level: "green" | "yellow" | "red";
  summary: string;
  likely_causes: string[];
  questions_to_confirm: string[];
  steps: string[];
  tools_needed: string[];
  materials_needed: string[];
  stop_conditions: string[];
  recommend_handy: boolean;
  handy_reason: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Use Lovable AI (LOVABLE_API_KEY is automatically provided)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service niet geconfigureerd" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Using Lovable AI for request");

    const { text, userType, images = [] }: AIRequest = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Tekst is verplicht" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing AI assist request: userType=${userType}, text length=${text.length}, images=${images.length}`);

    // Build user message with context
    let userMessage = text;
    if (userType === "handy") {
      userMessage = `[Context: De gebruiker is een Handy (klusser/vakman) die advies zoekt voor zijn werk]\n\n${text}`;
    } else {
      userMessage = `[Context: De gebruiker is iemand die hulp zoekt bij een klusprobleem thuis]\n\n${text}`;
    }

    // Build messages array
    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // If images are provided, use vision model format
    if (images.length > 0) {
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "text", text: userMessage }
      ];
      
      for (const imageUrl of images) {
        content.push({
          type: "image_url",
          image_url: { url: imageUrl }
        });
      }
      
      messages.push({ role: "user", content });
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Te veel verzoeken, probeer het later opnieuw" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service tijdelijk niet beschikbaar" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response:", data);
      return new Response(
        JSON.stringify({ error: "Geen antwoord ontvangen van AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response (handle markdown code blocks from Gemini)
    let aiResponse: AIResponse;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      aiResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Ongeldig antwoordformaat van AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and set defaults for required fields
    if (!aiResponse.category) aiResponse.category = "Onbekend";
    if (!aiResponse.risk_level) aiResponse.risk_level = "yellow";
    if (!aiResponse.summary) aiResponse.summary = "Geen samenvatting beschikbaar";
    if (!aiResponse.recommend_handy) aiResponse.recommend_handy = false;
    if (!aiResponse.handy_reason) aiResponse.handy_reason = "";

    // Ensure arrays are arrays with defaults
    if (!Array.isArray(aiResponse.likely_causes)) aiResponse.likely_causes = [];
    if (!Array.isArray(aiResponse.questions_to_confirm)) aiResponse.questions_to_confirm = [];
    if (!Array.isArray(aiResponse.steps)) aiResponse.steps = [];
    if (!Array.isArray(aiResponse.tools_needed)) aiResponse.tools_needed = [];
    if (!Array.isArray(aiResponse.materials_needed)) aiResponse.materials_needed = [];
    if (!Array.isArray(aiResponse.stop_conditions)) aiResponse.stop_conditions = [];

    console.log(`AI response generated: category=${aiResponse.category}, risk_level=${aiResponse.risk_level}`);

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI assist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Onbekende fout opgetreden" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
