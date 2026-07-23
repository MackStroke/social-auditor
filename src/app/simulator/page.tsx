"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/activity-tracker";
import Select from "@/components/ui/Select";
import MissingKeyModal from "@/components/MissingKeyModal";

interface SimulationResult {
    results: number;
    resultType: string;
    costPerResult: number;
    impressions: number;
    reach: number;
    ends: string;
    strategicNote: string;
}

export default function Simulator() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SimulationResult | null>(null);
    const [showMissingKey, setShowMissingKey] = useState(false);

    const [campaignObjective, setCampaignObjective] = useState("Sales");
    const [buyingType, setBuyingType] = useState("Auction");
    const [budgetStrategy, setBudgetStrategy] = useState("Campaign budget");
    const [budgetType, setBudgetType] = useState("Daily budget");
    const [budget, setBudget] = useState("5000");
    const [amountSpent, setAmountSpent] = useState("0");
    const [attributionSetting, setAttributionSetting] = useState("7-day click or 1-day view");
    const [bidStrategy, setBidStrategy] = useState("Highest volume");
    const [frequencyCap, setFrequencyCap] = useState("1 impression every 7 days");

    // Detailed Sales Objective State
    const [conversionLocation, setConversionLocation] = useState("Website");
    const [performanceGoal, setPerformanceGoal] = useState("Maximize number of conversions");
    const [costPerResultGoal, setCostPerResultGoal] = useState("");
    const [valueRules, setValueRules] = useState("None");
    const [attributionModel, setAttributionModel] = useState("Standard");
    const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; });
    const [endDate, setEndDate] = useState("");
    const [advantagePlusAudience, setAdvantagePlusAudience] = useState(true);
    const [locations, setLocations] = useState("India");

    // Audience segment reporting state
    const [engagedAudience, setEngagedAudience] = useState("Not defined");
    const [existingCustomers, setExistingCustomers] = useState("Not defined");

    // Form Tabs
    const [activeTab, setActiveTab] = useState("Campaign");

    // Ads Mock State
    const [adFormat, setAdFormat] = useState("Single image or video");
    const [creativeSource, setCreativeSource] = useState("Manual upload");
    const [destinationUrl, setDestinationUrl] = useState("");

    // Dynamic Options Based on Objective
    const showAttribution = ["Leads", "App promotion", "Sales"].includes(campaignObjective);
    const showFrequency = campaignObjective === "Awareness";
    const isSales = campaignObjective === "Sales";

    let bidStrategyOptions = ["Highest volume", "Cost per result goal", "ROAS goal", "Bid cap"];
    if (campaignObjective === "Awareness") {
        bidStrategyOptions = ["Highest volume", "Reach Target"];
    } else if (["Traffic", "Engagement"].includes(campaignObjective)) {
        bidStrategyOptions = ["Highest volume", "Cost per result goal"];
    } else if (["Leads", "App promotion"].includes(campaignObjective)) {
        bidStrategyOptions = ["Highest volume", "Cost per result goal", "Bid cap"];
    }

    // Effect to reset incompatible selections
    useEffect(() => {
        if (!bidStrategyOptions.includes(bidStrategy)) {
            setBidStrategy(bidStrategyOptions[0]);
        }
    }, [campaignObjective, bidStrategy, bidStrategyOptions]);

    
    const renderBudgetAndBid = () => (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
                <label htmlFor="totalBudget" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">
                    {isSales ? "Budget Mode" : "Budget"} <span className="material-symbols-outlined text-[10px] ml-1 inline-block translate-y-0.5">info</span>
                </label>
                <div className="flex gap-0">
                    <div className="w-1/2">
                        <Select
                            id="budgetType"
                            value={budgetType}
                            onChange={setBudgetType}
                            options={["Daily budget", "Lifetime budget"]}
                            className="rounded-l-lg rounded-r-none border-r-0"
                        />
                    </div>
                    <div className="w-1/2 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                        <input
                            id="totalBudget"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-r-lg p-3 pl-8 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {budgetType === "Lifetime budget" && (
                <div>
                    <label htmlFor="amountSpent" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Amount Spent to Date (₹)</label>
                    <input
                        id="amountSpent"
                        type="number"
                        value={amountSpent}
                        onChange={(e) => setAmountSpent(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            )}

            <div>
                <label htmlFor="bidStrategy" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">
                    {isSales ? "Campaign bid strategy" : "Bid Strategy"}
                </label>
                <Select
                    id="bidStrategy"
                    value={bidStrategy}
                    onChange={setBidStrategy}
                    options={bidStrategyOptions}
                />
                {isSales && (
                    <p className="text-[10px] text-slate-500 mt-2 ml-1">How we\'ll bid in ad auctions.</p>
                )}
            </div>

            {bidStrategy === "Cost per result goal" && isSales && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="costPerResultGoal" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Cost per result goal (₹)</label>
                    <input
                        id="costPerResultGoal"
                        type="number"
                        value={costPerResultGoal}
                        onChange={(e) => setCostPerResultGoal(e.target.value)}
                        placeholder="Eg: 120"
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            )}
        </div>
    );


    const runSimulation = async () => {
        // Gate behind API key check
        const apiKey = localStorage.getItem("gemini_api_key");
        if (!apiKey) {
            setShowMissingKey(true);
            return;
        }

        setLoading(true);
        setData(null);

        try {
            const customKey = apiKey;

            const res = await fetch("/api/simulate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(customKey && { "Authorization": `Bearer ${customKey}` })
                },
                body: JSON.stringify({
                    campaignObjective,
                    buyingType: isSales ? buyingType : undefined,
                    budgetStrategy: isSales ? budgetStrategy : undefined,
                    conversionLocation: isSales ? conversionLocation : undefined,
                    performanceGoal: isSales ? performanceGoal : undefined,
                    costPerResultGoal: isSales && bidStrategy === "Cost per result goal" ? Number(costPerResultGoal) : undefined,
                    valueRules: isSales ? valueRules : undefined,
                    attributionModel: isSales ? attributionModel : undefined,
                    startDate: isSales ? startDate : undefined,
                    endDate: isSales ? endDate : undefined,
                    advantagePlusAudience: isSales ? advantagePlusAudience : undefined,
                    locations: isSales ? locations : undefined,
                    engagedAudience: isSales ? engagedAudience : undefined,
                    existingCustomers: isSales ? existingCustomers : undefined,
                    budgetType,
                    budget: Number(budget),
                    amountSpent: Number(amountSpent),
                    attributionSetting: showAttribution ? attributionSetting : undefined,
                    bidStrategy,
                    frequencyCap: showFrequency ? frequencyCap : undefined
                }),
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const result = await res.json();
            setData(result);
            trackEvent('simulate', { campaignObjective, budget: Number(budget) });
        } catch (error: any) {
            console.error(error);
            alert("Simulation failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-background text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
            <MissingKeyModal isOpen={showMissingKey} onClose={() => setShowMissingKey(false)} />
            
<main className="flex-1 overflow-hidden relative flex flex-col h-[calc(100vh-64px)]">
    {/* Decorative Gradients */}
    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

    <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-6xl mx-auto z-10 flex flex-col gap-6 md:gap-8 relative h-full min-h-0">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Campaign Simulator</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-lg">
                    Enter your campaign parameters and let AI predict your final outcomes based on industry benchmarks.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

            {/* Left Column: Form Settings */}
            <div className="lg:col-span-5 flex flex-col bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl shadow-xl overflow-hidden min-h-0 relative">
                
                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 backdrop-blur-sm shrink-0">
                    {["Campaign", "Ad set", "Ads"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-4 text-sm font-semibold text-center transition-colors relative",
                                activeTab === tab 
                                    ? "text-primary bg-white dark:bg-surface-dark" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                    
                    {activeTab === "Campaign" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label htmlFor="campaignObjective" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Campaign Objective</label>
                                <Select
                                    id="campaignObjective"
                                    value={campaignObjective}
                                    onChange={setCampaignObjective}
                                    options={["Awareness", "Traffic", "Engagement", "Leads", "App promotion", "Sales"]}
                                />
                            </div>

                            {isSales && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label htmlFor="buyingType" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Buying type</label>
                                    <Select
                                        id="buyingType"
                                        value={buyingType}
                                        onChange={setBuyingType}
                                        options={["Auction", "Reservation"]}
                                        disabled={true}
                                    />
                                </div>
                            )}

                            {isSales && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest block">Budget Strategy Options</label>

                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                        <input
                                            type="radio"
                                            name="budgetStrategy"
                                            value="Campaign budget"
                                            checked={budgetStrategy === "Campaign budget"}
                                            onChange={(e) => setBudgetStrategy(e.target.value)}
                                            className="mt-1 accent-primary"
                                        />
                                        <div>
                                            <div className="font-semibold text-sm text-slate-900 dark:text-white">Campaign budget</div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">Automatically distribute your budget to the best opportunities across your campaign.</div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                        <input
                                            type="radio"
                                            name="budgetStrategy"
                                            value="Ad set budget"
                                            checked={budgetStrategy === "Ad set budget"}
                                            onChange={(e) => setBudgetStrategy(e.target.value)}
                                            className="mt-1 accent-primary"
                                        />
                                        <div>
                                            <div className="font-semibold text-sm text-slate-900 dark:text-white">Ad set budget</div>
                                            <div className="text-xs text-slate-500 mt-1">Set different bid strategies or budget schedules for each ad set.</div>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {(!isSales || budgetStrategy === "Campaign budget") && renderBudgetAndBid()}
                        </div>
                    )}


                    {activeTab === "Ad set" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {isSales && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            Conversion location <span className="material-symbols-outlined text-[10px] text-slate-400">info</span>
                                        </label>
                                        <Select
                                            id="conversionLocation"
                                            value={conversionLocation}
                                            onChange={setConversionLocation}
                                            options={["Website", "Website and app", "Website and in-store", "Website, app and in-store", "Website and calls", "App", "Message destinations", "Calls"]}
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1.5 ml-1">We'll automatically send people where they're most likely to convert.</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            Performance goal <span className="material-symbols-outlined text-[10px] text-slate-400">info</span>
                                        </label>
                                        <Select
                                            id="performanceGoal"
                                            value={performanceGoal}
                                            onChange={setPerformanceGoal}
                                            options={[
                                                "Maximize number of conversions", 
                                                "Maximize value of conversions", 
                                                "Maximize number of landing page views", 
                                                "Maximize number of link clicks", 
                                                "Maximize daily unique reach", 
                                                "Maximize number of impressions"
                                            ]}
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1.5 ml-1">How you measure success for your ads.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2 block">Value rules</label>
                                            <Select
                                                id="valueRules"
                                                value={valueRules}
                                                onChange={setValueRules}
                                                options={["None", "Active"]}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2 block">Attribution model</label>
                                            <Select
                                                id="attributionModel"
                                                value={attributionModel}
                                                onChange={setAttributionModel}
                                                options={["Standard", "Data-driven"]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(isSales && budgetStrategy === "Ad set budget") && (
                                <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                                    {renderBudgetAndBid()}
                                </div>
                            )}

                            {showAttribution && (
                                <div>
                                    <label htmlFor="attributionSetting" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Attribution Setting</label>
                                    <Select
                                        id="attributionSetting"
                                        value={attributionSetting}
                                        onChange={setAttributionSetting}
                                        options={["7-day click or 1-day view", "1-day click", "7-day click", "1-day click or 1-day view"]}
                                    />
                                </div>
                            )}

                            {showFrequency && (
                                <div>
                                    <label htmlFor="frequencyCap" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Frequency Cap</label>
                                    <Select
                                        id="frequencyCap"
                                        value={frequencyCap}
                                        onChange={setFrequencyCap}
                                        options={["1 impression every 7 days", "2 impressions every 7 days", "1 impression every day", "3 impressions every week"]}
                                    />
                                </div>
                            )}

                            {isSales && (
                                <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span> Schedule
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Start Date</label>
                                                <input 
                                                    type="date" 
                                                    value={startDate} 
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 block">End Date (Optional)</label>
                                                <input 
                                                    type="date" 
                                                    value={endDate} 
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 mt-4">
                                            <span className="material-symbols-outlined text-primary text-[18px]">group</span> Audience
                                        </h4>
                                        
                                        <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-200 dark:border-white/5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Advantage+ Audience</div>
                                                    <div className="text-[10px] text-slate-500">Set up your audience using controls and suggestions.</div>
                                                </div>
                                                <button 
                                                    onClick={() => setAdvantagePlusAudience(!advantagePlusAudience)}
                                                    className={cn(
                                                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                        advantagePlusAudience ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                        advantagePlusAudience ? "translate-x-4" : "translate-x-0"
                                                    )} />
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Locations (Inclusion)</label>
                                                <input 
                                                    type="text" 
                                                    list="location-suggestions"
                                                    value={locations} 
                                                    onChange={(e) => setLocations(e.target.value)}
                                                    placeholder="Start typing a location..."
                                                    className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary/50"
                                                />
                                                <datalist id="location-suggestions">
                                                    <option value="India" />
                                                    <option value="United States" />
                                                    <option value="United Kingdom" />
                                                    <option value="Canada" />
                                                    <option value="Australia" />
                                                    <option value="Germany" />
                                                    <option value="France" />
                                                    <option value="Brazil" />
                                                    <option value="Japan" />
                                                    <option value="Worldwide" />
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 mt-4">
                                        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-1 mt-4">Audience segment reporting</label>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                            Define your ad account's audience segments in Advertiser settings to receive reporting breakdowns between your new audience, engaged audience and existing customers.
                                        </p>

                                        <div className="space-y-4 bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                                            <div>
                                                <label htmlFor="engagedAudience" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Engaged audience</label>
                                                <Select
                                                    id="engagedAudience"
                                                    value={engagedAudience}
                                                    onChange={setEngagedAudience}
                                                    options={["Not defined", "Defined in settings"]}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="existingCustomers" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Existing customers</label>
                                                <Select
                                                    id="existingCustomers"
                                                    value={existingCustomers}
                                                    onChange={setExistingCustomers}
                                                    options={["Not defined", "Defined in settings"]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {activeTab === "Ads" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Ad Format</label>
                                <Select
                                    id="adFormat"
                                    value={adFormat}
                                    onChange={setAdFormat}
                                    options={["Single image or video", "Carousel", "Collection"]}
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Creative Source</label>
                                <Select
                                    id="creativeSource"
                                    value={creativeSource}
                                    onChange={setCreativeSource}
                                    options={["Manual upload", "Catalog"]}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block cursor-pointer">Destination Tracking</label>
                                <input
                                    type="text"
                                    value={destinationUrl}
                                    onChange={(e) => setDestinationUrl(e.target.value)}
                                    placeholder="https://example.com/checkout"
                                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                                <p className="text-[10px] text-slate-500 mt-2 ml-1">Mock website or app parameter passing for conversion simulation.</p>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-surface-dark/95 shrink-0 z-10 backdrop-blur-sm">
                    <button
                        onClick={runSimulation}
                        disabled={loading || !budget}
                        className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3.5 px-6 rounded-lg transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(24,119,242,0.3)] hover:shadow-[0_0_30px_rgba(24,119,242,0.5)]"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">insights</span>
                        )}
                        {loading ? "Simulating Constraints..." : "Predict Results"}
                    </button>
                </div>
            </div>
            {/* Right Column: Results Dashboard */}
                        <div className="lg:col-span-7 h-full flex flex-col min-h-0">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">monitoring</span> Simulated Outcomes
                                </h3>

                                {loading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary animate-spin mb-4"></div>
                                        <p className="animate-pulse">Crunching algorithmic data...</p>
                                    </div>
                                ) : !data ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">query_stats</span>
                                        <p>Enter your configuration and hit Predict to generate estimates.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                        <div className="grid grid-cols-2 gap-4">

                                            <div className="bg-slate-50 dark:bg-black/30 rounded-xl p-5 border border-slate-200 dark:border-white/5">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-1">Expected Results ({data.resultType})</p>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">{data.results.toLocaleString()}</p>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-black/30 rounded-xl p-5 border border-slate-200 dark:border-white/5">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-1">Cost Per Result</p>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">₹{data.costPerResult.toFixed(2)}</p>
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-slate-50 dark:bg-black/20 rounded-lg p-4 border border-slate-200 dark:border-white/5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Impressions</p>
                                                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.impressions.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-black/20 rounded-lg p-4 border border-slate-200 dark:border-white/5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Reach</p>
                                                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.reach.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-black/20 rounded-lg p-4 border border-slate-200 dark:border-white/5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Projected Ends</p>
                                                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.ends}</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-5">
                                            <div className="flex gap-3">
                                                <span className="material-symbols-outlined text-primary mt-0.5">lightbulb</span>
                                                <div>
                                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Strategic Note</p>
                                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{data.strategicNote}</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}

                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
