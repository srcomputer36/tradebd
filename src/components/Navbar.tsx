import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import {
  TrendingUp,
  RotateCcw,
  Globe,
  Check,
  ChevronDown,
} from 'lucide-react';

export type NavTab = 'CHART' | 'SIMULATOR' | 'ACADEMY' | 'PATTERNS' | 'CALCULATOR' | 'MENTOR';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  balance: number;
  openPositionsCount: number;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  balance,
  openPositionsCount,
  onResetDemo,
}) => {
  const { language, setLanguage, t, currentLangOption } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-[#0b0f19] border-b border-slate-800 shrink-0 select-none">
      {/* Zone 1: Brand Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('CHART');
        }}
        className="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 group"
      >
        <span className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center text-slate-950 font-black text-xs shadow-xs group-hover:bg-emerald-400 transition-colors">
          TB
        </span>
        <span className="tracking-tight text-slate-100">
          {t('appName')}
        </span>
      </a>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onSelectTab('CHART')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'CHART'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : ''
          }`}
        >
          {t('navChart')}
        </button>

        <button
          onClick={() => onSelectTab('SIMULATOR')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 ${
            activeTab === 'SIMULATOR'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : ''
          }`}
        >
          <span>{t('navSimulator')}</span>
          {openPositionsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono font-bold">
              {openPositionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('ACADEMY')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'ACADEMY'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : ''
          }`}
        >
          {t('navAcademy')}
        </button>

        <button
          onClick={() => onSelectTab('PATTERNS')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'PATTERNS'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : ''
          }`}
        >
          {t('navPatterns')}
        </button>

        <button
          onClick={() => onSelectTab('CALCULATOR')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'CALCULATOR'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : ''
          }`}
        >
          {t('navCalculator')}
        </button>

        <button
          onClick={() => onSelectTab('MENTOR')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'MENTOR'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : ''
          }`}
        >
          {t('navMentor')}
        </button>
      </nav>

      {/* Zone 3: Portfolio Demo Balance, Language Selector & CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 transition-colors"
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
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
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

        {/* Demo Fund Display */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          <span className="text-slate-400">{t('demoFund')}:</span>
          <span className="font-bold text-emerald-400 tabular-numbers">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button
            onClick={onResetDemo}
            title={t('resetDemo')}
            className="text-slate-400 hover:text-slate-200 transition-colors ml-1 p-0.5 rounded"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => onSelectTab('SIMULATOR')}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
        >
          {t('practiceTrading')}
        </button>
      </div>
    </header>
  );
};
