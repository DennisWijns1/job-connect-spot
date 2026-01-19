import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diplomaImageUrl, diplomaId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to analyzing
    await supabase
      .from("instructor_diplomas")
      .update({ ai_verification_status: "analyzing" })
      .eq("id", diplomaId);

    // Call AI to analyze the diploma image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `Je bent een expert in het verifiëren van diploma's en certificaten. Analyseer de afbeelding en controleer of het een geldig, erkend diploma of certificaat is.

Je moet de volgende factoren controleren en beoordelen:
1. Diplomanummer - Is er een uniek identificatienummer zichtbaar?
2. Handtekening(en) - Zijn er officiële handtekeningen aanwezig?
3. Stempel/Zegel - Is er een officiële stempel of zegel aanwezig?
4. Officiële instelling - Is de uitgevende instelling herkenbaar en legitiem?
5. Correcte opleidingstitel - Is de opleidingstitel duidelijk vermeld?
6. Datum & plaats - Zijn de uitgiftedatum en plaats vermeld?

Geef je analyse in JSON formaat met de volgende structuur:
{
  "isValid": boolean,
  "overallScore": number (0-100),
  "diplomaNumber": string | null,
  "institution": string | null,
  "trainingTitle": string | null,
  "issueDate": string | null,
  "issuePlace": string | null,
  "hasSignature": boolean,
  "hasStamp": boolean,
  "factors": {
    "diplomaNumber": { "found": boolean, "confidence": number, "notes": string },
    "signatures": { "found": boolean, "confidence": number, "notes": string },
    "stamp": { "found": boolean, "confidence": number, "notes": string },
    "institution": { "found": boolean, "confidence": number, "notes": string },
    "trainingTitle": { "found": boolean, "confidence": number, "notes": string },
    "datePlace": { "found": boolean, "confidence": number, "notes": string }
  },
  "recommendation": "verified" | "needs_review" | "rejected",
  "summary": string
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyseer dit diploma/certificaat en geef een gedetailleerde beoordeling."
              },
              {
                type: "image_url",
                image_url: {
                  url: diplomaImageUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    // Parse the JSON from the AI response
    let verificationResult;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      verificationResult = {
        isValid: false,
        overallScore: 0,
        recommendation: "needs_review",
        summary: "Kon het diploma niet automatisch analyseren. Handmatige review nodig."
      };
    }

    // Determine verification status based on AI recommendation
    let verificationStatus = "needs_review";
    if (verificationResult.recommendation === "verified" && verificationResult.overallScore >= 70) {
      verificationStatus = "verified";
    } else if (verificationResult.recommendation === "rejected" || verificationResult.overallScore < 30) {
      verificationStatus = "rejected";
    }

    // Update the diploma record with verification results
    const { error: updateError } = await supabase
      .from("instructor_diplomas")
      .update({
        ai_verification_status: verificationStatus,
        ai_verification_result: verificationResult,
        ai_verification_score: verificationResult.overallScore / 100,
        diploma_number: verificationResult.diplomaNumber,
        institution: verificationResult.institution,
        training_title: verificationResult.trainingTitle,
        issue_date: verificationResult.issueDate,
        issue_place: verificationResult.issuePlace,
        has_signature: verificationResult.hasSignature,
        has_stamp: verificationResult.hasStamp,
        verified_at: verificationStatus === "verified" ? new Date().toISOString() : null,
      })
      .eq("id", diplomaId);

    if (updateError) {
      console.error("Failed to update diploma:", updateError);
      throw updateError;
    }

    // If verified, update the instructor's diploma_verified status
    if (verificationStatus === "verified") {
      const { data: diplomaData } = await supabase
        .from("instructor_diplomas")
        .select("instructor_id")
        .eq("id", diplomaId)
        .single();

      if (diplomaData) {
        await supabase
          .from("instructors")
          .update({ diploma_verified: true })
          .eq("id", diplomaData.instructor_id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      verificationStatus,
      result: verificationResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
