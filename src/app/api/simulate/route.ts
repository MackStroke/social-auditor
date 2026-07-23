import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow more time for Next.js AI processing

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");

        if (!apiKey) {
            return NextResponse.json({ error: "Missing Gemini API Key. Please enter your Gemini API Key in Settings." }, { status: 401 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const body = await req.json();
        const {
            campaignObjective,
            buyingType,
            budgetStrategy,
            conversionLocation,
            performanceGoal,
            costPerResultGoal,
            valueRules,
            attributionModel,
            startDate,
            endDate,
            advantagePlusAudience,
            locations,
            engagedAudience,
            existingCustomers,
            budgetType,
            budget,
            amountSpent,
            attributionSetting,
            bidStrategy,
            frequencyCap,
            adFormat,
            creativeSource,
            destinationUrl
        } = body;

        if (!budget || !campaignObjective) {
            return NextResponse.json({ error: "Budget and Campaign Objective are required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an elite Media Buyer and Data Analyst.
Task: Predict the final performance outcome of a digital ad campaign based on the provided parameters.

PARAMETERS:
- Campaign Objective: ${campaignObjective}
${buyingType ? `- Buying Type: ${buyingType}` : ''}
${budgetStrategy ? `- Budget Strategy: ${budgetStrategy}` : ''}
${conversionLocation ? `- Conversion Location: ${conversionLocation}` : ''}
${performanceGoal ? `- Performance Goal: ${performanceGoal}` : ''}
${costPerResultGoal && bidStrategy === "Cost per result goal" ? `- Target Cost Per Result (Goal): ₹${costPerResultGoal}` : ''}
${valueRules ? `- Value Rules: ${valueRules}` : ''}
${attributionModel ? `- Attribution Model: ${attributionModel}` : ''}
- Budget Type: ${budgetType || "Lifetime budget"}
- Total Budget: ₹${budget}
- Amount Spent to Date: ₹${amountSpent || 0}
${startDate ? `- Start Date: ${startDate}` : ''}
${endDate ? `- End Date: ${endDate}` : ''}
${advantagePlusAudience !== undefined ? `- Advantage+ Audience: ${advantagePlusAudience ? "ON" : "OFF"}` : ''}
${locations ? `- Locations (Inclusion): ${locations}` : ''}
- Attribution Setting: ${attributionSetting || "N/A (Not relevant for objective)"}
- Bid Strategy: ${bidStrategy || "Highest Volume / Auto-bid"}
- Frequency Cap: ${frequencyCap || "N/A"}
${engagedAudience ? `- Engaged Audience: ${engagedAudience}` : ''}
${existingCustomers ? `- Existing Customers: ${existingCustomers}` : ''}
${adFormat ? `- Ad Format: ${adFormat}` : ''}
${creativeSource ? `- Creative Source: ${creativeSource}` : ''}
${destinationUrl ? `- Destination Tracking URL: ${destinationUrl}` : ''}

INSTRUCTIONS:
Calculate realistic, industry-standard estimates for this campaign based on the specified Objective in INR.
- If objective is "Sales", results should be count of purchases. CPA is usually higher (₹1200-₹6500).
- If objective is "Traffic", results should be link clicks. CPC is usually lower (₹30-₹150).
- If objective is "Awareness", results should be reach/impressions. CPM relies heavily on audience width.
- Use logical formulas: Impressions = Budget / (CPM/1000). Results = Budget / CPA.
- Infer a realistic CPM (Cost Per 1000 Impressions) for the math.
- Make 'Ends' field relative to when the budget would mathematically conclude based on typical daily spend rates. 

Return a raw JSON object (NO markdown formatting).

Your JSON must exactly match this interface:
{
  "results": number, // Estimated volume of the primary objective 
  "resultType": string, // What the result actually is (e.g., "Purchases", "Link Clicks", "Leads")
  "costPerResult": number, // Estimated CPA/CPC in INR
  "impressions": number, // Estimated total impressions
  "reach": number, // Estimated total unique reach
  "ends": string, // E.g., "In 14 days", "In 30 days"
  "strategicNote": string // 2 sentences evaluating if the budget and strategy align well with the objective.
}
`;

        const result = await model.generateContent([prompt]);
        const targetText = result.response.text();

        // Clean any markdown formatting from the response
        const jsonStr = targetText.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Parse the JSON representation of the result
        const simulationData = JSON.parse(jsonStr);

        return NextResponse.json(simulationData, { status: 200 });
    } catch (error: any) {
        console.error("Simulation API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to simulate campaign" }, { status: 500 });
    }
}
