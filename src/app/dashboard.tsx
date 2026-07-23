"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn, optimizeImage } from "@/lib/utils";
import { getHistory, AuditResult, saveToHistory } from "@/lib/history";
import { trackEvent } from "@/lib/activity-tracker";
import Image from "next/image";
import Select from "@/components/ui/Select";
import MultiSelect from "@/components/ui/MultiSelect";
import MissingKeyModal from "@/components/MissingKeyModal";

export default function Dashboard() {
  const router = useRouter();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [adCopy, setAdCopy] = useState("");
  const [platform, setPlatform] = useState<"Meta" | "Google">("Meta");

  const [complianceCheck, setComplianceCheck] = useState(true);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true);
  const [competitorBenchmark, setCompetitorBenchmark] = useState(false);
  const [copyrightCheck, setCopyrightCheck] = useState(true);
  const [targetAudience, setTargetAudience] = useState("Broad (18-65+)");
  const [campaignObjective, setCampaignObjective] = useState("Awareness");
  const [campaignType, setCampaignType] = useState("Advantage+ Placements (Recommended)");

  // Meta vs Google Objectives
  const metaObjectives = [
    { id: "Awareness", icon: "campaign", desc: "Show your ads to people who are most likely to remember them.", goodFor: ["Reach", "Brand awareness", "Video views"] },
    { id: "Traffic", icon: "ads_click", desc: "Send people to a destination, like your website, app, or profile.", goodFor: ["Link clicks", "Landing page views", "Profile visits"] },
    { id: "Engagement", icon: "forum", desc: "Get more messages, video views, interactions, or event responses.", goodFor: ["Interactions", "Video views", "Messages", "Calls"] },
    { id: "Leads", icon: "filter_alt", desc: "Collect leads for your business or brand.", goodFor: ["Instant forms", "Conversions", "Calls"] },
    { id: "App promotion", icon: "groups", desc: "Find new people to install your app and continue using it.", goodFor: ["App installs", "App events"] },
    { id: "Sales", icon: "local_mall", desc: "Find people likely to purchase your product or service.", goodFor: ["Catalog sales", "Conversions", "Calls"] }
  ];

  const googleObjectives = [
    { id: "Sales", icon: "sell", desc: "Drive sales online, in app, by phone or in store", goodFor: ["Conversions", "ROAS", "CPA"] },
    { id: "Leads", icon: "group_add", desc: "Get leads and other conversions by encouraging customers to take action", goodFor: ["Conversions", "CPA"] },
    { id: "Website traffic", icon: "ads_click", desc: "Get the right people to visit your website", goodFor: ["Clicks", "CTR", "CPC"] },
    { id: "App promotion", icon: "get_app", desc: "Get more installs, engagement and pre-registration for your app", goodFor: ["Installs", "App interactions"] },
    { id: "Awareness and consideration", icon: "campaign", desc: "Reach a broad audience and build interest in your products or brand", goodFor: ["Reach", "Impressions", "Video views"] },
    { id: "Local shop visits and promotions", icon: "storefront", desc: "Drive visits to local shops, including restaurants and dealerships.", goodFor: ["Store visits", "Local actions"] },
    { id: "Create a campaign without guidance", icon: "settings", desc: "You'll choose a campaign next", goodFor: ["Custom Metrics"] }
  ];

  const currentObjectives = platform === "Meta" ? metaObjectives : googleObjectives;

  useEffect(() => {
    if (platform === "Meta") {
      setCampaignType("Advantage+ Placements (Recommended)");
      if (!metaObjectives.find(o => o.id === campaignObjective)) {
        setCampaignObjective("Awareness");
      }
    } else {
      setCampaignType("Performance Max");
      if (!googleObjectives.find(o => o.id === campaignObjective)) {
        setCampaignObjective("Sales");
      }
    }
  }, [platform]);
  const [location, setLocation] = useState<string[]>(["India (All States & UTs)"]);
  const [gender, setGender] = useState("All");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [recentAudits, setRecentAudits] = useState<AuditResult[]>([]);
  const [showMissingKey, setShowMissingKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getHistory().then((history) => setRecentAudits(history.slice(0, 3)));
  }, []);

  const handleFileDropdown = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const setupFile = async (selectedFile: File) => {
    const processed = await optimizeImage(selectedFile);
    setFile(processed);
    setPreviewUrl(URL.createObjectURL(processed));
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAudit = async () => {
    if (!file) return;

    // Gate behind API key check
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setShowMissingKey(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const customKey = localStorage.getItem("gemini_api_key") || "";

        const res = await fetch("/api/audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(customKey && { "Authorization": `Bearer ${customKey}` })
          },
          body: JSON.stringify({
            image: base64data,
            copy: adCopy,
            platform,
            complianceCheck,
            sentimentAnalysis,
            competitorBenchmark,
            copyrightCheck,
            targetAudience,
            campaignObjective,
            campaignType,
            location: location.join(", "),
            gender,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }

        const data = await res.json();
        const auditId = Date.now().toString();

        const fullResult: AuditResult = {
          ...data,
          id: auditId,
          timestamp: Date.now(),
          fileName: file.name,
          creativeUrl: base64data,
          platform,
        };

        await saveToHistory(fullResult);
        trackEvent('audit', { platform, campaignObjective });
        router.push(`/reports?id=${auditId}`);
      };
    } catch (error: any) {
      console.error(error);
      alert("Analysis failed: " + error.message);
      setIsAnalyzing(false);
    }
  };

  const generateAdCopy = async () => {
    // Gate behind API key check
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setShowMissingKey(true);
      return;
    }

    setIsGeneratingCopy(true);
    setAdCopy("Generating AI copy...");
    try {
      let base64data = "";
      if (file) {
        // Read file if it exists to give AI context
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => (reader.onload = resolve));
        base64data = reader.result as string;
      }

      const customKey = localStorage.getItem("gemini_api_key") || "";

      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey && { "Authorization": `Bearer ${customKey}` })
        },
        body: JSON.stringify({
          platform,
          targetAudience,
          campaignObjective,
          image: base64data || null
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setAdCopy(data.copy);
      trackEvent('generate_copy', { platform, campaignObjective });
    } catch (error: any) {
      console.error(error);
      setAdCopy("");
      alert("Failed to generate copy: " + error.message);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  return (
    <>
      <MissingKeyModal isOpen={showMissingKey} onClose={() => setShowMissingKey(false)} />
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

      <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-5xl mx-auto z-10 flex flex-col gap-6 md:gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">New Creative Audit</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg">
              Upload your visual assets and ad copy. Our AI will analyze performance potential across Meta and Google networks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              AI Model v4.2 Active
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="mb-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Platform Selector */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 block">Select Platform <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer group">
                  <input
                    checked={platform === "Meta"}
                    onChange={() => setPlatform("Meta")}
                    className="peer sr-only"
                    name="platform"
                    type="radio"
                  />
                  <div className="flex items-center justify-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 peer-checked:bg-[#1877F2]/10 peer-checked:border-[#1877F2] peer-checked:ring-1 peer-checked:ring-[#1877F2] transition-all">
                    <svg className="w-6 h-6 text-slate-400 peer-checked:text-[#1877F2] fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5.01 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                    </svg>
                    <span className="font-medium text-slate-600 dark:text-slate-200 peer-checked:text-slate-900 dark:peer-checked:text-white">Meta Ads</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity text-[#1877F2]">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                </label>
                <label className="relative cursor-pointer group">
                  <input
                    checked={platform === "Google"}
                    onChange={() => setPlatform("Google")}
                    className="peer sr-only"
                    name="platform"
                    type="radio"
                  />
                  <div className="flex items-center justify-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 peer-checked:bg-[#EA4335]/10 peer-checked:border-[#EA4335] peer-checked:ring-1 peer-checked:ring-[#EA4335] transition-all">
                    <svg className="w-6 h-6 text-slate-400 peer-checked:text-[#EA4335] fill-current" viewBox="0 0 24 24">
                      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.25 5 12s3.36-7.27 7.2-7.27c1.61 0 3.09.59 4.23 1.67l2.18-2.18C17.27 2.93 14.94 2 12.2 2 6.57 2 2 6.57 2 12s4.57 10 10.2 10c5.38 0 9.77-3.95 9.77-10 0-.74-.08-1.5-.22-2.9Z" />
                    </svg>
                    <span className="font-medium text-slate-600 dark:text-slate-200 peer-checked:text-slate-900 dark:peer-checked:text-white">Google Ads</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity text-[#EA4335]">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Campaign Objective Selector */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-4 block">Choose a campaign objective <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-1">
                {currentObjectives.map((objective) => (
                  <div key={objective.id} className={cn("rounded-xl border transition-all", campaignObjective === objective.id ? "bg-slate-50 dark:bg-white/5 border-primary/30" : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5")}>
                    <label className="cursor-pointer group flex items-start gap-4 p-3">
                      <input
                        checked={campaignObjective === objective.id}
                        onChange={() => setCampaignObjective(objective.id)}
                        className="peer sr-only"
                        name="campaignObjective"
                        type="radio"
                      />
                      <div className={cn("mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors", campaignObjective === objective.id ? "border-primary" : "border-slate-300 dark:border-slate-500")}>
                        <div className={cn("w-2.5 h-2.5 rounded-full bg-primary transition-opacity", campaignObjective === objective.id ? "opacity-100" : "opacity-0")} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-300 shrink-0">
                            <span className="material-symbols-outlined text-[18px]">{objective.icon}</span>
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 peer-checked:text-slate-900 dark:peer-checked:text-white transition-colors">{objective.id}</span>
                        </div>
                        {campaignObjective === objective.id && (
                          <div className="mt-4 pb-1 pl-11 pr-2 animate-in slide-in-from-top-2 fade-in duration-300">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{objective.desc}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Good for:</p>
                            <ul className="flex flex-wrap gap-2">
                              {objective.goodFor.map((tag, i) => (
                                <li key={i} className="text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div className="relative group cursor-pointer" onDragOver={(e) => e.preventDefault()} onDrop={handleFileDropdown} onClick={() => !previewUrl && fileInputRef.current?.click()}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-indigo-600/30 dark:to-purple-600/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-white/50 dark:bg-surface-glass backdrop-blur-md px-6 py-12 transition-all hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary/50 overflow-hidden",
                previewUrl ? "min-h-[280px] p-0 border-primary/50" : ""
              )}>
                {previewUrl ? (
                  <>
                    <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                    <button onClick={clearFile} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition-colors z-10">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 rounded-full bg-primary/10 p-4 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload Creative <span className="text-red-500">*</span></h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6 max-w-xs">
                      Drag &amp; drop your images here, or <span className="text-primary hover:underline">browse files</span>.
                    </p>
                    <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                      <span>JPG</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600 self-center" />
                      <span>PNG</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600 self-center" />
                      <span>WEBP</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600 self-center" />
                      <span>AVIF</span>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setupFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* Text Input */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex justify-between items-center">
                <span>Ad Copy / Primary Text</span>
                <span className="text-xs text-slate-500 font-normal">{adCopy.length} characters</span>
              </label>
              <textarea
                value={adCopy}
                onChange={(e) => setAdCopy(e.target.value)}
                className="w-full h-32 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all text-sm leading-relaxed"
                placeholder="Enter the primary text, headline, or script for your ad creative here..."
              />
              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  onClick={generateAdCopy}
                  disabled={isGeneratingCopy}
                  className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors group disabled:opacity-50"
                >
                  <span className="relative flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current animate-pulse duration-[3000ms]" viewBox="0 0 24 24">
                      <path d="M11.5 0l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2z" />
                      <path d="M4.5 14.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" className="origin-center scale-75 opacity-70 group-hover:animate-spin" />
                      <path d="M19.5 3.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" className="origin-center scale-50 opacity-80" />
                    </svg>
                  </span>
                  {isGeneratingCopy ? "Generating..." : "Generate with AI"}
                </button>
                <button type="button" onClick={() => setAdCopy("")} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Clear text
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Summary/Action */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Analysis Settings Card */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl h-full flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span> Audit Parameters
              </h3>

              <div className="space-y-6 flex-1">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Compliance Check</span>
                    <span className="text-xs text-slate-500">Check against policy violations</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={complianceCheck} onChange={(e) => setComplianceCheck(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
                {/* Toggle 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Sentiment Analysis</span>
                    <span className="text-xs text-slate-500">Detect emotional tone</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={sentimentAnalysis} onChange={(e) => setSentimentAnalysis(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
                {/* Toggle 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Competitor Benchmark</span>
                    <span className="text-xs text-slate-500">Compare with top performers</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={competitorBenchmark} onChange={(e) => setCompetitorBenchmark(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
                {/* Toggle 4 */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Copyright Checker</span>
                    <span className="text-xs text-slate-500">Scan for restricted assets/music</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={copyrightCheck} onChange={(e) => setCopyrightCheck(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="targetAudience" className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience <span className="text-red-500">*</span></label>
                    <Select
                      id="targetAudience"
                      value={targetAudience}
                      onChange={setTargetAudience}
                      options={["Broad (18-65+)", "Young Adults (18-35)", "Professionals (25-50)", "Seniors (60+)"]}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <label htmlFor="campaignType" className="text-sm font-medium text-slate-700 dark:text-slate-300">Campaign Type <span className="text-red-500">*</span></label>
                    <Select
                      id="campaignType"
                      value={campaignType}
                      onChange={setCampaignType}
                      options={platform === "Google" ? [
                        { label: "Performance Max", value: "Performance Max", icon: <span className="material-symbols-outlined text-base">auto_awesome</span> },
                        { label: "Search", value: "Search", icon: <span className="material-symbols-outlined text-base">search</span> },
                        { label: "Demand Gen", value: "Demand Gen", icon: <span className="material-symbols-outlined text-base">trending_up</span> },
                        { label: "Video", value: "Video", icon: <span className="material-symbols-outlined text-base">play_circle</span> },
                        { label: "Display", value: "Display", icon: <span className="material-symbols-outlined text-base">web</span> },
                        { label: "Shopping", value: "Shopping", icon: <span className="material-symbols-outlined text-base">shopping_bag</span> }
                      ] : [
                        { label: "Advantage+ Placements", value: "Advantage+ Placements (Recommended)", icon: <span className="material-symbols-outlined text-base">auto_awesome</span> },
                        { label: "Feeds", value: "Feeds (Facebook & Instagram)", icon: <span className="material-symbols-outlined text-base">feed</span> },
                        { label: "Stories & Reels", value: "Stories & Reels", icon: <span className="material-symbols-outlined text-base">amp_stories</span> },
                        { label: "In-Stream Videos", value: "In-Stream Videos", icon: <span className="material-symbols-outlined text-base">smart_display</span> },
                        { label: "Search Results", value: "Search Results", icon: <span className="material-symbols-outlined text-base">manage_search</span> }
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <label htmlFor="location" className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                    <MultiSelect
                      id="location"
                      value={location}
                      onChange={setLocation}
                      options={["India (All States & UTs)", "Tier 1 Cities (India)", "Tier 2 & 3 Cities (India)", "North India", "South India", "East India", "West India", "Worldwide"]}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <label htmlFor="gender" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
                    <Select
                      id="gender"
                      value={gender}
                      onChange={setGender}
                      options={["All", "Male", "Female"]}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleAudit}
                  disabled={!file || isAnalyzing}
                  className="relative w-full group overflow-hidden rounded-lg bg-primary p-px font-bold text-white shadow-lg shadow-primary/20 dark:shadow-[0_0_20px_rgba(0,131,5,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(0,131,5,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-center justify-center gap-2 rounded-[7px] bg-slate-900 bg-opacity-0 dark:bg-opacity-10 px-6 py-4 transition-all duration-300 group-hover:bg-opacity-0">
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Analysis</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </div>
                </button>

                {/* AI Disclaimer */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">info</span>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Results are generated using advanced AI models and may produce inaccurate or mistaken insights based on the context provided. Real-world ad performance can vary substantially. <strong className="font-semibold text-slate-700 dark:text-slate-300">We do not use your data or uploaded creatives to train our AI models.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quick History */}
        {recentAudits.length > 0 && (
          <div className="mt-4">
            <h4 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Recent Audits</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentAudits.map((audit) => (
                <div
                  key={audit.id}
                  onClick={() => router.push(`/reports?id=${audit.id}`)}
                  className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 p-4 rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group shadow-sm dark:shadow-none"
                >
                  <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors overflow-hidden relative shrink-0">
                    {audit.creativeUrl ? (
                      <Image src={audit.creativeUrl} alt="Thumb" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <span className="material-symbols-outlined absolute z-10">image</span>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium truncate">{audit.fileName || "Audit"}</span>
                    <span className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full", audit.isApproved ? "bg-green-400" : "bg-yellow-400")} />
                      Score: {(audit.conversionRate + audit.engagementRate) / 2}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
