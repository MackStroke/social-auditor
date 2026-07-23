import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const clientKey = req.headers.get("Authorization")?.replace("Bearer ", "");
        const apiKey = clientKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing Gemini API Key." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const body = await req.json();
        const { imageA, imageB, audienceContext } = body;

        if (!imageA || !imageB) {
            return NextResponse.json({ error: "Both Creative A and Creative B are required for an A/B test." }, { status: 400 });
        }

        // Convert base64 Data URLs
        const base64DataA = imageA.split(",")[1];
        const mimeTypeA = imageA.split(";")[0].split(":")[1];

        const base64DataB = imageB.split(",")[1];
        const mimeTypeB = imageB.split(";")[0].split(":")[1];

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an elite Digital Ads Creative Strategist.
Task: Perform a strict A/B test comparison of the two provided visuals (Creative A is image 1, Creative B is image 2).

PARAMETERS:
- Target Context/Audience: ${audienceContext || "General Broad Audience"}

INSTRUCTIONS:
Analyze both creatives side-by-side. 
Determine definitively which one will have a higher Conversion Rate and CTR based on direct-response marketing principles (visual hierarchy, hook strength, clarity, emotional resonance, rule-of-thirds).

Return a raw JSON object (NO markdown formatting, NO backticks).

Your JSON must exactly match this interface:
{
  "winner": "A" | "B", // Definitively declare a winner
  "scoreA": number, // 0-100 rating for Creative A's potential
  "scoreB": number, // 0-100 rating for Creative B's potential
  "reasoning": string, // A detailed, 2-3 sentence strategic explanation of EXACTLY why the winner beat the loser. Be specific about visual elements.
  "metrics": [
    // 3 comparative points
    { "factor": "Visual Clarity", "winner": "A" | "B" | "Tie" },
    { "factor": "Hook Strength", "winner": "A" | "B" | "Tie" },
    { "factor": "Brand Trust & Polish", "winner": "A" | "B" | "Tie" }
  ]
}
`;

        // Generate content providing both images sequentially
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64DataA, mimeType: mimeTypeA } }, // Image 1 (A)
            { inlineData: { data: base64DataB, mimeType: mimeTypeB } }  // Image 2 (B)
        ]);

        const targetText = result.response.text();

        // Clean any markdown formatting
        const jsonStr = targetText.replace(/```json/gi, '').replace(/```/g, '').trim();

        const testData = JSON.parse(jsonStr);

        return NextResponse.json(testData, { status: 200 });
    } catch (error: any) {
        console.error("A/B Test API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to compare creatives" }, { status: 500 });
    }
}
