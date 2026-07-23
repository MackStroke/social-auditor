import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { ExternalLink, Heart } from "lucide-react";

export default function DonatePage() {
    // UPI Payment Link
    const DONATION_LINK = "upi://pay?pa=paytmqr5gg2nj@ptys&pn=Paytm&tn=Verified Paytm Merchant";

    return (
        <div className="flex-1 w-full min-h-screen bg-slate-50 dark:bg-background overflow-y-auto">
            {/* Minimal Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent flex items-center gap-2">
                        Support the Project
                        <Heart size={20} className="text-rose-500 fill-rose-500" />
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Help us keep Social Auditor free and continually improving.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm">
                    {/* Left content */}
                    <div className="md:col-span-3 flex flex-col justify-center space-y-6">
                        <div>
                            <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                                <Heart size={24} className="fill-current" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Fund this project</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Social Auditor is developed with a passion for transparency and open tools. If you find this tool helpful, consider making a donation to help cover server costs and fund future development.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                                Every contribution, big or small, ensures this project stays free and accessible to everyone.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">How to donate</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">1</span>
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Scan the QR code with your phone's camera or a payment app if it's supported.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">2</span>
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Or click the button below to visit the donation page directly.</span>
                                </li>
                            </ul>

                            <a
                                href={DONATION_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all hover:scale-[1.02] shadow-sm shadow-red-500/20"
                            >
                                Donate Now
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Right content (QR Code) */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                            <QRCodeSVG
                                value={DONATION_LINK}
                                size={200}
                                level="M"
                                includeMargin={false}
                                className="w-full h-auto"
                            />
                        </div>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
                            Scan to donate
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center px-4">
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        Thank you for considering a donation! Your support means the world.
                    </p>
                </div>
            </div>
        </div>
    );
}
