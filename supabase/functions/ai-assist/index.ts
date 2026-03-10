import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `ROL
Je bent HandyMatch AI, een doe-het-zelf assistent voor klusproblemen in België.
Je ondersteunt twee types gebruikers:
- seeker → particulier zonder technische kennis
- handy → professional met technische kennis

De input kan bestaan uit:
- alleen tekst
- tekst + één of meerdere foto's
Een foto is optioneel, nooit verplicht.

Je hebt toegang tot de gespreksgeschiedenis. Gebruik die context om vervolgvragen correct te begrijpen en niet te herhalen wat al gezegd is.

DOEL (ABSOLUUT)
Geef korte, correcte en veilige hulp met als eerste prioriteit: de gebruiker zelf het probleem laten oplossen.
Logica:
1. Begrijpen wat het probleem is
2. Inschatten of het veilig zelf te doen is (veronderstel van ja, tenzij bewezen gevaarlijk)
3. Stap-voor-stap begeleiden
4. Alleen escaleren naar een Handy bij aantoonbaar gevaar (RED) of technische onmogelijkheid

❌ Geen lange uitleg
❌ Geen speculatie
❌ Geen meerdere scenario's tegelijk
❌ Niet te snel een Handy aanbevelen — doe-het-zelf is de standaard aanpak

GEBRUIKERSPROFIEL-LOGICA
Als userType = seeker:
- Gebruik eenvoudige taal
- Geen vakjargon
- Max. 5 stappen
- Standaardbenadering: "ja, dit kan je zelf" — tenzij het aantoonbaar gevaarlijk is
- Leg niet uit hoe iets werkt, alleen wat te doen
- Stel een Handy ALLEEN voor bij RED risico of als het probleem technisch onmogelijk is zonder vakkennis (bijv. elektrische installatie, gasleiding, structurele muur)
- "Twijfel" of "niet zeker" is GEEN reden om een Handy voor te stellen — stel dan gerichte vervolgvragen

Als userType = handy:
- Gebruik technische termen
- Ga dieper waar nuttig (diagnose, oorzaken)
- Minder uitleg, meer precisie
- Focus op: oorzaak → oplossing → risico's
- NOOIT voorstellen om "een andere handy in te schakelen" — de gebruiker IS een professional
- Bij RED: geef een duidelijke waarschuwing over risico's, maar help de professional verder
- next_action mag NOOIT "book_handy" zijn voor handy-gebruikers
- handy_suggestion.suggested moet ALTIJD false zijn voor handy-gebruikers

FOTO-ANALYSE (ALLEEN ALS FOTO AANWEZIG IS)
Als er een foto is:
- Beschrijf objectief wat zichtbaar is
- Geef expliciet aan of je het probleem begrijpt: "vision_confidence": "high" | "medium" | "low"
- Benoem maximaal één hoofdprobleem
- Geef alleen een oplossing als confidence ≠ low
- Duid visueel aan waar het probleem zit met visual_markers (genormaliseerde coordinaten 0-1)

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
  "visual_markers": [
    {
      "type": "circle" | "arrow",
      "x": 0.0-1.0,
      "y": 0.0-1.0,
      "radius": number | null,
      "direction": "up" | "down" | "left" | "right" | null
    }
  ],
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

VISUAL_MARKERS REGELS
- Alleen invullen als er een foto is bijgevoegd
- Coordinaten zijn genormaliseerd: x en y zijn waarden tussen 0.0 en 1.0
- (0,0) is linksboven, (1,1) is rechtsonder
- type "circle": markeer een probleemgebied met x, y en radius (0.01-0.15)
- type "arrow": wijs naar een specifiek punt met x, y en direction
- Maximaal 3 markers
- Bij geen foto of onduidelijke foto: leeg array []

BELANGRIJKE REGELS
- Geen uitleg buiten JSON
- Geen emoji's
- Geen UI-teksten ("klik hier", "bekijk les")
- CTA's worden door de app bepaald, niet door jou
- Als understood = false → geen stappen

BESLISSINGSLOGICA next_action
- "continue_self_fix" → GREEN of YELLOW + understood = true (standaard voor seekers)
- "lesson" → YELLOW herhaalbare taak waarbij een tutorial meerwaarde biedt
- "request_more_info" → vision_confidence = low of vraag is te vaag om te beoordelen
- "book_handy" → UITSLUITEND voor seekers bij RED risico of technisch onmogelijk zonder vakdiploma (gas, elektriciteit, structureel). NOOIT bij gewone twijfel. NOOIT voor handy-gebruikers.

HANDY-SPECIFIEKE REGELS
- Als userType = handy: next_action mag NOOIT "book_handy" zijn
- Als userType = handy: handy_suggestion.suggested moet ALTIJD false zijn
- Als userType = handy en risk_level = RED: gebruik next_action = "continue_self_fix" met duidelijke waarschuwingen in stop_conditions

Je antwoord moet kort, correct en beslissend zijn.
Geef nu uitsluitend het JSON-object terug.`;

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIRequest {
  userType: "seeker" | "handy";
  message: string;
  photo?: string;
  categoryHint: string | null;
  conversationHistory?: ConversationMessage[];
  mode?: "analysis" | "tutorial" | "interactive" | "step-check";
  category?: string;
  riskLevel?: string;
  stepTitle?: string;
  stepNumber?: number;
  totalSteps?: number;
}

interface VisualMarker {
  type: "circle" | "arrow";
  x: number;
  y: number;
  radius: number | null;
  direction: "up" | "down" | "left" | "right" | null;
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
  visual_markers: VisualMarker[];
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
  visual_markers: [],
  suggested_steps: [],
  stop_conditions: ["Bij twijfel, schakel een professional in"],
  next_action: "request_more_info",
  lesson_suggestion: { suggested: false, topic: null },
  handy_suggestion: { suggested: true, reason: "Bij onvoldoende informatie is het veiliger om een expert te raadplegen." },
  explanation_if_uncertain: "Ik kon je vraag niet volledig analyseren. Geef meer details of stuur een foto.",
  disclaimer: "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in."
};

function validateVisualMarkers(markers: unknown): VisualMarker[] {
  if (!Array.isArray(markers)) return [];
  return markers
    .filter((m: any) => 
      m && typeof m.x === "number" && typeof m.y === "number" &&
      (m.type === "circle" || m.type === "arrow") &&
      m.x >= 0 && m.x <= 1 && m.y >= 0 && m.y <= 1
    )
    .slice(0, 3)
    .map((m: any) => ({
      type: m.type,
      x: m.x,
      y: m.y,
      radius: typeof m.radius === "number" ? Math.min(Math.max(m.radius, 0.01), 0.15) : null,
      direction: ["up", "down", "left", "right"].includes(m.direction) ? m.direction : null,
    }));
}

function validateAndFixResponse(data: unknown, userType: string, photoProvided: boolean): AIResponse {
  const response = data as Partial<AIResponse>;
  
  const riskLevel = (["GREEN", "YELLOW", "RED"].includes(response.risk_level || "")) 
    ? response.risk_level as "GREEN" | "YELLOW" | "RED" 
    : "YELLOW";
  
  const understood = response.understood !== undefined ? response.understood : true;
  
  let nextAction: AIResponse["next_action"] = response.next_action || "continue_self_fix";
  if (!["continue_self_fix", "request_more_info", "lesson", "book_handy"].includes(nextAction)) {
    nextAction = riskLevel === "RED" ? (userType === "handy" ? "continue_self_fix" : "book_handy") : understood ? "continue_self_fix" : "request_more_info";
  }
  
  // CRITICAL: Handy users should NEVER get "book_handy" suggestion
  const isHandy = userType === "handy";
  if (isHandy && nextAction === "book_handy") {
    nextAction = "continue_self_fix";
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
    visual_markers: photoProvided ? validateVisualMarkers(response.visual_markers) : [],
    suggested_steps: Array.isArray(response.suggested_steps) ? response.suggested_steps : [],
    stop_conditions: Array.isArray(response.stop_conditions) ? response.stop_conditions : [],
    next_action: nextAction,
    lesson_suggestion: response.lesson_suggestion || { suggested: false, topic: null },
    handy_suggestion: isHandy 
      ? { suggested: false, reason: null }
      : (response.handy_suggestion || { suggested: riskLevel === "RED", reason: riskLevel === "RED" ? "Schakel een professional in." : null }),
    explanation_if_uncertain: response.explanation_if_uncertain || null,
    disclaimer: isHandy 
      ? "Indicatief advies. Beoordeel zelf of verdere actie nodig is."
      : (response.disclaimer || "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in.")
  };
}

// Converteer OpenAI-stijl image_url content naar Anthropic image source formaat
function toAnthropicContent(content: string | Array<any>): string | Array<any> {
  if (typeof content === "string") return content;
  return content.map((item: any) => {
    if (item.type === "image_url" && item.image_url?.url) {
      const url: string = item.image_url.url;
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return {
          type: "image",
          source: {
            type: "base64",
            media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: match[2],
          },
        };
      }
    }
    return item;
  });
}

async function callAI(messages: Array<{ role: string; content: string | Array<any> }>): Promise<{ success: boolean; data?: AIResponse; error?: string }> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not configured");
    return { success: false, error: "AI service niet geconfigureerd" };
  }

  // Anthropic verwacht system als top-level parameter, niet in de messages array
  const systemMessage = messages.find((m) => m.role === "system");
  const conversationMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: toAnthropicContent(m.content) }));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        temperature: 0.2,
        ...(systemMessage ? { system: systemMessage.content as string } : {}),
        messages: conversationMessages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Anthropic API error: ${response.status} - ${errorText}`);

      if (response.status === 429) {
        return { success: false, error: "Te veel verzoeken, probeer het later opnieuw" };
      }
      if (response.status === 401) {
        return { success: false, error: "AI service niet geconfigureerd" };
      }

      return { success: false, error: "AI service tijdelijk niet beschikbaar" };
    }

    const data = await response.json();
    // Anthropic response: data.content[0].text
    const content = data.content?.[0]?.text;

    if (!content) {
      console.error("No content in Anthropic response:", data);
      return { success: false, error: "Geen antwoord ontvangen van AI" };
    }

    let jsonStr = content.trim();

    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
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

const TUTORIAL_SYSTEM_PROMPT = `ROL
Je bent HandyMatch AI Tutorial Generator voor klusproblemen in België.
Je genereert gedetailleerde, stap-voor-stap tutorials voor kluswerkzaamheden.

De input is een probleembeschrijving en optioneel een categorie en risiconiveau.

GEBRUIKERSPROFIEL-LOGICA
Als userType = seeker:
- Eenvoudige taal, geen vakjargon
- Max 7 stappen
- Focus op veiligheid

Als userType = handy:
- Technische termen toegestaan
- Meer detail en precisie
- Diagnose-gerichte stappen

VERPLICHT JSON-FORMAT
Geef uitsluitend dit JSON-object terug:

{
  "tutorial_title": string,
  "tutorial_category": string,
  "risk_level": "GREEN" | "YELLOW" | "RED",
  "estimated_duration": string,
  "tools_needed": string[],
  "materials_needed": string[],
  "steps": [
    {
      "title": string,
      "description": string,
      "tip": string | null,
      "risk_level": "GREEN" | "YELLOW",
      "detailed_explanation": string
    }
  ],
  "when_to_stop": string,
  "disclaimer": "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in."
}

REGELS
- Maximaal 7 stappen
- Elke stap heeft een duidelijke titel, beschrijving, tip en gedetailleerde uitleg
- Tools en materialen moeten specifiek en concreet zijn
- Bij RED risico: geef waarschuwing maar genereer alsnog beperkte veiligheidsstappen
- when_to_stop moet een duidelijke stopconditie bevatten
- Geen uitleg buiten JSON
- Geen emoji's
- estimated_duration in minuten formaat (bijv. "30 minuten")

Je antwoord moet uitsluitend het JSON-object zijn.`;

interface TutorialStep {
  title: string;
  description: string;
  tip: string | null;
  risk_level: "GREEN" | "YELLOW";
  detailed_explanation: string;
}

interface TutorialData {
  tutorial_title: string;
  tutorial_category: string;
  risk_level: "GREEN" | "YELLOW" | "RED";
  estimated_duration: string;
  tools_needed: string[];
  materials_needed: string[];
  steps: TutorialStep[];
  when_to_stop: string;
  disclaimer: string;
}

function validateTutorialResponse(data: unknown, userType: string): TutorialData {
  const response = data as Partial<TutorialData>;
  
  const riskLevel = (["GREEN", "YELLOW", "RED"].includes(response.risk_level || ""))
    ? response.risk_level as "GREEN" | "YELLOW" | "RED"
    : "YELLOW";

  const steps = Array.isArray(response.steps) 
    ? response.steps.slice(0, 7).map((s: any) => ({
        title: s.title || "Stap",
        description: s.description || "",
        tip: s.tip || null,
        risk_level: (["GREEN", "YELLOW"].includes(s.risk_level)) ? s.risk_level : "GREEN",
        detailed_explanation: s.detailed_explanation || s.description || "",
      }))
    : [];

  return {
    tutorial_title: response.tutorial_title || "Tutorial",
    tutorial_category: response.tutorial_category || "Algemeen",
    risk_level: riskLevel,
    estimated_duration: response.estimated_duration || "30 minuten",
    tools_needed: Array.isArray(response.tools_needed) ? response.tools_needed : [],
    materials_needed: Array.isArray(response.materials_needed) ? response.materials_needed : [],
    steps,
    when_to_stop: response.when_to_stop || "Bij twijfel, schakel een professional in.",
    disclaimer: response.disclaimer || "Indicatief advies. Stop bij twijfel of gevaar en schakel een professional in.",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userType, message, photo, categoryHint, conversationHistory, mode, category, riskLevel, stepTitle, stepNumber, totalSteps }: AIRequest = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Bericht is verplicht", fallback: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TUTORIAL MODE
    if (mode === "tutorial") {
      console.log(`Processing tutorial request: userType=${userType}, message=${message}, category=${category}`);
      
      let tutorialContext = userType === "handy" 
        ? "[Context: De gebruiker is een Handy (vakman/klusser)]\n\n"
        : "[Context: De gebruiker is een particulier zonder technische kennis]\n\n";
      
      if (category) tutorialContext += `[Categorie: ${category}]\n\n`;
      if (riskLevel) tutorialContext += `[Risiconiveau van eerste analyse: ${riskLevel}]\n\n`;

      const tutorialMessages = [
        { role: "system", content: TUTORIAL_SYSTEM_PROMPT },
        { role: "user", content: tutorialContext + `Genereer een gedetailleerde tutorial voor het volgende probleem: ${message}` }
      ];

      let result = await callAI(tutorialMessages);

      if (!result.success && result.error === "Ongeldig antwoordformaat") {
        const repairMessages = [
          ...tutorialMessages,
          { role: "assistant", content: "Ik genereer de tutorial..." },
          { role: "user", content: "Return ONLY valid JSON per schema. No prose, no markdown. Just the JSON object." }
        ];
        result = await callAI(repairMessages);
      }

      if (result.success && result.data) {
        const validated = validateTutorialResponse(result.data, userType);
        console.log(`Tutorial response: title=${validated.tutorial_title}, steps=${validated.steps.length}`);
        return new Response(
          JSON.stringify({ ok: true, tutorial: validated }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: false, error: result.error || "Tutorial generatie mislukt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // INTERACTIVE MODE
    if (mode === "interactive") {
      console.log(`Processing interactive request: userType=${userType}, message=${message}, category=${category}`);

      const INTERACTIVE_SYSTEM_PROMPT = `ROL
Je bent HandyMatch AI Interactive Content Generator voor klusproblemen in België.
Je genereert interactieve leerinhoud (quiz, drag-and-drop, simulatie) gerelateerd aan een klusprobleem.

VERPLICHT JSON-FORMAT
Geef uitsluitend dit JSON-object terug:

{
  "quiz": [
    {
      "question": string,
      "options": string[] (4 opties),
      "correct_index": number (0-3),
      "explanation": string
    }
  ],
  "drag_drop": [
    {
      "instruction": string,
      "items": string[] (4-6 items),
      "targets": string[] (2-3 categorieën),
      "correct_mapping": { "item": "target" }
    }
  ],
  "simulation": {
    "title": string,
    "steps": [
      {
        "scenario": string,
        "options": string[] (3 opties),
        "correct_index": number (0-2),
        "feedback_correct": string,
        "feedback_wrong": string
      }
    ]
  }
}

REGELS
- Quiz: 3-5 vragen over het probleem, gereedschap, veiligheid, en juiste aanpak
- Drag-and-drop: 1-2 oefeningen (bijv. gereedschap naar juiste categorie, stappen in juiste volgorde)
- Simulatie: 3-5 stappen die een realistische situatie simuleren
- Taal: ${userType === "handy" ? "technisch" : "eenvoudig, geen vakjargon"}
- Focus op veiligheid en correcte werkwijze
- Geen emoji's
- Alleen het JSON-object, geen uitleg`;

      let interactiveContext = "";
      if (category) interactiveContext += `[Categorie: ${category}]\n`;
      if (riskLevel) interactiveContext += `[Risiconiveau: ${riskLevel}]\n`;

      const interactiveMessages = [
        { role: "system", content: INTERACTIVE_SYSTEM_PROMPT },
        { role: "user", content: interactiveContext + `Genereer interactieve leerinhoud voor het volgende klusprobleem: ${message}` }
      ];

      let result = await callAI(interactiveMessages);

      if (!result.success && result.error === "Ongeldig antwoordformaat") {
        const repairMessages = [
          ...interactiveMessages,
          { role: "assistant", content: "Ik genereer de interactieve content..." },
          { role: "user", content: "Return ONLY valid JSON per schema. No prose, no markdown. Just the JSON object." }
        ];
        result = await callAI(repairMessages);
      }

      if (result.success && result.data) {
        const interactive = result.data as any;
        // Basic validation
        const validated = {
          quiz: Array.isArray(interactive.quiz) ? interactive.quiz.slice(0, 5) : [],
          drag_drop: Array.isArray(interactive.drag_drop) ? interactive.drag_drop.slice(0, 2) : [],
          simulation: {
            title: interactive.simulation?.title || "Stap-voor-stap simulatie",
            steps: Array.isArray(interactive.simulation?.steps) ? interactive.simulation.steps.slice(0, 5) : [],
          },
        };
        console.log(`Interactive response: quiz=${validated.quiz.length}, drag_drop=${validated.drag_drop.length}, sim_steps=${validated.simulation.steps.length}`);
        return new Response(
          JSON.stringify({ ok: true, interactive: validated }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: false, error: result.error || "Interactieve content generatie mislukt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STEP-CHECK MODE
    if (mode === "step-check") {
      console.log(`Processing step-check: step=${stepNumber}/${totalSteps}, title=${stepTitle}`);

      const STEP_CHECK_PROMPT = `ROL
Je bent HandyMatch AR Step Validator. Je beoordeelt of een foto bevestigt dat een doe-het-zelf stap correct is uitgevoerd.

DOEL
Kijk naar de foto en de stapbeschrijving. Bepaal of:
- De gebruiker het juiste onderdeel/gebied in beeld heeft
- De stap zichtbaar correct is uitgevoerd
- Of de gebruiker op het juiste spoor zit

VERPLICHT JSON-FORMAT
Geef uitsluitend dit JSON-object terug:
{
  "correct": boolean,
  "confidence": "high" | "medium" | "low",
  "feedback": string (max 2 zinnen, altijd bemoedigend en concreet),
  "what_is_visible": string (kort, feitelijk: wat zie je op de foto),
  "suggestion": string | null (alleen als correct = false: één concrete aanwijzing wat de gebruiker anders moet doen)
}

REGELS
- correct = true: foto toont bewijs dat de stap klaar is of dat het juiste object zichtbaar is
- correct = false: foto toont iets onrelateerd of de stap is duidelijk nog niet gedaan
- Bij twijfel of lage confidence: correct = true (voordeel van de twijfel)
- feedback is altijd positief, nooit negatief of ontmoedigend
- suggestion is null als correct = true
- Geen uitleg buiten JSON`;

      const photoProvided = !!photo && typeof photo === "string" && photo.length > 0;

      let mimeType = "image/jpeg";
      if (photo?.startsWith("iVBOR")) mimeType = "image/png";
      else if (photo?.startsWith("UklGR")) mimeType = "image/webp";

      const stepContext = `Stap ${stepNumber ?? "?"} van ${totalSteps ?? "?"}: "${stepTitle ?? ""}"\nStapbeschrijving: ${message}`;

      const stepCheckContent = photoProvided
        ? [
            { type: "text", text: stepContext },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${photo}` } },
          ]
        : stepContext;

      const stepCheckMessages = [
        { role: "system", content: STEP_CHECK_PROMPT },
        { role: "user", content: stepCheckContent },
      ];

      let result = await callAI(stepCheckMessages);

      if (!result.success && result.error === "Ongeldig antwoordformaat") {
        const repair = [
          ...stepCheckMessages,
          { role: "assistant", content: "Ik analyseer de foto..." },
          { role: "user", content: "Return ONLY valid JSON. No prose, no markdown. Just the JSON object." },
        ];
        result = await callAI(repair);
      }

      if (result.success && result.data) {
        const sc = result.data as any;
        const validated = {
          correct: typeof sc.correct === "boolean" ? sc.correct : true,
          confidence: ["high", "medium", "low"].includes(sc.confidence) ? sc.confidence : "medium",
          feedback: sc.feedback || "Goed bezig! Ga verder met de volgende stap.",
          what_is_visible: sc.what_is_visible || "",
          suggestion: sc.suggestion || null,
        };
        return new Response(
          JSON.stringify({ ok: true, step_check: validated }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: false, error: result.error || "Stapcontrole mislukt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ANALYSIS MODE (default)
    const photoProvided = !!photo && typeof photo === "string" && photo.length > 0;

    console.log(`Processing AI request: userType=${userType}, message length=${message.length}, photo=${photoProvided}, photo size=${photo ? photo.length : 0}`);

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
      userContext += "[De gebruiker heeft een foto toegevoegd van het probleem]\n\n";
    }

    // Build user message - multimodal if photo present
    let userContent: string | Array<any>;
    if (photoProvided) {
      // Determine mime type from base64 header or default to jpeg
      let mimeType = "image/jpeg";
      if (photo!.startsWith("/9j/")) mimeType = "image/jpeg";
      else if (photo!.startsWith("iVBOR")) mimeType = "image/png";
      else if (photo!.startsWith("R0lGOD")) mimeType = "image/gif";
      else if (photo!.startsWith("UklGR")) mimeType = "image/webp";

      userContent = [
        { type: "text", text: userContext + message },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${photo}` } }
      ];
    } else {
      userContent = userContext + message;
    }

    // Build messages array: system prompt + conversation history + current message
    const history = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-8).map((m) => ({ role: m.role, content: m.content }))
      : [];

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userContent }
    ];

    // First attempt
    let result = await callAI(messages);

    // If parsing failed, try repair call
    if (!result.success && result.error === "Ongeldig antwoordformaat") {
      console.log("Attempting repair call...");

      const repairMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userContent },
        { role: "assistant", content: "Ik zal je vraag analyseren..." },
        { role: "user", content: "Return ONLY valid JSON per schema. No prose, no markdown, no explanation. Just the JSON object." }
      ];

      result = await callAI(repairMessages);
    }

    if (result.success && result.data) {
      const validated = validateAndFixResponse(result.data, userType, photoProvided);
      console.log(`AI response: category=${validated.category}, risk=${validated.risk_level}, next_action=${validated.next_action}, markers=${validated.visual_markers.length}`);
      
      return new Response(
        JSON.stringify({ ok: true, data: validated }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
