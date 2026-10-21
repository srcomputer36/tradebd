import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Mail,
  Info,
  CheckCircle2,
  Send,
  Globe,
  BookOpen,
  Lock,
} from 'lucide-react';

export type LegalSection = 'ABOUT' | 'PRIVACY' | 'TERMS' | 'DISCLAIMER' | 'CONTACT';

interface LegalPagesViewProps {
  activeSection: LegalSection;
  onSelectSection: (section: LegalSection) => void;
  onBackToChart: () => void;
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({
  activeSection,
  onSelectSection,
  onBackToChart,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="flex flex-col gap-5 flex-1 max-w-5xl w-full mx-auto">
      {/* Top Sub-Navigation Bar for Legal & Trust Pages */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'ABOUT', labelBn: 'আমাদের সম্পর্কে (About Us)', labelEn: 'About Us', icon: Info },
              {
                id: 'PRIVACY',
                labelBn: 'গোপনীয়তা নীতি (Privacy Policy)',
                labelEn: 'Privacy Policy',
                icon: Lock,
              },
              {
                id: 'TERMS',
                labelBn: 'শর্তাবলী (Terms of Use)',
                labelEn: 'Terms & Conditions',
                icon: FileText,
              },
              {
                id: 'DISCLAIMER',
                labelBn: 'ঝুঁকি সতর্কবার্তা (Disclaimer)',
                labelEn: 'Risk Disclaimer',
                icon: AlertTriangle,
              },
              {
                id: 'CONTACT',
                labelBn: 'যোগাযোগ (Contact Us)',
                labelEn: 'Contact Us',
                icon: Mail,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectSection(tab.id);
                  setSubmitted(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onBackToChart}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-cyan-400 transition-colors shrink-0 cursor-pointer"
        >
          {isBn ? '← চার্টে ফিরে যান' : '← Back to Live Chart'}
        </button>
      </div>

      {/* Main Content Container */}
      <article className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 text-slate-300 leading-relaxed">
        {/* =================================================================
            1. ABOUT US (আমাদের সম্পর্কে)
        ================================================================= */}
        {activeSection === 'ABOUT' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                {isBn ? 'আমাদের পরিচিতি ও লক্ষ্য' : 'About Our Platform'}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn
                  ? 'Tradebd — ফরেক্স ও ক্রিপ্টো ট্রেডিং লার্নিং একাডেমি এবং টেকনিক্যাল অ্যানালাইসিস প্ল্যাটফর্ম'
                  : 'Tradebd — Financial Education Academy & Technical Analysis Workspace'}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-200">
              {isBn
                ? 'Tradebd (tradebd.online) হলো একটি সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য আন্তর্জাতিক মানের ফিন্যান্সিয়াল এডুকেশন, টেকনিক্যাল অ্যানালাইসিস এবং ভার্চুয়াল পেপার ট্রেডিং প্র্যাকটিস প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো নতুন ও মাঝারি পর্যায়ের ট্রেডারদের আসল টাকা ঝুঁকিতে না ফেলে প্রফেশনাল চার্ট রিডিং, রিস্ক ম্যানেজমেন্ট এবং ম্যাক্রো-ইকোনমিক নিউজ বিশ্লেষণ শেখানো।'
                : 'Tradebd (tradebd.online) is a free financial literacy, technical analysis, and virtual paper-trading simulation platform designed to help aspiring traders master chart structure, risk management, and macroeconomic analysis without risking real capital.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? '১০০% শিক্ষামূলক একাডেমি' : 'Structured Trading Academy'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn
                    ? 'ক্যান্ডেলস্টিক সাইকোলজি, সাপোর্ট-রেজিস্ট্যান্স, RSI, EMA-200 এবং প্রাইস অ্যাকশন স্ট্র্যাটেজি নিয়ে ধাপে ধাপে বাংলা ও ইংরেজি কোর্স এবং কুইজ।'
                    : 'Step-by-step curriculum covering candlestick psychology, support and resistance, moving averages, RSI, and institutional risk management.'}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? 'ভার্চুয়াল পেপার ট্রেডিং সিমুলেটর' : 'Risk-Free Paper Trading'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn
                    ? 'ইচ্ছামতো কাস্টম ভার্চুয়াল ডেমো ব্যালেন্স ($50 থেকে $1,000,000+) নিয়ে ক্রিপ্টো ও মেজর ফরেক্স পেয়ারে স্টপ-লস (SL) ও টেক-প্রফিট (TP) সহ রিয়েল-টাইম ট্রেডিং অনুশীলন।'
                    : 'Practice executing Long and Short setups with customizable virtual demo funds across major Crypto and Forex pairs with zero financial risk.'}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? 'রিস্ক ক্যালকুলেটর ও ইকোনমিক হাব' : 'Risk Management & Economic Hub'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn
                    ? 'বাংলাদেশ সময় (BST) অনুযায়ী গ্লোবাল ফরেক্স ট্রেডিং সেশন ট্র্যাকার, অর্থনৈতিক ক্যালেন্ডার এবং ১%-২% পজিশন সাইজিং ক্যালকুলেটর।'
                    : 'Global trading session clocks in Bangladesh Standard Time (BST), macroeconomic calendar, and position sizing calculators.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? 'আমাদের সম্পাদকীয় নীতিমালা (Editorial & Educational Standards)' : 'Our Editorial & Educational Integrity'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {isBn
                  ? 'Tradebd কোনো ব্রোকার নয়, আমরা কোনো রিয়েল-মানি ডিপোজিট গ্রহণ করি না এবং কোনো প্রকার "নিশ্চিত লাভের সিগন্যাল" বিক্রি করি না। আমাদের প্ল্যাটফর্মের প্রতিটি টিউটোরিয়াল, চার্ট প্যারামিটার এবং অর্থনৈতিক বিশ্লেষণ শুধুমাত্র শিক্ষামূলক ও দক্ষতা উন্নয়নের উদ্দেশ্যে তৈরি করা হয়েছে।'
                  : 'Tradebd is strictly an educational publisher and simulation tool. We do not operate as a broker, never accept real-money deposits, and never sell paid signals or promise guaranteed financial returns.'}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================
            2. PRIVACY POLICY (গোপনীয়তা নীতি ও Google AdSense কুকি নীতিমালা)
        ================================================================= */}
        {activeSection === 'PRIVACY' && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                {isBn ? 'আইনি ও গোপনীয়তা নীতিমালা' : 'Privacy & Cookie Compliance'}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? 'সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬ | কার্যকরী ডোমেইন: tradebd.online' : 'Last Updated: October 2026 | Effective Domain: tradebd.online'}
              </p>
            </div>

            <p>
              {isBn
                ? 'Tradebd (https://tradebd.online)-এ আপনাকে স্বাগতম। ব্যবহারকারীদের ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষা করা আমাদের অন্যতম প্রধান অগ্রাধিকার। এই গোপনীয়তা নীতিতে ব্যাখ্যা করা হয়েছে আমরা কীভাবে তথ্য ব্যবহার করি এবং তৃতীয় পক্ষের বিজ্ঞাপন সেবা (যেমন Google AdSense) কীভাবে কুকিজ ব্যবহার করে।'
                : 'Welcome to Tradebd (https://tradebd.online). Protecting the privacy of our visitors is one of our highest priorities. This Privacy Policy document outlines the types of information processed by Tradebd and how third-party advertising partners such as Google AdSense utilize cookies.'}
            </p>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '১. আমরা কী তথ্য সংগ্রহ ও সংরক্ষণ করি (Local Storage Data)' : '1. Information We Collect & Browser Local Storage'}
              </h2>
              <p>
                {isBn
                  ? 'Tradebd ব্যবহারের জন্য কোনো বাধ্যতামূলক একাউন্ট রেজিস্ট্রেশন বা ব্যাংকিং তথ্যের প্রয়োজন হয় না। আপনার পেপার ট্রেডিং কাস্টম ডেমো ব্যালেন্স, ওপেন পজিশন, সম্পন্ন করা একাডেমি লেসন এবং ভাষার পছন্দ শুধুমাত্র আপনার নিজের ব্রাউজারের LocalStorage-এ সংরক্ষিত থাকে। আপনি যেকোনো সময় ব্রাউজার ক্যাশ ক্লিয়ার করে বা ফান্ড রিসেট বাটনে ক্লিক করে তা পরিবর্তন বা মুছে ফেলতে পারেন।'
                  : 'Tradebd does not require mandatory user registration or financial account credentials. Your customizable virtual paper-trading balance, simulated trade history, completed academy lessons, and language preferences are stored locally in your browser via LocalStorage.'}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '২. Google AdSense এবং DoubleClick DART কুকি নীতিমালা' : '2. Google AdSense & DoubleClick DART Cookies'}
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>
                  {isBn
                    ? 'গুগল (Google) একটি তৃতীয় পক্ষের ভেন্ডর হিসেবে আমাদের সাইটে বিজ্ঞাপন প্রদর্শনের জন্য কুকিজ (Cookies) ব্যবহার করে।'
                    : 'Google, as a third-party vendor, uses cookies to serve ads on Tradebd (https://tradebd.online).'}
                </li>
                <li>
                  {isBn
                    ? 'গুগল-এর DART কুকি ব্যবহারের মাধ্যমে আমাদের সাইট এবং ইন্টারনেটের অন্যান্য সাইটে ভিজিটরদের পূর্ববর্তী ভিজিটের ওপর ভিত্তি করে প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শন করা হয়।'
                    : 'Google’s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to Tradebd and/or other sites on the Internet.'}
                </li>
                <li>
                  {isBn
                    ? 'ব্যবহারকারীরা চাইলে গুগল বিজ্ঞাপন এবং কন্টেন্ট নেটওয়ার্কের গোপনীয়তা নীতিতে গিয়ে (https://policies.google.com/technologies/ads) অথবা Google Ads Settings (https://adssettings.google.com) পেজ ভিজিট করে পার্সোনালাইজড বিজ্ঞাপন (Personalized Ads) বন্ধ বা Opt-out করতে পারেন।'
                    : 'Users may opt out of personalized advertising by visiting Google Ads Settings (https://adssettings.google.com) or by visiting https://policies.google.com/technologies/ads.'}
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '৩. লগ ফাইল ও অ্যানালিটিক্স (Log Files)' : '3. Standard Server Log Files'}
              </h2>
              <p>
                {isBn
                  ? 'অন্যান্য স্ট্যান্ডার্ড ওয়েবসাইটের মতোই আমাদের হোস্টিং সার্ভার সাধারণ লগ ফাইল (যেমন: IP অ্যাড্রেস, ব্রাউজার টাইপ, ইন্টারনেট সার্ভিস প্রোভাইডার, তারিখ/সময় এবং রেফারিং পেজ) নিরাপত্তা ও ট্রাফিক বিশ্লেষণের জন্য রেকর্ড করতে পারে। এই তথ্যের সাথে কোনো ব্যক্তিগত পরিচয় যুক্ত থাকে না।'
                  : 'Tradebd follows a standard procedure of using log files. Information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, and referring/exit pages for security and aggregate trend analysis.'}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '৪. ব্যবহারকারীর অধিকার (GDPR & CCPA Privacy Rights)' : '4. GDPR & CCPA Data Protection Rights'}
              </h2>
              <p>
                {isBn
                  ? 'আপনার ব্রাউজারের কুকি সেটিংস নিয়ন্ত্রণ করার, আমাদের সাইটে সংরক্ষিত লোকাল ডাটা মুছে ফেলার এবং পার্সোনালাইজড বিজ্ঞাপন থেকে সরে আসার সম্পূর্ণ অধিকার আপনার রয়েছে। গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের Contact Us পেজের মাধ্যমে যোগাযোগ করতে পারেন।'
                  : 'You have the right to manage or disable cookies in your browser settings, clear local storage data at any time, and opt out of personalized third-party advertising cookies.'}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================
            3. TERMS & CONDITIONS (ব্যবহারের শর্তাবলী)
        ================================================================= */}
        {activeSection === 'TERMS' && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                {isBn ? 'ব্যবহারের নিয়মাবলী' : 'Terms of Service'}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
              </h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '১. শর্তাবলীতে সম্মতি' : '1. Acceptance of Terms'}
              </h2>
              <p>
                {isBn
                  ? 'Tradebd (https://tradebd.online) ওয়েবসাইটটি অ্যাক্সেস এবং ব্যবহার করার মাধ্যমে আপনি আমাদের ব্যবহারের শর্তাবলী, গোপনীয়তা নীতি এবং ঝুঁকি সতর্কবার্তার সাথে সম্মতি প্রকাশ করছেন।'
                  : 'By accessing and using Tradebd (https://tradebd.online), you accept and agree to be bound by these Terms and Conditions, our Privacy Policy, and our Financial Risk Disclaimer.'}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '২. শিক্ষামূলক ও ভার্চুয়াল সিমুলেটর ব্যবহারের নিয়ম' : '2. Educational & Virtual Simulator License'}
              </h2>
              <p>
                {isBn
                  ? 'এই প্ল্যাটফর্মে প্রদত্ত যেকোনো পরিমাণ ডেমো ব্যালেন্স সম্পূর্ণ কাল্পনিক বা ভার্চুয়াল (Demo Fund)। এই ভার্চুয়াল অর্থের কোনো বাস্তব আর্থিক মূল্য নেই, এটি উত্তোলনযোগ্য (Withdrawable) নয় এবং শুধুমাত্র ট্রেডিং অনুশীলন ও রিস্ক ম্যানেজমেন্ট শেখার জন্য প্রদত্ত।'
                  : 'All virtual demo balances, positions, and P&L metrics displayed in the Paper Trading Simulator are 100% virtual and simulated. Virtual funds hold zero monetary value and cannot be withdrawn or redeemed.'}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '৩. মেধাস্বত্ব ও কপিরাইট (Intellectual Property)' : '3. Intellectual Property Rights'}
              </h2>
              <p>
                {isBn
                  ? 'Tradebd-এর সকল বাংলা ও ইংরেজি ট্রেডিং কোর্স, ক্যান্ডেলস্টিক চিটশিট, সফটওয়্যার কোড এবং গ্রাফিক্স Tradebd-এর নিজস্ব সম্পত্তি। ব্যক্তিগত শেখার উদ্দেশ্য ছাড়া এগুলো হুবহু কপি করে বাণিজ্যিক উদ্দেশ্যে পুনঃপ্রকাশ করা নিষিদ্ধ।'
                  : 'All educational modules, candlestick pattern guides, custom chart tools, and textual content on Tradebd are protected by copyright and intellectual property laws.'}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================
            4. FINANCIAL RISK DISCLAIMER (আর্থিক ঝুঁকি ও শিক্ষামূলক ডিসক্লেইমার)
        ================================================================= */}
        {activeSection === 'DISCLAIMER' && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                {isBn ? 'আর্থিক ঝুঁকি সতর্কবার্তা' : 'Financial & Educational Disclaimer'}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn
                  ? 'আর্থিক ঝুঁকি ও শিক্ষামূলক ডিসক্লেইমার (Risk Disclaimer)'
                  : 'Financial Risk & Educational Disclaimer'}
              </h1>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-300 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isBn
                    ? 'গুরুত্বপূর্ণ সতর্কবার্তা: কোনো বিনিয়োগ পরামর্শ নয় (Not Financial Advice)'
                    : 'Important Notice: Strictly Educational — Not Financial or Investment Advice'}
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                {isBn
                  ? 'Tradebd (tradebd.online)-এ প্রকাশিত কোনো তথ্য, চার্ট অ্যানালাইসিস, এআই মেন্টর গাইড, অর্থনৈতিক ক্যালেন্ডার বা টিউটোরিয়ালকে কখনোই সরাসরি আর্থিক বা বিনিয়োগ পরামর্শ (Financial Advice) হিসেবে গণ্য করা যাবে না।'
                  : 'Nothing contained on Tradebd (tradebd.online)—including chart indicators, simulated candlesticks, AI Mentor educational feedback, or economic calendar guides—constitutes financial, investment, legal, or tax advice.'}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '১. ফরেক্স ও ক্রিপ্টো মার্কেটের ঝুঁকি' : '1. High Risk of Leveraged Trading'}
              </h2>
              <p>
                {isBn
                  ? 'বাস্তব বাজারে ফরেক্স (Forex) এবং ক্রিপ্টোকারেন্সি (Cryptocurrency) ট্রেডিং অত্যন্ত ঝুঁকিপূর্ণ এবং সব বিনিয়োগকারীর জন্য উপযুক্ত নাও হতে পারে। লিভারেজ ব্যবহারের ফলে লাভ যেমন হতে পারে, তেমনি আপনার সম্পূর্ণ মূলধন হারানোর ঝুঁকিও থাকে।'
                  : 'Trading foreign exchange (Forex) and cryptocurrencies on margin carries a high level of risk and may not be suitable for all investors. Past performance or simulated demo results do not guarantee future real-market outcomes.'}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">
                {isBn ? '২. ডেমো ও সিমুলেটেড ডাটা ডিসক্লোজার' : '2. Simulated Market Environment Disclosure'}
              </h2>
              <p>
                {isBn
                  ? 'শিক্ষার্থীদের যেকোনো সময় (২৪/৭) চার্ট রিডিং ও অর্ডার এক্সিকিউশন অনুশীলনের সুযোগ দিতে আমাদের চার্ট সিমুলেটরে ইন্টারেক্টিভ প্রাইস টিকিং এবং নিউজ ইমপ্যাক্ট সিমুলেশন ব্যবহৃত হয়। কোনো বাস্তব আর্থিক সিদ্ধান্ত নেওয়ার আগে সর্বদা একজন নিবন্ধিত আর্থিক উপদেষ্টার পরামর্শ নিন।'
                  : 'To allow 24/7 interactive learning and pattern recognition practice, chart ticks and news spike simulations operate in a controlled educational environment. Always consult a certified financial advisor before making real-world investment decisions.'}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================
            5. CONTACT US (যোগাযোগ করুন)
        ================================================================= */}
        {activeSection === 'CONTACT' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                {isBn ? 'সহায়তা ও যোগাযোগ' : 'Support & Inquiries'}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn ? 'যোগাযোগ করুন (Contact Us)' : 'Contact Us'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isBn
                  ? 'আমাদের ট্রেডিং একাডেমি, টেকনিক্যাল টুলস বা বিজ্ঞাপন সংক্রান্ত যেকোনো প্রশ্নের জন্য নিচের মাধ্যমে যোগাযোগ করুন।'
                  : 'Have questions about our educational modules, technical analysis tools, or partnership inquiries? Reach out to our team below.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Contact Information Cards */}
              <div className="lg:col-span-5 space-y-4 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    {isBn ? 'অফিসিয়াল ইমেইল' : 'Official Support Email'}
                  </div>
                  <div className="text-sm font-mono font-bold text-cyan-400">
                    support@tradebd.online
                  </div>
                  <p className="text-slate-400">
                    {isBn
                      ? 'সাধারণ জিজ্ঞাসা, বাগ রিপোর্ট বা কন্টেন্ট ফিডব্যাকের জন্য আমাদের ইমেইল করুন। আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দিয়ে থাকি।'
                      : 'For general inquiries, bug reports, or educational content feedback. We typically respond within 24 hours.'}
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    {isBn ? 'প্ল্যাটফর্মের ঠিকানা ও সময়' : 'Operating Hours & Region'}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {isBn ? 'ঢাকা, বাংলাদেশ (BST UTC+6)' : 'Dhaka, Bangladesh (BST UTC+6)'}
                  </div>
                  <p className="text-slate-400">
                    {isBn
                      ? 'সাপোর্ট সময়: রবিবার – বৃহস্পতিবার (সকাল ১০:০০ AM – রাত ৮:০০ PM BST)'
                      : 'Support Hours: Sunday – Thursday (10:00 AM – 8:00 PM BST)'}
                  </p>
                </div>
              </div>

              {/* Interactive Contact Form */}
              <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="text-base font-bold text-white">
                      {isBn
                        ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!'
                        : 'Your Message Has Been Sent!'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isBn
                        ? 'আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। আমাদের সাপোর্ট টিম খুব শীঘ্রই আপনার ইমেইলে উত্তর প্রদান করবে।'
                        : 'Thank you for reaching out to Tradebd. Our editorial and support team will review your message shortly.'}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {isBn ? 'নতুন বার্তা পাঠান' : 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          {isBn ? 'আপনার নাম *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={isBn ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'}
                          className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          {isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        {isBn ? 'বিষয় (Subject)' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={
                          isBn
                            ? 'যেমন: কোর্স ফিডব্যাক / টেকনিক্যাল সাপোর্ট'
                            : 'e.g., Academy Feedback / Technical Inquiry'
                        }
                        className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        {isBn ? 'আপনার বার্তা *' : 'Message *'}
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          isBn ? 'আপনার প্রশ্ন বা মতামত বিস্তারিত লিখুন...' : 'Write your message here...'
                        }
                        className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBn ? 'বার্তা পাঠান' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
