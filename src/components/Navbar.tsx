import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import {
  TrendingUp,
  RotateCcw,
  Check,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Calendar,
  BookOpen,
  Layers,
  Calculator,
  BrainCircuit,
  Info,
  Lock,
  FileText,
  AlertTriangle,
  Mail,
  ChevronRight,
  PenTool,
} from 'lucide-react';

export type NavTab =
  | 'CHART'
  | 'SIMULATOR'
  | 'CALENDAR'
  | 'ACADEMY'
  | 'BLOG'
  | 'PATTERNS'
  | 'CALCULATOR'
  | 'MENTOR'
  | 'LEGAL';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLegalSection?: (section: 'ABOUT' | 'PRIVACY' | 'TERMS' | 'DISCLAIMER' | 'CONTACT') => void;
  balance: number;
  openPositionsCount: number;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenLegalSection,
  balance,
  openPositionsCount,
  onResetDemo,
}) => {
  const { language, setLanguage, t, currentLangOption } = useLanguage();
  const isBn = language === 'bn';
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sliding drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems: {
    id: NavTab;
    label: string;
    subtitle: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'CHART',
      label: t('navChart'),
      subtitle: isBn ? 'ক্যান্ডেলস্টিক, ইন্ডিকেটর ও সাপোর্ট/রেজিস্ট্যান্স' : 'Interactive Candlestick & Indicators',
      icon: BarChart3,
    },
    {
      id: 'SIMULATOR',
      label: t('navSimulator'),
      subtitle: isBn
        ? 'ইচ্ছামতো কাস্টম ডেমো ফান্ড নিয়ে রিয়েল-টাইম প্র্যাকটিস'
        : 'Risk-free customizable virtual paper trading',
      icon: TrendingUp,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'CALENDAR',
      label: isBn ? 'ক্যালেন্ডার, সেশন ও নিউজ' : 'Calendar, Sessions & News',
      subtitle: isBn ? 'বাংলাদেশ সময় (BST) সেশন, অর্থনৈতিক ক্যালেন্ডার ও নিউজ' : 'BST Forex Sessions, Economic Calendar & News',
      icon: Calendar,
      badge: 'LIVE',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'ACADEMY',
      label: t('navAcademy'),
      subtitle: isBn ? 'বেসিক থেকে অ্যাডভান্সড ট্রেডিং কোর্স ও কুইজ' : 'Structured trading modules & interactive quiz',
      icon: BookOpen,
    },
    {
      id: 'BLOG',
      label: isBn ? 'শিক্ষণীয় ব্লগ ও আর্টিকেল' : 'Educational Blog & Articles',
      subtitle: isBn
        ? 'ফরেক্স, ক্রিপ্টো ও চার্ট অ্যানালাইসিস নিয়ে বিস্তারিত ব্লগ'
        : 'In-depth Forex, Crypto & Chart Analysis guides',
      icon: PenTool,
      badge: 'SEO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'PATTERNS',
      label: t('navPatterns'),
      subtitle: isBn ? 'বুলিশ ও বিয়ারিশ ক্যান্ডেলস্টিক প্যাটার্ন গাইড' : 'Bullish & Bearish candlestick cheatsheet',
      icon: Layers,
    },
    {
      id: 'CALCULATOR',
      label: t('navCalculator'),
      subtitle: isBn ? '১%-২% রিস্ক ও লট সাইজ ক্যালকুলেটর' : 'Position size & 1%-2% risk calculator',
      icon: Calculator,
    },
    {
      id: 'MENTOR',
      label: t('navMentor'),
      subtitle: isBn ? 'ট্রেড সেটআপ ও রিস্ক-রিওয়ার্ড মূল্যায়ন' : 'Trade setup & risk-reward analyzer',
      icon: BrainCircuit,
    },
  ];

  const activeNavObj = navItems.find((item) => item.id === activeTab);
  const activeTitle = activeNavObj
    ? activeNavObj.label
    : isBn
      ? 'আইনি ও নীতিমালা'
      : 'Legal & Info';

  const handleSelectFromDrawer = (
    tab: NavTab,
    legalSection?: 'ABOUT' | 'PRIVACY' | 'TERMS' | 'DISCLAIMER' | 'CONTACT'
  ) => {
    if (tab === 'LEGAL' && legalSection && onOpenLegalSection) {
      onOpenLegalSection(legalSection);
    } else {
      onSelectTab(tab);
      if (legalSection) {
        window.location.hash = legalSection.toLowerCase();
      }
    }
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-[#0b0f19] border-b border-slate-800 shrink-0 select-none sticky top-0 z-30">
        {/* Zone 1: Left Sliding Menu Toggle Button + Brand Wordmark + Active Page Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/90 hover:border-cyan-500/50 rounded-lg text-slate-100 transition-all cursor-pointer shadow-xs"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold tracking-wide">
              {isBn ? 'মেনু' : 'Menu'}
            </span>
          </button>

          <a
            href="#chart"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('CHART');
            }}
            className="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 group"
          >
            <span className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center text-slate-950 font-black text-xs shadow-xs group-hover:bg-emerald-400 transition-colors">
              TB
            </span>
            <span className="tracking-tight text-slate-100">{t('appName')}</span>
          </a>

          {/* Current Active Section Indicator on Desktop */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <span className="text-cyan-400 font-semibold">{activeTitle}</span>
          </div>
        </div>

        {/* Zone 2: Portfolio Demo Balance, Language Selector & CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              title="Change Language"
            >
              <span>{currentLangOption.flag}</span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {currentLangOption.code}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800 mb-1">
                  {t('selectLanguage')}
                </div>
                <div className="space-y-0.5">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isActive = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-800/40'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Demo Fund Display (Click to customize/edit Demo Fund amount) */}
          <button
            onClick={onResetDemo}
            title={isBn ? 'ডেমো ফান্ড ইচ্ছামতো পরিবর্তন বা রিসেট করুন' : 'Click to set custom Demo Fund or reset'}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs font-mono transition-colors cursor-pointer group"
          >
            <span className="hidden sm:inline text-slate-400">{t('demoFund')}:</span>
            <span className="font-bold text-emerald-400 tabular-numbers">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              {isBn ? 'ফান্ড সেট' : 'Edit'}
            </span>
          </button>

          {/* Quick Blog & Article Writer Button */}
          <button
            onClick={() => onSelectTab('BLOG')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              activeTab === 'BLOG'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/40'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isBn ? 'ব্লগ ও আর্টিকেল' : 'Blog'}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => onSelectTab('SIMULATOR')}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            {t('practiceTrading')}
          </button>
        </div>
      </header>

      {/* =====================================================================
          LEFT SLIDING NAVIGATION WINDOW (বাম পাশের স্লাইডিং মেনু উইন্ডো)
      ===================================================================== */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main Navigation Sliding Drawer"
        className={`fixed top-0 left-0 bottom-0 w-76 sm:w-84 bg-[#0b0f19] border-r border-slate-800 shadow-2xl z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out select-none ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand & Close Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-sm shadow-xs">
              TB
            </span>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight">
                {t('appName')}
              </div>
              <div className="text-[11px] text-slate-400">
                {isBn ? 'ট্রেডিং একাডেমি ও অ্যানালাইসিস' : 'Trading Academy & Analytics'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Menu"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Primary Platform Navigation */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isBn ? 'ট্রেডিং ও অ্যানালাইসিস টুলস' : 'Trading & Analysis Tools'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectFromDrawer(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded border ${
                              item.badgeColor || ''
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Legal & Information Links */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isBn ? 'আইনি ও তথ্য পাতা (Legal & Info)' : 'Legal & Information'}
            </div>

            {(
              [
                {
                  section: 'ABOUT',
                  labelBn: 'আমাদের সম্পর্কে (About Us)',
                  labelEn: 'About Us',
                  icon: Info,
                },
                {
                  section: 'PRIVACY',
                  labelBn: 'গোপনীয়তা নীতি (Privacy Policy)',
                  labelEn: 'Privacy Policy',
                  icon: Lock,
                },
                {
                  section: 'TERMS',
                  labelBn: 'ব্যবহারের শর্তাবলী (Terms of Use)',
                  labelEn: 'Terms & Conditions',
                  icon: FileText,
                },
                {
                  section: 'DISCLAIMER',
                  labelBn: 'ঝুঁকি সতর্কবার্তা (Risk Disclaimer)',
                  labelEn: 'Risk Disclaimer',
                  icon: AlertTriangle,
                },
                {
                  section: 'CONTACT',
                  labelBn: 'যোগাযোগ করুন (Contact Us)',
                  labelEn: 'Contact Us',
                  icon: Mail,
                },
              ] as const
            ).map((legal) => {
              const Icon = legal.icon;
              return (
                <button
                  key={legal.section}
                  onClick={() => handleSelectFromDrawer('LEGAL', legal.section)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isBn ? legal.labelBn : legal.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Drawer Virtual Balance Card */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('demoFund')}:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onResetDemo();
                setDrawerOpen(false);
              }}
              className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isBn ? 'ফান্ড পরিবর্তন' : 'Set / Reset Fund'}</span>
            </button>
            <button
              onClick={() => handleSelectFromDrawer('SIMULATOR')}
              className="py-1.5 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              {t('practiceTrading')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
