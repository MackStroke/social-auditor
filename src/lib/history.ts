import { createClient } from "@/lib/supabase/client";

export type AuditResult = {
    id: string; // Unique ID for history
    timestamp: number;
    fileName: string;
    creativeUrl?: string; // Stored as base64 for local display
    platform: string;
    conversionRate: number;
    conversionVsAvg?: number;
    engagementRate: number;
    engagementVsAvg?: number;
    isApproved: boolean;
    strengths: string[];
    improvements: string[];
    heatmapPoints: { x: number; y: number; intensity: number }[];
    visibility: number;
    textLegibility: number;
    textLegibilityReason?: string;
    brandPresence: number;
    brandPresenceReason?: string;
    competitorAnalysis?: {
        industryAverageCtr: number;
        industryAverageConversion: number;
        topPerformersTraits: string[];
        positioningRecommendation: string;
    };
    campaignObjective?: string;
    location?: string;
    gender?: string;
    campaignType?: string;
    objectiveMetrics?: {
        name: string;
        score: number;
        reasoning: string;
    }[];
};

async function getStorageKey(): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return "audit_history_anonymous"; // Fallback, though ideally users shouldn't reach here if routes are protected
    }
    return `audit_history_${user.id}`;
}

export async function getHistory(): Promise<AuditResult[]> {
    if (typeof window === "undefined") return [];
    const storageKey = await getStorageKey();
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
}

export async function saveToHistory(result: AuditResult) {
    if (typeof window === "undefined") return;
    const history = await getHistory();
    const storageKey = await getStorageKey();

    // Keep a maximum of 20, but we will dynamically trim if we hit quota limits
    const updated = [result, ...history].slice(0, 20);

    // Dynamic trimming to handle 5MB localStorage QuotaExceededErrors
    while (updated.length > 0) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            break; // Successfully saved
        } catch (e: any) {
            // If we hit a quota error, remove the oldest history item and try again
            if (e.name === "QuotaExceededError" ||
                e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
                e.message.toLowerCase().includes("quota")) {
                if (updated.length === 1) {
                    console.warn("AuditResult is too large to fit in localStorage by itself. It will not be saved.");
                    break;
                }
                updated.pop(); // Remove the oldest audit result
            } else {
                console.error("Failed to save history:", e);
                break;
            }
        }
    }
}

export async function clearHistory() {
    if (typeof window === "undefined") return;
    const storageKey = await getStorageKey();
    localStorage.removeItem(storageKey);
}
