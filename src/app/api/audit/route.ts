import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API (Uses user's API Key from Authorization header)
export const maxDuration = 60; // Allow more time for Next.js AI processing

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key. Please enter your Gemini API Key in Settings." }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { image, copy, platform, complianceCheck, sentimentAnalysis, competitorBenchmark, copyrightCheck, targetAudience, campaignObjective, campaignType, location, gender } = body;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Convert base64 Data URL to a format Gemini accepts
    const base64Data = image.split(",")[1];
    const mimeType = image.split(";")[0].split(":")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an elite Creative Strategist.
Task: Audit this visual creative and ad copy for a ${platform} Ad.

AD COPY:
"""
${copy || "No copy provided, pure visual ad."}
"""

PARAMETERS:
- Campaign Objective: ${campaignObjective || "Not specified, evaluate general performance"}
- Campaign Type (Placement): ${campaignType || "Auto"}
- Target Audience: ${targetAudience || "Broad"}
- Location: ${location || "India"}
- Gender: ${gender || "All"}
- Compliance Check: ${complianceCheck ? "Yes. Check against general meta/google ad policies (no adult content, misleading claims, etc). If violating, note it in improvements." : "No."}
- Copyright Check: ${copyrightCheck ? "Yes. Flag any potentially copyrighted music, logos, assets, or personalities that require licensing." : "No."}
- Sentiment Analysis: ${sentimentAnalysis ? "Yes. Determine emotional tone and if it aligns with the imagery." : "No."}
- Competitor Benchmark: ${competitorBenchmark ? `Yes. You MUST include the 'competitorAnalysis' object.
  1. Estimate the exact industryAverageCtr and industryAverageConversion for the given platform/audience.
  2. Document 2 to 3 visual/copy topPerformersTraits that winning competitors use in this exact niche.
  3. Give a 1 to 2 sentence positioningRecommendation to beat the competition.` : "No."}

OBJECTIVE KPI INSTRUCTIONS:
Based on the Campaign Objective (${campaignObjective}), generate 2 to 3 'objectiveMetrics' that evaluate specific KPIs. Use these EXACT KPI names for the corresponding objective:
- Awareness (Meta): "Reach", "Brand awareness", "Video views"
- Traffic (Meta): "Link clicks", "Landing page views", "Profile visits"
- Engagement (Meta): "Interactions", "Video views", "Messages"
- Leads (Meta): "Instant forms", "Conversions", "Lead quality"
- App promotion (Meta / Google): "App installs", "App events"
- Sales (Meta / Google): "Catalog sales", "Conversions", "ROAS"
- Website traffic (Google): "Clicks", "Landing page views", "CTR"
- Awareness and consideration (Google): "Reach", "Brand awareness", "Video views"
- Local shop visits and promotions (Google): "Store visits", "Directions clicks", "Call clicks"
- Create a campaign without guidance (Google): "Custom Metrics"

Return a raw JSON object (NO markdown formatting, just {"conversionRate":...}).

Your JSON must exactly match this interface:
{
  "conversionRate": number, // Estimate the conversion capability (0-100).
  "conversionVsAvg": number, // Estimated percentage point difference vs industry average (-50 to +50).
  "engagementRate": number, // Estimate the hook rate (0-100).
  "engagementVsAvg": number, // Estimated percentage point difference vs industry average (-50 to +50).
  "isApproved": boolean, // True if both scores are >= 90%.
  "strengths": string[], // A comprehensive, detailed list of ALL notable specific bullet points (no maximum limit).
  "improvements": string[], // A comprehensive list of ALL actionable steps, considering the parameters above (no maximum limit).
  "visibility": number, // Overall visual clarity/visibility score (0-100).
  "textLegibility": number, // Text readability score (0-100).
  "textLegibilityReason": string, // 1 to 2 short sentences explaining the text readability score and contrast.
  "brandPresence": number, // Brand/Logo prominence score (0-100).
  "brandPresenceReason": string, // 1 to 2 short sentences explaining the brand/logo presence score and placement.
  "competitorAnalysis": { // ONLY IF Competitor Benchmark is Yes.
    "industryAverageCtr": number, // Raw number like 1.2
    "industryAverageConversion": number, // Raw number like 3.5
    "topPerformersTraits": string[], // 2-3 traits of winning ads in this niche
    "positioningRecommendation": string // 1-2 sentence recommendation
  },
  "objectiveMetrics": [ // REQUIRED: 2 to 3 metrics based on the Campaign Objective.
    { 
      "name": string, // E.g., "Link clicks", "Reach"
      "score": number, // Objective specific predicted success rate 0-100
      "reasoning": string // 1 sentence explaining why it got this score
    }
  ],
  "heatmapPoints": [ // Array of exactly 5 points for visual focal points.
    { "x": number, "y": number, "intensity": number } // x, y (0-100), intensity (0.0-1.0)
  ]
}
`;
    // Generate content using text and the image part
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const targetText = result.response.text();
    console.log("Gemini Response:", targetText);

    // Clean any markdown formatting from the response
    const jsonStr = targetText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Parse the JSON representation of the result
    const auditData = JSON.parse(jsonStr);

    // Attach the objective parameter back to the return object so the client knows what it was compared against
    auditData.campaignObjective = campaignObjective;
    auditData.location = location;
    auditData.gender = gender;

    return NextResponse.json(auditData, { status: 200 });
  } catch (error: any) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze ad" }, { status: 500 });
  }
}
