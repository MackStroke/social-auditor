import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");

        if (!apiKey) {
            return NextResponse.json({ error: "Missing Gemini API Key. Please enter your Gemini API Key in Settings." }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const body = await req.json();
        const { platform, targetAudience, campaignObjective, image } = body;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an expert Social Media Ad Copywriter.
Write exactly ONE primary text/caption for an ad with the following constraints:
- Platform: ${platform}
- Target Audience: ${targetAudience}
- Objective: ${campaignObjective}
- Hook them immediately in the first sentence.
- Include a clear Call to Action (CTA) at the end.
- Keep it under 280 characters if possible.
- Do NOT use emojis if Platform is Google. You MAY use 1-2 emojis if Platform is Meta.
- Do not include quotes around the text. Just return the raw copy.
`;

        // If an image was provided, pass it as context
        const contentPayload: any[] = [prompt];

        if (image) {
            const base64Data = image.split(",")[1];
            const mimeType = image.split(";")[0].split(":")[1];
            contentPayload.push({ inlineData: { data: base64Data, mimeType } });
        }

        const result = await model.generateContent(contentPayload);
        const copyText = result.response.text().trim();

        return NextResponse.json({ copy: copyText }, { status: 200 });
    } catch (error: any) {
        console.error("Generate Copy API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate copy" }, { status: 500 });
    }
}
