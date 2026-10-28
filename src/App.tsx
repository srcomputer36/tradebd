import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TRADING_ASSETS, generateCandles, simulateTick } from './data/assets';
import { Asset, Candle, OrderSide, Position, TradeHistory } from './types/trading';
import { Navbar, NavTab } from './components/Navbar';
import { CandlestickChart } from './components/Chart/CandlestickChart';
import { MarketSectionsBar } from './components/MarketSectionsBar';
import type { LegalSection } from './components/Legal/LegalPagesView';
import { useLanguage } from './context/LanguageContext';

const PaperTradingPanel = React.lazy(() =>
  import('./components/Simulator/PaperTradingPanel').then((m) => ({ default: m.PaperTradingPanel }))
);
const MarketIntelView = React.lazy(() =>
  import('./components/MarketIntel/MarketIntelView').then((m) => ({ default: m.MarketIntelView }))
);
const AcademyView = React.lazy(() =>
  import('./components/Academy/AcademyView').then((m) => ({ default: m.AcademyView }))
);
const PatternGallery = React.lazy(() =>
  import('./components/Patterns/PatternGallery').then((m) => ({ default: m.PatternGallery }))
);
const RiskCalculator = React.lazy(() =>
  import('./components/Calculator/RiskCalculator').then((m) => ({ default: m.RiskCalculator }))
);
const AiMentorView = React.lazy(() =>
  import('./components/Mentor/AiMentorView').then((m) => ({ default: m.AiMentorView }))
);
const LegalPagesView = React.lazy(() =>
  import('./components/Legal/LegalPagesView').then((m) => ({ default: m.LegalPagesView }))
);
const BlogView = React.lazy(() =>
  import('./components/Blog/BlogView').then((m) => ({ default: m.BlogView }))
);

const LazyFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 text-slate-400 py-12">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono text-slate-400">Loading module...</span>
  </div>
);

const QUICK_SESSIONS = [
  { nameEn: 'Sydney', nameBn: 'সিডনি', openUtcHour: 22, closeUtcHour: 7 },
  { nameEn: 'Tokyo', nameBn: 'টোকিও', openUtcHour: 0, closeUtcHour: 9 },
  { nameEn: 'London', nameBn: 'লন্ডন', openUtcHour: 8, closeUtcHour: 17 },
  { nameEn: 'New York', nameBn: 'নিউ ইয়র্ক', openUtcHour: 13, closeUtcHour: 22 },
];

const NEXT_HIGH_IMPACT_PREVIEW = {
  timeBst: '06:30 PM',
  flag: '🇺🇸',
  titleEn: 'US Core CPI Inflation Rate (MoM)',
  titleBn: 'যুক্তরাষ্ট্রের কোর মুদ্রাস্ফীতি হার (US Core CPI MoM)',
  previous: '0.2%',
  forecast: '0.3%',
};
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  BookOpen,
  Calculator,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Clock,
  Flame,
  PenTool,
} from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavTab>('CHART');
  const [blogSlug, setBlogSlug] = useState<string | null>(null);
  const [legalSection, setLegalSection] = useState<LegalSection>('ABOUT');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(TRADING_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [simulatorDefaultSide, setSimulatorDefaultSide] = useState<OrderSide>('LONG');

  const openLegalPage = useCallback((section: LegalSection) => {
    setLegalSection(section);
    setActiveTab('LEGAL');
    const slug = section.toLowerCase();
    try {
      window.history.pushState(null, '', `/${slug}`);
    } catch {
      window.location.hash = slug;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Dismiss static #initial-app-shell on mount and wire #tradebd-cookie-banner events
  useEffect(() => {
    document.documentElement.classList.add('app-mounted');
    const onOpenPrivacy = () => openLegalPage('PRIVACY');
    window.addEventListener('tradebd:open-privacy', onOpenPrivacy);
    return () => window.removeEventListener('tradebd:open-privacy', onOpenPrivacy);
  }, [openLegalPage]);

  useEffect(() => {
    const textEl = document.getElementById('cookie-banner-text');
    const privEl = document.getElementById('cookie-privacy-btn');
    const accEl = document.getElementById('cookie-accept-btn');
    if (textEl) {
      textEl.textContent =
        language === 'bn'
          ? 'আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে, ডেমো ট্রেডিং ডাটা সংরক্ষণ করতে এবং প্রাসঙ্গিক বিজ্ঞাপন (Google AdSense) প্রদর্শনের জন্য আমরা কুকিজ ব্যবহার করি।'
          : 'We use cookies and local storage to save your virtual trading progress and serve relevant educational content and advertisements.';
    }
    if (privEl) {
      privEl.textContent = language === 'bn' ? 'গোপনীয়তা নীতি দেখুন' : 'Privacy Policy';
    }
    if (accEl) {
      accEl.textContent = language === 'bn' ? 'সম্মতি দিন (Accept)' : 'Accept Cookies';
    }
  }, [language]);

  const handleSelectTab = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    if (tab !== 'BLOG') {
      setBlogSlug(null);
    }
    const pathMap: Record<NavTab, string> = {
      CHART: '/',
      SIMULATOR: '/simulator',
      CALENDAR: '/calendar',
      ACADEMY: '/academy',
      BLOG: '/blog',
      PATTERNS: '/patterns',
      CALCULATOR: '/calculator',
      MENTOR: '/mentor',
      LEGAL: '/about',
    };
    const targetPath = pathMap[tab] || '/';
    try {
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState(null, '', targetPath);
      }
    } catch {
      window.location.hash = targetPath.replace('/', '') || 'chart';
    }
  }, []);

  // Sync URL hash or pathname with activeTab / legalSection so direct links (/privacy, /blog/slug, etc.) work for AdSense & Googlebot
  useEffect(() => {
    const applyRoute = () => {
      const hashRoute = window.location.hash.replace('#', '').trim();
      const pathRoute = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
      const rawRoute = hashRoute || pathRoute;
      const route = rawRoute.toLowerCase();

      if (route.startsWith('blog/') || route.startsWith('articles/')) {
        const extractedSlug = rawRoute.split('/').slice(1).join('/').trim();
        setBlogSlug(extractedSlug || null);
        setActiveTab('BLOG');
      } else if (route === 'blog' || route === 'articles') {
        setBlogSlug(null);
        setActiveTab('BLOG');
      } else if (route === 'privacy' || route === 'privacy-policy') {
        setLegalSection('PRIVACY');
        setActiveTab('LEGAL');
      } else if (route === 'terms' || route === 'terms-of-service') {
        setLegalSection('TERMS');
        setActiveTab('LEGAL');
      } else if (route === 'disclaimer' || route === 'risk-disclaimer') {
        setLegalSection('DISCLAIMER');
        setActiveTab('LEGAL');
      } else if (route === 'about' || route === 'about-us') {
        setLegalSection('ABOUT');
        setActiveTab('LEGAL');
      } else if (route === 'contact' || route === 'contact-us') {
        setLegalSection('CONTACT');
        setActiveTab('LEGAL');
      } else if (route === 'academy') {
        setActiveTab('ACADEMY');
      } else if (route === 'calendar' || route === 'news' || route === 'sessions') {
        setActiveTab('CALENDAR');
      } else if (route === 'patterns') {
        setActiveTab('PATTERNS');
      } else if (route === 'calculator') {
        setActiveTab('CALCULATOR');
      } else if (route === 'simulator') {
        setActiveTab('SIMULATOR');
      } else if (route === 'mentor') {
        setActiveTab('MENTOR');
      } else if (route === 'chart') {
        setActiveTab('CHART');
      }
    };
    applyRoute();
    window.addEventListener('hashchange', applyRoute);
    window.addEventListener('popstate', applyRoute);
    return () => {
      window.removeEventListener('hashchange', applyRoute);
      window.removeEventListener('popstate', applyRoute);
    };
  }, []);

  // Dynamic per-page SEO Meta Tags & Canonical URL manager for Googlebot & Social Sharing
  useEffect(() => {
    const baseUrl = 'https://tradebd.online';
    const isBn = language === 'bn';
    let slug = '';
    let title = isBn
      ? 'Tradebd – ট্রেডিং একাডেমি ও টেকনিক্যাল অ্যানালাইসিস প্ল্যাটফর্ম'
      : 'Tradebd – Trading Academy & Technical Analysis Platform';
    let description = isBn
      ? 'Tradebd – ফ্রি ফরেক্স ও ক্রিপ্টো ট্রেডিং একাডেমি, লাইভ টেকনিক্যাল চার্ট অ্যানালাইসিস, অর্থনৈতিক ক্যালেন্ডার ও ভার্চুয়াল পেপার ট্রেডিং সিমুলেটর।'
      : 'Tradebd is a free Forex & Crypto Trading Academy, live technical analysis chart platform, economic calendar, and virtual paper trading simulator.';

    if (activeTab === 'SIMULATOR') {
      slug = '/simulator';
      title = isBn
        ? 'ভার্চুয়াল পেপার ট্রেডিং সিমুলেটর (ফ্রি ডেমো একাউন্ট) – Tradebd'
        : 'Virtual Paper Trading Simulator (Free Demo Account) – Tradebd';
      description = isBn
        ? 'কোনো আর্থিক ঝুঁকি ছাড়াই কাস্টম ডেমো ফান্ড দিয়ে লাইভ ফরেক্স ও ক্রিপ্টো মার্কেটে ভার্চুয়াল পেপার ট্রেডিং প্র্যাকটিস করুন Tradebd সিমুলেটরে।'
        : 'Practice live Forex and Crypto paper trading with customizable virtual demo funds and zero financial risk on the Tradebd Simulator.';
    } else if (activeTab === 'CALENDAR') {
      slug = '/calendar';
      title = isBn
        ? 'ফরেক্স অর্থনৈতিক ক্যালেন্ডার ও মার্কেট সেশন (বাংলাদেশ সময় BST) – Tradebd'
        : 'Forex Economic Calendar & Global Market Sessions (BST UTC+6) – Tradebd';
      description = isBn
        ? 'বাংলাদেশ সময় (UTC+6) অনুযায়ী সিডনি, টোকিও, লন্ডন ও নিউ ইয়র্ক ফরেক্স সেশন ট্র্যাকার এবং হাই-ইমপ্যাক্ট অর্থনৈতিক নিউজ ক্যালেন্ডার (CPI, NFP, FOMC)।'
        : 'Track Sydney, Tokyo, London, and New York Forex sessions in Bangladesh Standard Time (UTC+6) alongside high-impact economic news (CPI, NFP, FOMC).';
    } else if (activeTab === 'ACADEMY') {
      slug = '/academy';
      title = isBn
        ? 'ফরেক্স ও ক্রিপ্টো ট্রেডিং একাডেমি কোর্স (বাংলা ও ইংরেজি) – Tradebd'
        : 'Forex & Crypto Trading Academy Courses (Bengali & English) – Tradebd';
      description = isBn
        ? 'শুরু থেকে প্রফেশনাল লেভেল পর্যন্ত ফরেক্স ও ক্রিপ্টো ট্রেডিং, প্রাইস অ্যাকশন, সাপোর্ট-রেজিস্ট্যান্স ও রিস্ক ম্যানেজমেন্ট শিখুন সম্পূর্ণ বিনামূল্যে।'
        : 'Learn Forex & Crypto trading from beginner to institutional level: price action, support & resistance, indicators, and risk management for free.';
    } else if (activeTab === 'BLOG') {
      slug = blogSlug ? `/blog/${blogSlug}` : '/blog';
      title = isBn
        ? 'শিক্ষণীয় ফরেক্স ও ক্রিপ্টো ট্রেডিং ব্লগ এবং আর্টিকেল হাব – Tradebd'
        : 'Educational Forex & Crypto Trading Blog & Articles – Tradebd';
      description = isBn
        ? 'ফরেক্স ট্রেডিং গাইড, ক্যান্ডেলস্টিক চার্ট প্যাটার্ন, বাংলাদেশ সময় অনুযায়ী ট্রেডিং সেশন এবং মানি ম্যানেজমেন্টের বিস্তারিত বাংলা ও ইংরেজি ব্লগ।'
        : 'In-depth educational articles on Forex trading, candlestick chart patterns, global trading sessions, and institutional risk management.';
    } else if (activeTab === 'PATTERNS') {
      slug = '/patterns';
      title = isBn
        ? 'ক্যান্ডেলস্টিক চার্ট প্যাটার্ন গাইড ও চিটশিট – Tradebd'
        : 'Candlestick Chart Patterns Guide & Cheatsheet – Tradebd';
      description = isBn
        ? 'বুলিশ ও বেয়ারিশ ক্যান্ডেলস্টিক চার্ট প্যাটার্ন (হ্যামার, এনগালফিং, ডোজি, শুটিং স্টার, মর্নিং স্টার) চেনার নিয়ম এবং এন্ট্রি-এক্সিট স্ট্র্যাটেজি।'
        : 'Master bullish and bearish candlestick chart patterns (Hammer, Engulfing, Doji, Shooting Star, Morning Star) with clear entry and exit rules.';
    } else if (activeTab === 'CALCULATOR') {
      slug = '/calculator';
      title = isBn
        ? 'ফরেক্স ও ক্রিপ্টো রিস্ক এবং লট সাইজ ক্যালকুলেটর – Tradebd'
        : 'Forex & Crypto Risk & Position Lot Size Calculator – Tradebd';
      description = isBn
        ? 'সঠিক রিস্ক-রিওয়ার্ড রেশিও (R:R), স্টপ লস ও একাউন্ট ব্যালেন্স অনুযায়ী নিখুঁত পজিশন ও লট সাইজ হিসাব করার প্রফেশনাল ট্রেডিং ক্যালকুলেটর।'
        : 'Calculate exact position size, standard/mini/micro lots, and Risk-to-Reward (R:R) ratio based on your account balance and stop-loss distance.';
    } else if (activeTab === 'MENTOR') {
      slug = '/mentor';
      title = isBn
        ? 'ইন্টারঅ্যাক্টিভ চার্ট কুইজ ও ট্রেডিং মেন্টর – Tradebd'
        : 'Interactive Chart Quiz & Trade Setup Mentor – Tradebd';
      description = isBn
        ? 'লাইভ ক্যান্ডেলস্টিক চার্ট দেখে মার্কেট স্ট্রাকচার, আরএসআই (RSI), ইএমএ (EMA) ও ট্রেডিং সেটআপ বিশ্লেষণের প্র্যাকটিক্যাল কুইজ ও গাইড।'
        : 'Test your chart reading skills and evaluate trade setups with live RSI, EMA, and market structure analysis.';
    } else if (activeTab === 'LEGAL') {
      if (legalSection === 'ABOUT') {
        slug = '/about';
        title = isBn
          ? 'আমাদের সম্পর্কে (About Us) – Tradebd ট্রেডিং একাডেমি'
          : 'About Us – Tradebd Financial Education Academy';
        description = isBn
          ? 'Tradebd (tradebd.online) সম্পর্কে জানুন – বাংলাদেশের ও আন্তর্জাতিক শিক্ষার্থীদের জন্য বিনামূল্যে ফিন্যান্সিয়াল লিটারেসি ও টেকনিক্যাল অ্যানালাইসিস প্ল্যাটফর্ম।'
          : 'Learn about Tradebd (tradebd.online) – a free financial literacy, technical analysis, and virtual paper trading platform.';
      } else if (legalSection === 'CONTACT') {
        slug = '/contact';
        title = isBn
          ? 'যোগাযোগ করুন (Contact Us) – Tradebd Support'
          : 'Contact Us – Tradebd Support';
        description = isBn
          ? 'যেকোনো প্রশ্ন, মতামত বা কারিগরি সহায়তার জন্য Tradebd টিমের সাথে যোগাযোগ করুন (support@tradebd.online)।'
          : 'Get in touch with the Tradebd editorial and technical support team (support@tradebd.online).';
      } else if (legalSection === 'PRIVACY') {
        slug = '/privacy';
        title = isBn
          ? 'গোপনীয়তা নীতি (Privacy Policy) – Tradebd'
          : 'Privacy Policy – Tradebd';
        description = isBn
          ? 'Tradebd (tradebd.online) এর গোপনীয়তা নীতি, কুকিজ ব্যবহার এবং Google AdSense ও ডাটা সুরক্ষা সংক্রান্ত বিস্তারিত নীতিমালা।'
          : 'Read the Tradebd (tradebd.online) Privacy Policy, cookie usage disclosures, Google AdSense compliance, and data protection standards.';
      } else if (legalSection === 'TERMS') {
        slug = '/terms';
        title = isBn
          ? 'ব্যবহারের শর্তাবলী (Terms of Use) – Tradebd'
          : 'Terms of Use – Tradebd';
        description = isBn
          ? 'Tradebd ওয়েবসাইট, শিক্ষামূলক কোর্স এবং ভার্চুয়াল পেপার ট্রেডিং সিমুলেটর ব্যবহারের নিয়মাবলী ও শর্তসমূহ।'
          : 'Terms and conditions for using the Tradebd website, educational courses, and virtual paper trading simulator.';
      } else if (legalSection === 'DISCLAIMER') {
        slug = '/disclaimer';
        title = isBn
          ? 'আর্থিক ঝুঁকি সতর্কবার্তা (Risk Disclaimer) – Tradebd'
          : 'Financial Risk Disclaimer – Tradebd';
        description = isBn
          ? 'Tradebd এর শিক্ষামূলক ও আর্থিক ঝুঁকি সতর্কবার্তা। ডেমো ট্রেডিং শুধুমাত্র শিক্ষার উদ্দেশ্যে এবং এটি কোনো বিনিয়োগ পরামর্শ নয়।'
          : 'Educational and financial risk disclaimer for Tradebd. Virtual paper trading is strictly for education and does not constitute investment advice.';
      }
    }

    const canonicalUrl = `${baseUrl}${slug || '/'}`;

    const setMetaTag = (selector: string, attr: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, content);
    };

    // When viewing a specific blog article, BlogView manages its own article-specific title & meta description
    if (!(activeTab === 'BLOG' && blogSlug)) {
      document.title = title;
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[property="og:title"]', 'content', title);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[name="twitter:title"]', 'content', title);
      setMetaTag('meta[name="twitter:description"]', 'content', description);
    }

    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    setMetaTag('link[rel="canonical"]', 'href', canonicalUrl);
    setMetaTag('link[rel="alternate"][hreflang="en"]', 'href', canonicalUrl);
    setMetaTag('link[rel="alternate"][hreflang="bn"]', 'href', `${canonicalUrl}?lang=bn`);
    setMetaTag('link[rel="alternate"][hreflang="x-default"]', 'href', canonicalUrl);

    // Send virtual pageview to Google Analytics (GA4) on tab/route change
    try {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof w.gtag === 'function') {
        w.gtag('config', 'G-JPKV5KJD8X', {
          page_path: slug || '/',
          page_location: canonicalUrl,
          page_title: document.title || title,
        });
      }
    } catch {
      // ignore analytics error
    }
  }, [activeTab, legalSection, blogSlug, language]);

  // Track live prices for all Crypto and Forex pairs simultaneously
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const a of TRADING_ASSETS) {
      initial[a.id] = a.basePrice;
    }
    return initial;
  });

  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(TRADING_ASSETS[0], 500, '15m', TRADING_ASSETS[0].basePrice)
  );
  const [isLiveTicking, setIsLiveTicking] = useState<boolean>(true);
  const [tickSpeed, setTickSpeed] = useState<number>(1);

  // Paper Trading state persisted in localStorage
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tradebd_balance');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {
      // ignore
    }
    return 25000;
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem('tradebd_positions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>(() => {
    try {
      const saved = localStorage.getItem('tradebd_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('tradebd_balance', balance.toString());
    } catch {
      // ignore
    }
  }, [balance]);

  useEffect(() => {
    try {
      localStorage.setItem('tradebd_positions', JSON.stringify(positions));
    } catch {
      // ignore
    }
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem('tradebd_history', JSON.stringify(tradeHistory));
    } catch {
      // ignore
    }
  }, [tradeHistory]);

  // Toast notification state & Custom Demo Fund modal state
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [customFundInput, setCustomFundInput] = useState<string>(() => balance.toString());

  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  // When selected asset changes, generate 500 candles anchored to that asset's current live price
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    const targetPrice = assetPrices[asset.id] ?? asset.basePrice;
    setCandles(generateCandles(asset, 500, timeframe, targetPrice));
  };

  // When timeframe changes on the chart, regenerate 500 candles for that timeframe anchored to live price
  const handleChangeTimeframe = (tf: string) => {
    setTimeframe(tf);
    const targetPrice = assetPrices[selectedAsset.id] ?? selectedAsset.basePrice;
    setCandles(generateCandles(selectedAsset, 500, tf, targetPrice));
  };

  // Simulate a high-impact news release spike on the chart
  const handleSimulateVolatilitySpike = (asset: Asset, direction: 'BULLISH' | 'BEARISH') => {
    const baseLive = assetPrices[asset.id] ?? asset.basePrice;
    const movePct = asset.category === 'forex' ? 0.0045 : 0.018;
    const signedPct = direction === 'BULLISH' ? movePct : -movePct;
    const spikedPrice = Number((baseLive * (1 + signedPct)).toFixed(asset.precision));

    const baseSeries =
      asset.id === selectedAsset.id
        ? candles
        : generateCandles(asset, 500, timeframe, baseLive);

    if (baseSeries.length > 0) {
      const prevLast = baseSeries[baseSeries.length - 1];
      const high = Number(
        (Math.max(prevLast.close, spikedPrice) * (1 + Math.abs(signedPct) * 0.25)).toFixed(
          asset.precision
        )
      );
      const low = Number(
        (Math.min(prevLast.close, spikedPrice) * (1 - Math.abs(signedPct) * 0.25)).toFixed(
          asset.precision
        )
      );
      const newsCandle: Candle = {
        time: Date.now(),
        open: prevLast.close,
        high,
        low,
        close: spikedPrice,
        volume: Math.round(prevLast.volume * 3.4),
      };
      setSelectedAsset(asset);
      setCandles([...baseSeries.slice(-499), newsCandle]);
      setAssetPrices((prev) => ({ ...prev, [asset.id]: spikedPrice }));
    }

    setActiveTab('CHART');
    showToast(
      language === 'bn'
        ? `⚡ ${asset.symbol} পেয়ারে ${direction === 'BULLISH' ? 'বুলিশ (Bullish)' : 'বিয়ারিশ (Bearish)'} নিউজ ইমপ্যাক্ট ক্যান্ডেল তৈরি হয়েছে!`
        : `⚡ Simulated ${direction} High-Impact News Spike on ${asset.symbol}!`,
      direction === 'BULLISH' ? 'success' : 'danger'
    );
  };

  const nowUtcFloat =
    new Date().getUTCHours() + new Date().getUTCMinutes() / 60;
  const activeSessionsNow = QUICK_SESSIONS.filter((s) =>
    s.openUtcHour < s.closeUtcHour
      ? nowUtcFloat >= s.openUtcHour && nowUtcFloat < s.closeUtcHour
      : nowUtcFloat >= s.openUtcHour || nowUtcFloat < s.closeUtcHour
  );
  const nextHighImpactEvent = NEXT_HIGH_IMPACT_PREVIEW;

  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle ? lastCandle.close : (assetPrices[selectedAsset.id] ?? selectedAsset.basePrice);

  // Counter to produce new candle every ~12 ticks
  const tickCounterRef = useRef(0);
  const [tickEngineReady, setTickEngineReady] = useState<boolean>(false);

  // Start background live price ticking immediately on user interaction or after initial 6.5s quiet window
  useEffect(() => {
    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      setTickEngineReady(true);
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
    events.forEach((evt) => window.addEventListener(evt, activate, { once: true, passive: true }));
    const timer = setTimeout(activate, 6500);
    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, activate));
    };
  }, []);

  const candlesRef = useRef<Candle[]>(candles);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  // Live price tick simulation loop for both selected chart candles & all background assets
  useEffect(() => {
    if (!isLiveTicking || !tickEngineReady) return;

    const intervalMs = Math.max(250, 1200 / tickSpeed);
    const interval = setInterval(() => {
      const currentCandles = candlesRef.current;
      if (currentCandles.length === 0) return;

      tickCounterRef.current += 1;
      const isNewCandle = tickCounterRef.current >= 12;
      if (isNewCandle) tickCounterRef.current = 0;

      const last = currentCandles[currentCandles.length - 1];
      const { updatedCandle, newCandle } = simulateTick(last, selectedAsset, isNewCandle);
      const latestClose = newCandle ? newCandle.close : updatedCandle.close;

      const nextCandles = newCandle
        ? [...currentCandles.slice(-499), newCandle]
        : [...currentCandles.slice(0, -1), updatedCandle];

      candlesRef.current = nextCandles;
      setCandles(nextCandles);

      setAssetPrices((prevPrices) => {
        const nextPrices: Record<string, number> = {
          ...prevPrices,
          [selectedAsset.id]: latestClose,
        };
        for (const a of TRADING_ASSETS) {
          if (a.id === selectedAsset.id) continue;
          const prevP = prevPrices[a.id] ?? a.basePrice;
          const vol = a.category === 'forex' ? 0.0003 : 0.0015;
          const deltaPct = (Math.random() - 0.495) * vol;
          nextPrices[a.id] = Number((prevP * (1 + deltaPct)).toFixed(a.precision));
        }
        return nextPrices;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isLiveTicking, tickEngineReady, tickSpeed, selectedAsset]);

  // Evaluate open positions across ALL assets on live price ticks (check SL/TP/Liquidation & PnL)
  useEffect(() => {
    if (positions.length === 0) return;

    const updatedPositions: Position[] = [];
    const newClosedTrades: TradeHistory[] = [];
    let balanceDelta = 0;
    let toastEvent: { msg: string; type: 'success' | 'danger' | 'info' } | null = null;
    let hasChanges = false;

    for (const pos of positions) {
      const liveAssetPrice =
        pos.assetId === selectedAsset.id
          ? currentPrice
          : assetPrices[pos.assetId] ?? pos.currentPrice;

      if (liveAssetPrice !== pos.currentPrice) {
        hasChanges = true;
      }

      const diff =
        pos.side === 'LONG' ? liveAssetPrice - pos.entryPrice : pos.entryPrice - liveAssetPrice;
      const pnl = diff * pos.size;
      const pnlPercent = (pnl / pos.margin) * 100;

      // Check Take Profit hit
      if (pos.takeProfit) {
        const tpHit =
          pos.side === 'LONG'
            ? liveAssetPrice >= pos.takeProfit
            : liveAssetPrice <= pos.takeProfit;
        if (tpHit) {
          hasChanges = true;
          const exitP = pos.takeProfit;
          const tpDiff = pos.side === 'LONG' ? exitP - pos.entryPrice : pos.entryPrice - exitP;
          const tpPnl = tpDiff * pos.size;
          const tpPnlPercent = (tpPnl / pos.margin) * 100;

          toastEvent = {
            msg: `🎯 TP Hit! ${pos.symbol} ${pos.side} (+$${Math.abs(tpPnl).toFixed(2)})`,
            type: 'success',
          };
          balanceDelta += pos.margin + tpPnl;
          newClosedTrades.push({
            id: `th-${Date.now()}-${pos.id}`,
            assetId: pos.assetId,
            symbol: pos.symbol,
            side: pos.side,
            entryPrice: pos.entryPrice,
            exitPrice: exitP,
            size: pos.size,
            leverage: pos.leverage,
            pnl: tpPnl,
            pnlPercent: tpPnlPercent,
            closeTime: Date.now(),
            reason: 'TAKE_PROFIT',
          });
          continue;
        }
      }

      // Check Stop Loss hit
      if (pos.stopLoss) {
        const slHit =
          pos.side === 'LONG'
            ? liveAssetPrice <= pos.stopLoss
            : liveAssetPrice >= pos.stopLoss;
        if (slHit) {
          hasChanges = true;
          const exitP = pos.stopLoss;
          const slDiff = pos.side === 'LONG' ? exitP - pos.entryPrice : pos.entryPrice - exitP;
          const slPnl = Math.max(-pos.margin, slDiff * pos.size);
          const slPnlPercent = (slPnl / pos.margin) * 100;

          toastEvent = {
            msg: `🛑 SL Hit! ${pos.symbol} ${pos.side} (-$${Math.abs(slPnl).toFixed(2)})`,
            type: 'danger',
          };
          balanceDelta += Math.max(0, pos.margin + slPnl);
          newClosedTrades.push({
            id: `th-${Date.now()}-${pos.id}`,
            assetId: pos.assetId,
            symbol: pos.symbol,
            side: pos.side,
            entryPrice: pos.entryPrice,
            exitPrice: exitP,
            size: pos.size,
            leverage: pos.leverage,
            pnl: slPnl,
            pnlPercent: slPnlPercent,
            closeTime: Date.now(),
            reason: 'STOP_LOSS',
          });
          continue;
        }
      }

      // Check Liquidation
      if (pos.liquidationPrice > 0) {
        const liqHit =
          pos.side === 'LONG'
            ? liveAssetPrice <= pos.liquidationPrice
            : liveAssetPrice >= pos.liquidationPrice;
        if (liqHit) {
          hasChanges = true;
          toastEvent = {
            msg: `⚠️ Liquidation! ${pos.symbol} (-$${pos.margin.toFixed(2)})`,
            type: 'danger',
          };
          newClosedTrades.push({
            id: `th-${Date.now()}-${pos.id}`,
            assetId: pos.assetId,
            symbol: pos.symbol,
            side: pos.side,
            entryPrice: pos.entryPrice,
            exitPrice: pos.liquidationPrice,
            size: pos.size,
            leverage: pos.leverage,
            pnl: -pos.margin,
            pnlPercent: -100,
            closeTime: Date.now(),
            reason: 'STOP_LOSS',
          });
          continue;
        }
      }

      updatedPositions.push({
        ...pos,
        currentPrice: liveAssetPrice,
        pnl,
        pnlPercent,
      });
    }

    if (hasChanges) {
      setPositions(updatedPositions);
    }
    if (balanceDelta !== 0) {
      setBalance((b) => Math.max(0, b + balanceDelta));
    }
    if (newClosedTrades.length > 0) {
      setTradeHistory((th) => [...newClosedTrades, ...th]);
    }
    if (toastEvent) {
      showToast(toastEvent.msg, toastEvent.type);
    }
  }, [currentPrice, assetPrices, selectedAsset.id, showToast]);

  // Open position handler
  const handleOpenPosition = (order: {
    asset: Asset;
    side: OrderSide;
    entryPrice: number;
    size: number;
    margin: number;
    leverage: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    if (order.margin > balance) {
      showToast(t('insufficientBalanceError'), 'danger');
      return;
    }

    // Deduct margin from balance
    setBalance((b) => b - order.margin);

    // Calculate liquidation price
    const maintenanceFactor = 0.9 / order.leverage;
    const liqPrice =
      order.side === 'LONG'
        ? order.leverage > 1
          ? order.entryPrice * (1 - maintenanceFactor)
          : 0
        : order.entryPrice * (1 + maintenanceFactor);

    const newPosition: Position = {
      id: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      assetId: order.asset.id,
      symbol: order.asset.symbol,
      side: order.side,
      entryPrice: order.entryPrice,
      currentPrice: order.entryPrice,
      size: order.size,
      margin: order.margin,
      leverage: order.leverage,
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
      pnl: 0,
      pnlPercent: 0,
      liquidationPrice: liqPrice,
      openTime: Date.now(),
    };

    setPositions((prev) => [newPosition, ...prev]);
    showToast(
      `${order.asset.symbol} ${order.side} — ${t('positionOpenedToast')}`,
      'success'
    );
  };

  // Close position handler
  const handleClosePosition = (id: string, reason: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS' = 'MANUAL') => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const returnFunds = Math.max(0, pos.margin + pos.pnl);
    setBalance((b) => Math.max(0, b + returnFunds));

    setTradeHistory((th) => [
      {
        id: `th-${Date.now()}`,
        assetId: pos.assetId,
        symbol: pos.symbol,
        side: pos.side,
        entryPrice: pos.entryPrice,
        exitPrice: pos.currentPrice,
        size: pos.size,
        leverage: pos.leverage,
        pnl: pos.pnl,
        pnlPercent: pos.pnlPercent,
        closeTime: Date.now(),
        reason,
      },
      ...th,
    ]);

    setPositions((prev) => prev.filter((p) => p.id !== id));
    showToast(
      `${pos.symbol} ${t('positionClosedToast')} (${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(2)})`,
      pos.pnl >= 0 ? 'success' : 'info'
    );
  };

  // Open Custom Demo Fund & Reset modal
  const handleResetDemo = () => {
    setCustomFundInput(Math.max(10, Math.round(balance)).toString());
    setShowResetModal(true);
  };

  // Validate custom fund amount (between $10 and $10,000,000)
  const getValidatedCustomFund = (): number | null => {
    const parsed = parseFloat(customFundInput);
    if (isNaN(parsed) || parsed < 10 || parsed > 10000000) {
      showToast(
        language === 'bn'
          ? 'অনুগ্রহ করে $10 থেকে $10,000,000 এর মধ্যে যেকোনো বৈধ ডেমো ফান্ড লিখুন।'
          : 'Please enter a valid Demo Fund amount between $10 and $10,000,000.',
        'danger'
      );
      return null;
    }
    return Number(parsed.toFixed(2));
  };

  // Option 1: Set custom balance ONLY (keep open positions & trade history intact)
  const handleApplyCustomBalanceOnly = (directAmount?: number) => {
    const targetAmount = directAmount !== undefined ? directAmount : getValidatedCustomFund();
    if (targetAmount === null) return;

    setBalance(targetAmount);
    try {
      localStorage.setItem('tradebd_balance', targetAmount.toString());
    } catch {
      // ignore
    }
    setShowResetModal(false);
    showToast(
      language === 'bn'
        ? `✅ আপনার ডেমো ব্যালেন্স $${targetAmount.toLocaleString()} এ সেট করা হয়েছে!`
        : `✅ Demo Fund updated to $${targetAmount.toLocaleString()}!`,
      'success'
    );
  };

  // Option 2: Add / Top-up custom amount to existing balance
  const handleTopUpBalance = () => {
    const addAmount = getValidatedCustomFund();
    if (addAmount === null) return;

    const nextBal = Number(Math.min(10000000, balance + addAmount).toFixed(2));
    setBalance(nextBal);
    try {
      localStorage.setItem('tradebd_balance', nextBal.toString());
    } catch {
      // ignore
    }
    setShowResetModal(false);
    showToast(
      language === 'bn'
        ? `➕ আপনার ব্যালেন্সে +$${addAmount.toLocaleString()} যোগ হয়েছে! মোট ব্যালেন্স: $${nextBal.toLocaleString()}`
        : `➕ Added +$${addAmount.toLocaleString()} to Demo Fund! New Balance: $${nextBal.toLocaleString()}`,
      'success'
    );
  };

  // Option 3: Full account reset (clear positions & history) with chosen custom starting fund
  const confirmResetDemo = () => {
    const targetAmount = getValidatedCustomFund();
    if (targetAmount === null) return;

    setBalance(targetAmount);
    setPositions([]);
    setTradeHistory([]);
    try {
      localStorage.setItem('tradebd_balance', targetAmount.toString());
      localStorage.removeItem('tradebd_positions');
      localStorage.removeItem('tradebd_history');
    } catch {
      // ignore
    }
    setShowResetModal(false);
    showToast(
      language === 'bn'
        ? `🔄 একাউন্ট রিসেট সম্পন্ন হয়েছে! নতুন ডেমো ফান্ড: $${targetAmount.toLocaleString()}`
        : `🔄 Account reset complete! Starting Demo Fund: $${targetAmount.toLocaleString()}`,
      'success'
    );
  };

  // Dynamic Quick Trade margin on Chart tab (uses $500 if balance >= $500, or 20% of balance for smaller custom funds)
  const quickTradeMargin =
    balance >= 500
      ? 500
      : balance >= 10
      ? Math.max(2, Math.floor(balance * 0.2))
      : Math.max(1, Number((balance * 0.5).toFixed(2)));

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        activeLegalSection={legalSection}
        onSelectTab={handleSelectTab}
        onOpenLegalSection={openLegalPage}
        balance={balance}
        openPositionsCount={positions.length}
        onResetDemo={handleResetDemo}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-14 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 text-xs font-medium max-w-md">
          {toast.type === 'success' && (
            <div className="bg-emerald-950/90 text-emerald-200 border-emerald-700/80 p-3 rounded-lg flex items-center gap-2 w-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-emerald-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {toast.type === 'danger' && (
            <div className="bg-rose-950/90 text-rose-200 border-rose-700/80 p-3 rounded-lg flex items-center gap-2 w-full">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-rose-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {toast.type === 'info' && (
            <div className="bg-slate-900/90 text-cyan-200 border-cyan-800/80 p-3 rounded-lg flex items-center gap-2 w-full">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-cyan-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* In-App Custom Demo Fund & Account Reset Manager Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === 'bn'
                      ? 'ইচ্ছামতো কাস্টম ডেমো ফান্ড নিন / রিসেট করুন'
                      : 'Set Custom Demo Fund & Account Reset'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'আপনার পছন্দমতো যেকোনো পরিমাণ ভার্চুয়াল ব্যালেন্স ($10 – $10,000,000) নিয়ে ট্রেডিং প্র্যাকটিস করুন'
                    : 'Choose any virtual balance ($10 – $10,000,000) to match your real trading goals'}
                </p>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Amount Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {language === 'bn'
                  ? '১-ক্লিকে প্রিসেট ডেমো ফান্ড নির্বাচন করুন:'
                  : '1-Click Preset Demo Amounts:'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 font-mono text-xs">
                {[50, 100, 500, 1000, 5000, 10000, 25000, 50000, 100000].map((preset) => {
                  const isSelected = parseFloat(customFundInput) === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomFundInput(preset.toString())}
                      className={`py-2 px-2.5 rounded-lg border font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      ${preset.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300">
                  {language === 'bn'
                    ? 'অথবা আপনার ইচ্ছামতো যেকোনো অংক লিখুন ($ USD):'
                    : 'Or Enter Any Custom Amount ($ USD):'}
                </label>
                <span className="font-mono text-[11px] text-slate-400">
                  {language === 'bn' ? 'বর্তমান:' : 'Current:'} ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-emerald-400 font-mono font-bold text-sm">$</span>
                <input
                  type="number"
                  min="10"
                  max="10000000"
                  step="any"
                  value={customFundInput}
                  onChange={(e) => setCustomFundInput(e.target.value)}
                  placeholder="e.g. 250, 1500, 25000"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-white font-mono text-sm font-bold focus:outline-hidden"
                />
              </div>
            </div>

            {/* Action Choices */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyCustomBalanceOnly()}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer shadow-sm"
                >
                  {language === 'bn'
                    ? 'শুধু ফান্ড সেট করুন (ট্রেড বজায় রাখুন)'
                    : 'Set Balance Only (Keep Trades)'}
                </button>
                <button
                  type="button"
                  onClick={handleTopUpBalance}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn'
                    ? '+ বর্তমান ব্যালেন্সের সাথে যোগ করুন'
                    : '+ Add (Top-Up) to Current Fund'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={confirmResetDemo}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-700/70 text-rose-200 transition-colors cursor-pointer"
                >
                  {language === 'bn'
                    ? 'সব ওপেন ট্রেড মুছে নতুন ফান্ড দিয়ে রিসেট করুন'
                    : 'Reset All Trades & Start with This Fund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        <h1 className="sr-only">
          {language === 'bn'
            ? 'Tradebd – ট্রেডিং একাডেমি ও টেকনিক্যাল অ্যানালাইসিস প্ল্যাটফর্ম'
            : 'Tradebd – Trading Academy & Technical Analysis Platform'}
        </h1>
        {/* TAB 1: CHART ANALYSIS & QUICK TRADE WORKSPACE */}
        {activeTab === 'CHART' && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Separate CRYPTO & FOREX Market Sections Bar */}
            <MarketSectionsBar
              selectedAsset={selectedAsset}
              currentPrice={currentPrice}
              assetPrices={assetPrices}
              onSelectAsset={handleSelectAsset}
            />

            {/* Split Grid: Candlestick Chart (8 cols) + Side Action Panel (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
              {/* Main Interactive Candlestick Chart */}
              <div className="lg:col-span-8 flex flex-col min-h-[500px]">
                <CandlestickChart
                  candles={candles}
                  asset={selectedAsset}
                  isLiveTicking={isLiveTicking}
                  tickSpeed={tickSpeed}
                  onToggleLive={() => setIsLiveTicking(!isLiveTicking)}
                  onChangeSpeed={setTickSpeed}
                  timeframe={timeframe}
                  onChangeTimeframe={handleChangeTimeframe}
                  onSelectPriceForOrder={(_price, side) => {
                    setSimulatorDefaultSide(side);
                    handleSelectTab('SIMULATOR');
                  }}
                />
              </div>

              {/* Side Fast-Action & Educational Context Panel */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Fast Order Execution Mini Panel */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      {t('quickTradeTitle')}
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      {t('balanceLabel')}: ${balance.toFixed(0)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${
                          selectedAsset.category === 'crypto'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {selectedAsset.category === 'crypto' ? 'CRYPTO' : 'FOREX'}
                      </span>
                      <span className="text-slate-300 font-semibold">
                        {selectedAsset.symbol}:
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      ${currentPrice.toFixed(selectedAsset.precision)}
                    </span>
                  </div>

                  {/* Buy / Sell Quick Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const dist = selectedAsset.category === 'forex' ? 0.005 : 0.015;
                        handleOpenPosition({
                          asset: selectedAsset,
                          side: 'LONG',
                          entryPrice: currentPrice,
                          size: (quickTradeMargin * 5) / currentPrice,
                          margin: quickTradeMargin,
                          leverage: 5,
                          stopLoss: Number(
                            (currentPrice * (1 - dist)).toFixed(selectedAsset.precision)
                          ),
                          takeProfit: Number(
                            (currentPrice * (1 + dist * 2)).toFixed(selectedAsset.precision)
                          ),
                        });
                      }}
                      className="min-h-[38px] py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{t('quickBuyLong')}</span>
                    </button>

                    <button
                      onClick={() => {
                        const dist = selectedAsset.category === 'forex' ? 0.005 : 0.015;
                        handleOpenPosition({
                          asset: selectedAsset,
                          side: 'SHORT',
                          entryPrice: currentPrice,
                          size: (quickTradeMargin * 5) / currentPrice,
                          margin: quickTradeMargin,
                          leverage: 5,
                          stopLoss: Number(
                            (currentPrice * (1 + dist)).toFixed(selectedAsset.precision)
                          ),
                          takeProfit: Number(
                            (currentPrice * (1 - dist * 2)).toFixed(selectedAsset.precision)
                          ),
                        });
                      }}
                      className="min-h-[38px] py-2.5 px-3 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{t('quickSellShort')}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 text-center">
                    {language === 'bn'
                      ? `* কুইক ট্রেডে $${quickTradeMargin} মার্জিন (5x লিভারেজ) ও অটো ১:২ স্টপ-লস/টেক-প্রফিট সেট হয়।`
                      : `* Quick trade uses $${quickTradeMargin} margin (5x leverage) with automatic 1:2 SL/TP.`}
                  </p>

                  <button
                    onClick={() => handleSelectTab('SIMULATOR')}
                    className="min-h-[36px] w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
                  >
                    {t('customOrderBtn')}
                  </button>
                </div>

                {/* Technical Analysis Checklist for Beginners */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('checklistTitle')}</span>
                    </h2>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">1.</span>
                        <span>{t('checkTrend')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">2.</span>
                        <span>{t('checkSR')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">3.</span>
                        <span>{t('checkRSI')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">4.</span>
                        <span>{t('checkRR')}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{t('wantToLearn')}</span>
                    <button
                      onClick={() => handleSelectTab('ACADEMY')}
                      className="min-h-[30px] px-2 py-1 text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer"
                    >
                      {t('viewAcademyCourse')}
                    </button>
                  </div>
                </div>

                {/* Live Trading Session & Next High-Impact Economic News Mini Card */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {language === 'bn' ? 'লাইভ সেশন ও পরবর্তী নিউজ' : 'Live Session & Next News'}
                      </span>
                    </h2>
                    <span className="text-[11px] font-mono text-emerald-300 font-semibold">
                      {activeSessionsNow.length > 0
                        ? activeSessionsNow
                            .map((s) =>
                              language === 'bn' ? s.nameBn.split(' ')[0] : s.nameEn.split(' ')[0]
                            )
                            .join(' + ')
                        : 'Crypto 24/7'}
                    </span>
                  </div>

                  {nextHighImpactEvent && (
                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-300 font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>
                            {language === 'bn' ? 'হাই-ইমপ্যাক্ট নিউজ' : 'High-Impact Release'}
                          </span>
                        </span>
                        <span className="font-mono text-slate-300 font-semibold">
                          {nextHighImpactEvent.timeBst} BST
                        </span>
                      </div>
                      <div className="font-bold text-slate-100 truncate">
                        {nextHighImpactEvent.flag}{' '}
                        {language === 'bn'
                          ? nextHighImpactEvent.titleBn
                          : nextHighImpactEvent.titleEn}
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center justify-between">
                        <span>
                          {language === 'bn' ? 'পূর্ববর্তী:' : 'Prev:'} {nextHighImpactEvent.previous}
                        </span>
                        <span>
                          {language === 'bn' ? 'পূর্বাভাস:' : 'Forecast:'}{' '}
                          <strong className="text-slate-100">{nextHighImpactEvent.forecast}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSelectTab('CALENDAR')}
                    className="min-h-[36px] w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
                  >
                    {language === 'bn'
                      ? 'অর্থনৈতিক ক্যালেন্ডার, সেশন ও নিউজ দেখুন →'
                      : 'Open Economic Calendar, Sessions & News →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE PAPER TRADING SIMULATOR */}
        {activeTab === 'SIMULATOR' && (
          <div className="flex flex-col gap-4 flex-1">
            <MarketSectionsBar
              selectedAsset={selectedAsset}
              currentPrice={currentPrice}
              assetPrices={assetPrices}
              onSelectAsset={handleSelectAsset}
            />
            <React.Suspense fallback={<LazyFallback />}>
              <PaperTradingPanel
                currentAsset={selectedAsset}
                currentPrice={currentPrice}
                balance={balance}
                positions={positions}
                tradeHistory={tradeHistory}
                onOpenPosition={handleOpenPosition}
                onClosePosition={handleClosePosition}
                onResetAccount={handleResetDemo}
                onSetCustomBalance={(amt) => handleApplyCustomBalanceOnly(amt)}
                defaultSide={simulatorDefaultSide}
              />
            </React.Suspense>
          </div>
        )}

        {/* TAB 2.5: ECONOMIC CALENDAR, TRADING SESSIONS & MARKET NEWS */}
        {activeTab === 'CALENDAR' && (
          <React.Suspense fallback={<LazyFallback />}>
            <MarketIntelView
              onSelectAssetAndGoToChart={(asset) => {
                handleSelectAsset(asset);
                handleSelectTab('CHART');
              }}
              onSimulateVolatilitySpike={handleSimulateVolatilitySpike}
            />
          </React.Suspense>
        )}

        {/* TAB 3: TRADING ACADEMY & LESSONS */}
        {activeTab === 'ACADEMY' && (
          <React.Suspense fallback={<LazyFallback />}>
            <AcademyView />
          </React.Suspense>
        )}

        {/* TAB 3.5: EDUCATIONAL BLOG & ARTICLE PUBLISHING STUDIO */}
        {activeTab === 'BLOG' && (
          <React.Suspense fallback={<LazyFallback />}>
            <BlogView
              initialSlug={blogSlug}
              onSelectSlug={(nextSlug) => {
                setBlogSlug(nextSlug);
                const target = nextSlug ? `/blog/${nextSlug}` : '/blog';
                try {
                  window.history.pushState(null, '', target);
                } catch {
                  window.location.hash = nextSlug ? `blog/${nextSlug}` : 'blog';
                }
              }}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onShowToast={showToast}
            />
          </React.Suspense>
        )}

        {/* TAB 4: PATTERNS CHEATSHEET & GALLERY */}
        {activeTab === 'PATTERNS' && (
          <React.Suspense fallback={<LazyFallback />}>
            <PatternGallery
              onSelectPatternForChart={(pattern) => {
                handleSelectTab('CHART');
                showToast(
                  language === 'bn'
                    ? `📊 "${pattern.nameBn}" প্যাটার্নটি লাইভ চার্টে খুঁজুন — এন্ট্রি: ${pattern.entryRuleBn}`
                    : `📊 Practice "${pattern.name}" on Live Chart — Entry: ${pattern.entryRule}`,
                  'info'
                );
              }}
            />
          </React.Suspense>
        )}

        {/* TAB 5: RISK & POSITION SIZING CALCULATOR */}
        {activeTab === 'CALCULATOR' && (
          <React.Suspense fallback={<LazyFallback />}>
            <RiskCalculator
              currentBalance={balance}
              initialEntryPrice={currentPrice}
              selectedAsset={selectedAsset}
              assetPrices={assetPrices}
            />
          </React.Suspense>
        )}

        {/* TAB 6: AI TRADE MENTOR & ANALYZER */}
        {activeTab === 'MENTOR' && (
          <div className="flex flex-col gap-4 flex-1">
            <MarketSectionsBar
              selectedAsset={selectedAsset}
              currentPrice={currentPrice}
              assetPrices={assetPrices}
              onSelectAsset={handleSelectAsset}
            />
            <React.Suspense fallback={<LazyFallback />}>
              <AiMentorView currentAsset={selectedAsset} currentPrice={currentPrice} />
            </React.Suspense>
          </div>
        )}

        {/* TAB 7: LEGAL, ABOUT, PRIVACY POLICY, DISCLAIMER & CONTACT PAGES */}
        {activeTab === 'LEGAL' && (
          <React.Suspense fallback={<LazyFallback />}>
            <LegalPagesView
              activeSection={legalSection}
              onSelectSection={(sec) => {
                openLegalPage(sec);
              }}
              onBackToChart={() => {
                handleSelectTab('CHART');
              }}
            />
          </React.Suspense>
        )}

        {/* Crawlable Semantic Trading Knowledge Hub & Featured Blog Guides (Visible to Users & Googlebot WRS) */}
        {activeTab === 'CHART' && (
          <section
            aria-label="Tradebd Educational Guides & Platform Overview"
            className="mt-6 bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  {language === 'bn'
                    ? 'Tradebd – ফ্রি ফরেক্স ও ক্রিপ্টো ট্রেডিং একাডেমি, টেকনিক্যাল অ্যানালাইসিস ও ডেমো সিমুলেটর গাইড'
                    : 'Tradebd – Complete Forex & Crypto Trading Academy, Technical Analysis & Paper Trading Hub'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'bn'
                    ? 'কোনো নিবন্ধন বা আর্থিক ঝুঁকি ছাড়াই লাইভ ক্যান্ডেলস্টিক চার্ট বিশ্লেষণ, কাস্টম ডেমো ফান্ড ($10–$10,000,000) দিয়ে পেপার ট্রেডিং এবং প্রাতিষ্ঠানিক রিস্ক ম্যানেজমেন্ট শিখুন।'
                    : 'Master institutional price action, candlestick chart patterns, Bangladesh Standard Time (BST UTC+6) Forex sessions, and 1% risk management with zero financial risk.'}
                </p>
              </div>
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('BLOG');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold whitespace-nowrap self-start sm:self-center transition-colors"
              >
                {language === 'bn' ? 'সবগুলো ব্লগ আর্টিকেল পড়ুন →' : 'Explore All Trading Guides →'}
              </a>
            </div>

            {/* Featured SEO Blog Articles Grid (Direct Crawlable <a href="/blog/..."> Links) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                {language === 'bn'
                  ? 'জনপ্রিয় ফরেক্স ও ক্রিপ্টো ট্রেডিং গাইডসমূহ (Featured Educational Articles)'
                  : 'Featured Forex & Crypto Trading Guides (Bengali & English)'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    slug: 'forex-trading-bangla-complete-guide',
                    titleBn: 'ফরেক্স ট্রেডিং কি এবং কিভাবে শুরু করবেন? (A-to-Z বাংলা গাইড)',
                    titleEn: 'What is Forex Trading & How to Start? Complete Beginner Guide',
                    tag: 'Forex Basics',
                  },
                  {
                    slug: 'candlestick-chart-patterns-bangla-guide',
                    titleBn: 'সবচেয়ে কার্যকরী ১২টি ক্যান্ডেলস্টিক চার্ট প্যাটার্ন ও এন্ট্রি নিয়ম',
                    titleEn: 'Top 12 High-Probability Candlestick Chart Patterns & Entry Rules',
                    tag: 'Price Action',
                  },
                  {
                    slug: 'risk-management-lot-size-stop-loss-formula',
                    titleBn: 'ফরেক্স ও ক্রিপ্টো রিস্ক ম্যানেজমেন্ট: ১% রুল, লট সাইজ ও স্টপ লস সূত্র',
                    titleEn: 'Risk Management: 1% Rule, Lot Size & Stop Loss Formula',
                    tag: 'Risk Control',
                  },
                  {
                    slug: 'best-forex-trading-sessions-bangladesh-time-bst',
                    titleBn: 'বাংলাদেশ সময় (BST) অনুযায়ী সেরা ফরেক্স ট্রেডিং সেশন (লন্ডন ও নিউ ইয়র্ক)',
                    titleEn: 'Best Forex Trading Sessions in Bangladesh Time (BST UTC+6)',
                    tag: 'BST Sessions',
                  },
                  {
                    slug: 'support-and-resistance-trading-strategy-bangla',
                    titleBn: 'সাপোর্ট ও রেজিস্ট্যান্স জোন আঁকার সঠিক নিয়ম এবং ব্রেকআউট স্ট্র্যাটেজি',
                    titleEn: 'Support & Resistance Institutional Zones & Breakout Strategy',
                    tag: 'Technical Analysis',
                  },
                  {
                    slug: 'rsi-ema-bollinger-bands-indicator-strategy-bangla',
                    titleBn: 'RSI, EMA 20/50 এবং Bollinger Bands দিয়ে নিখুঁত ট্রেডিং কনফ্লুয়েন্স',
                    titleEn: 'RSI, EMA 20/50 & Bollinger Bands Indicator Confluence Guide',
                    tag: 'Indicators',
                  },
                  {
                    slug: 'crypto-paper-trading-simulator-beginner-guide',
                    titleBn: 'কাস্টম ডেমো ফান্ড দিয়ে পেপার ট্রেডিং প্র্যাকটিস করার পূর্ণাঙ্গ গাইড',
                    titleEn: 'How to Practice Crypto & Forex Paper Trading with Demo Funds',
                    tag: 'Simulator',
                  },
                  {
                    slug: 'trading-psychology-fomo-revenge-trading-control',
                    titleBn: 'ট্রেডিং সাইকোলজি: FOMO এবং ওভার-ট্রেডিং নিয়ন্ত্রণ করার ১০টি গোল্ডেন রুল',
                    titleEn: 'Trading Psychology: 10 Golden Rules to Stop FOMO & Revenge Trading',
                    tag: 'Psychology',
                  },
                ].map((guide) => (
                  <a
                    key={guide.slug}
                    href={`/blog/${guide.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setBlogSlug(guide.slug);
                      setActiveTab('BLOG');
                      try {
                        window.history.pushState(null, '', `/blog/${guide.slug}`);
                      } catch {
                        window.location.hash = `blog/${guide.slug}`;
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2 group"
                  >
                    <div className="space-y-1.5">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-950 text-emerald-300 border border-emerald-500/30">
                        {guide.tag}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 leading-snug transition-colors">
                        {language === 'bn' ? guide.titleBn : guide.titleEn}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-cyan-400">
                      {language === 'bn' ? 'বিস্তারিত পড়ুন →' : 'Read Full Guide →'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Global Site Footer (Required for Google AdSense Compliance, Trust & Navigation) */}
      <footer className="bg-[#080c14] border-t border-slate-800/90 text-slate-400 text-xs mt-8 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Column 1: Brand & Mission */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.svg"
                  alt="Tradebd – Trading Academy & Technical Analysis Platform Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-md shrink-0"
                />
                <h2 className="text-sm font-extrabold text-white tracking-tight">
                  {t('appName')} (tradebd.online)
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                {language === 'bn'
                  ? 'Tradebd হলো একটি সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য ফরেক্স ও ক্রিপ্টো ট্রেডিং একাডেমি, টেকনিক্যাল চার্ট অ্যানালাইসিস ও ভার্চুয়াল পেপার ট্রেডিং প্ল্যাটফর্ম। আসল অর্থ ঝুঁকিতে না ফেলে ট্রেডিং দক্ষতা ও রিস্ক ম্যানেজমেন্ট শিখুন।'
                  : 'Tradebd is a free Forex & Crypto Trading Academy, interactive technical analysis chart platform, economic calendar, and virtual paper trading simulator designed to build disciplined risk management skills.'}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Support: support@tradebd.online · Dhaka, Bangladesh (BST UTC+6)
              </div>
            </div>

            {/* Column 2: Platform Tools (Semantic crawlable anchor links for Googlebot Sitelinks) */}
            <div className="md:col-span-4 space-y-2">
              <h2 className="text-white font-bold uppercase tracking-wider text-[11px]">
                {language === 'bn' ? 'প্ল্যাটফর্ম ফিচারসমূহ' : 'Platform Features'}
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('CHART');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'লাইভ চার্ট অ্যানালাইসিস' : 'Live Chart Analysis'}
                </a>
                <a
                  href="/simulator"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('SIMULATOR');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'পেপার ট্রেডিং সিমুলেটর' : 'Paper Trading Simulator'}
                </a>
                <a
                  href="/calendar"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('CALENDAR');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'অর্থনৈতিক ক্যালেন্ডার ও সেশন' : 'Economic Calendar & Sessions'}
                </a>
                <a
                  href="/academy"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('ACADEMY');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'ট্রেডিং একাডেমি কোর্স' : 'Trading Academy Course'}
                </a>
                <a
                  href="/patterns"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('PATTERNS');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'ক্যান্ডেলস্টিক প্যাটার্ন' : 'Candlestick Patterns'}
                </a>
                <a
                  href="/calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('CALCULATOR');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'রিস্ক ও লট ক্যালকুলেটর' : 'Risk & Lot Calculator'}
                </a>
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab('BLOG');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center text-left text-emerald-300 hover:text-emerald-200 font-semibold transition-colors cursor-pointer"
                >
                  {language === 'bn' ? '✍️ শিক্ষণীয় ব্লগ ও আর্টিকেল' : '✍️ Trading Blog & Articles'}
                </a>
              </div>
            </div>

            {/* Column 3: Legal, Privacy & AdSense Compliance Links */}
            <div className="md:col-span-3 space-y-2">
              <h2 className="text-white font-bold uppercase tracking-wider text-[11px]">
                {language === 'bn' ? 'আইনি ও নীতিমালা (Legal)' : 'Legal & Compliance'}
              </h2>
              <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('ABOUT');
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center hover:text-cyan-300 transition-colors"
                >
                  {language === 'bn' ? 'আমাদের সম্পর্কে (About Us)' : 'About Us'}
                </a>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('PRIVACY');
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center hover:text-cyan-300 transition-colors"
                >
                  {language === 'bn' ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}
                </a>
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('TERMS');
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center hover:text-cyan-300 transition-colors"
                >
                  {language === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms of Use)' : 'Terms & Conditions'}
                </a>
                <a
                  href="/disclaimer"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('DISCLAIMER');
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center hover:text-cyan-300 transition-colors"
                >
                  {language === 'bn' ? 'ঝুঁকি সতর্কবার্তা (Risk Disclaimer)' : 'Financial Risk Disclaimer'}
                </a>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('CONTACT');
                  }}
                  className="min-h-[28px] py-1 inline-flex items-center hover:text-cyan-300 transition-colors"
                >
                  {language === 'bn' ? 'যোগাযোগ করুন (Contact Us)' : 'Contact Us'}
                </a>
              </div>
            </div>
          </div>

          {/* External Financial Literacy Resources & Social Sharing Row */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-semibold text-slate-200">
                {language === 'bn' ? 'আন্তর্জাতিক শিক্ষা রেফারেন্স:' : 'Market Education References:'}
              </span>
              <a
                href="https://www.investopedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                Investopedia
              </a>
              <a
                href="https://www.babypips.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                BabyPips Forex
              </a>
              <a
                href="https://www.tradingview.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                TradingView Charts
              </a>
              <a
                href="https://www.bis.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                BIS Central Bank Data
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-semibold text-slate-200">
                {language === 'bn' ? 'শেয়ার করুন:' : 'Share Tradebd:'}
              </span>
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Ftradebd.online%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://twitter.com/intent/tweet?url=https%3A%2F%2Ftradebd.online%2F&text=Tradebd%20%E2%80%93%20Trading%20Academy%20%26%20Technical%20Analysis%20Platform"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                X (Twitter)
              </a>
              <a
                href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Ftradebd.online%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://t.me/share/url?url=https%3A%2F%2Ftradebd.online%2F&text=Tradebd%20Trading%20Academy"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[28px] py-1 px-1 inline-flex items-center hover:text-cyan-300 transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>

          {/* YMYL Financial Educational Disclaimer & Copyright */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-300 leading-relaxed">
            <p>
              <strong className="text-slate-100">
                {language === 'bn' ? 'আর্থিক ঝুঁকি ডিসক্লেইমার: ' : 'Educational & Risk Disclaimer: '}
              </strong>
              {language === 'bn'
                ? 'Tradebd (tradebd.online) শুধুমাত্র একটি শিক্ষামূলক প্ল্যাটফর্ম এবং ভার্চুয়াল ট্রেডিং সিমুলেটর। এখানে প্রদত্ত যেকোনো কাস্টম ডেমো ব্যালেন্স সম্পূর্ণ কাল্পনিক এবং এই ওয়েবসাইটের কোনো তথ্য বা বিশ্লেষণ সরাসরি বিনিয়োগ পরামর্শ (Financial Advice) নয়। ফরেক্স ও ক্রিপ্টোকারেন্সি মার্কেটে বাস্তব অর্থ বিনিয়োগের পূর্বে নিজ দায়িত্বে ঝুঁকি যাচাই করুন।'
                : 'Tradebd (tradebd.online) is strictly an educational trading academy, technical analysis platform, and virtual paper-trading simulator. All customizable demo balances are virtual with no monetary value. Content provided on this site does not constitute financial or investment advice.'}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-slate-300">
              <span>
                © {new Date().getFullYear()} Tradebd (tradebd.online). All rights reserved.
              </span>
              <span>
                {language === 'bn'
                  ? '১০০% বিনামূল্যে ফিন্যান্সিয়াল এডুকেশন ও পেপার ট্রেডিং প্ল্যাটফর্ম'
                  : '100% Free Financial Education & Virtual Paper Trading Platform'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Semantic <a> links for Googlebot & Mobile UX) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-1 shrink-0 z-40 overflow-x-auto"
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('CHART');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'CHART' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('navChartShort')}</span>
        </a>

        <a
          href="/simulator"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('SIMULATOR');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 relative shrink-0 ${
            activeTab === 'SIMULATOR' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t('navSimulatorShort')}</span>
          {positions.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          )}
        </a>

        <a
          href="/calendar"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('CALENDAR');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'CALENDAR' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}</span>
        </a>

        <a
          href="/academy"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('ACADEMY');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'ACADEMY' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('navAcademyShort')}</span>
        </a>

        <a
          href="/blog"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('BLOG');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'BLOG' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>{language === 'bn' ? 'ব্লগ' : 'Blog'}</span>
        </a>

        <a
          href="/patterns"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('PATTERNS');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'PATTERNS' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('navPatternsShort')}</span>
        </a>

        <a
          href="/calculator"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('CALCULATOR');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'CALCULATOR' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('navCalculatorShort')}</span>
        </a>

        <a
          href="/mentor"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('MENTOR');
          }}
          className={`min-h-[44px] min-w-[42px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium p-1.5 shrink-0 ${
            activeTab === 'MENTOR' ? 'text-cyan-300 font-bold' : 'text-slate-300'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>{t('navMentorShort')}</span>
        </a>
      </nav>
    </div>
  );
}
