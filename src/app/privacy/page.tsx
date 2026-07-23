import React from "react";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex-1 w-full min-h-screen bg-slate-50 dark:bg-background overflow-y-auto">
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                        Privacy Policy
                        <Shield size={20} className="text-indigo-500" />
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Last updated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="lead text-lg text-slate-600 dark:text-slate-300">
                            At Social Auditor, accessible from our application, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Social Auditor and how we use it.
                        </p>

                        <p>
                            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                        </p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">1. Log Files</h2>
                        <p>
                            Social Auditor follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                        </p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">2. Cookies and Web Beacons</h2>
                        <p>
                            Like any other website, Social Auditor uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                        </p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">3. Google DoubleClick DART Cookie</h2>
                        <p>
                            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">https://policies.google.com/technologies/ads</a>.
                        </p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">4. Our Advertising Partners</h2>
                        <p>
                            Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below.
                        </p>
                        <ul className="list-disc pl-5 my-4">
                            <li>
                                <strong>Google</strong><br />
                                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">https://policies.google.com/technologies/ads</a>
                            </li>
                        </ul>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg my-6">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Google AdSense Specific Policies:</h4>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-slate-700 dark:text-slate-300">
                                <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
                                <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
                                <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Ads Settings</a>. (Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.aboutads.info</a>.)</li>
                            </ul>
                        </div>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">5. Advertising Partners Privacy Policies</h2>
                        <p>
                            You may consult this list to find the Privacy Policy for each of the advertising partners of Social Auditor.
                        </p>
                        <p>
                            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Social Auditor, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                        </p>
                        <p>
                            Note that Social Auditor has no access to or control over these cookies that are used by third-party advertisers.
                        </p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">6. Third Party Privacy Policies</h2>
                        <p>
                            Social Auditor's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                        </p>
                        <p>
                            You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
                        </p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">7. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
                        <p>Under the CCPA, among other rights, California consumers have the right to:</p>
                        <ul className="list-disc pl-5 my-4">
                            <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                            <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
                        </ul>
                        <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

                        <h2 className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">8. GDPR Data Protection Rights</h2>
                        <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                        <ul className="list-disc pl-5 my-4">
                            <li>The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
                            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
                            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                        </ul>
                        <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                            <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
