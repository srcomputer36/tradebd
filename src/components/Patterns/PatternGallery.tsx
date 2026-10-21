import React, { useState, useMemo } from 'react';
import { PATTERNS_LIST } from '../../data/patternsData';
import { PatternItem } from '../../types/trading';
import { PatternSvg } from './PatternSvg';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  Search,
  CheckCircle2,
  Shield,
  Target,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface PatternGalleryProps {
  onSelectPatternForChart?: (pattern: PatternItem) => void;
}

export const PatternGallery: React.FC<PatternGalleryProps> = ({ onSelectPatternForChart }) => {
  const { t, language } = useLanguage();
  const [filterType, setFilterType] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'CHART'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<PatternItem | null>(null);

  const isBn = language === 'bn';

  const filteredPatterns = useMemo(() => {
    return PATTERNS_LIST.filter((p) => {
      // Type filter
      if (filterType === 'BULLISH' && p.type !== 'BULLISH') return false;
      if (filterType === 'BEARISH' && p.type !== 'BEARISH') return false;
      if (filterType === 'CHART' && p.category !== 'CHART_PATTERN') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.nameBn.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.descriptionBn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filterType, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-lg overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#0f172a] border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{t('patternsTitle')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('patternsSubtitle')}
          </p>
        </div>

        {/* Filter segment */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={t('searchPatterns')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 w-44"
            />
          </div>

          {/* Type filter tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('all')} ({PATTERNS_LIST.length})
            </button>
            <button
              onClick={() => setFilterType('BULLISH')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'BULLISH'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('bullish')}
            </button>
            <button
              onClick={() => setFilterType('BEARISH')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'BEARISH'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('bearish')}
            </button>
            <button
              onClick={() => setFilterType('CHART')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'CHART'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('chartPatterns')}
            </button>
          </div>
        </div>
      </div>

      {/* Pattern Cards Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatterns.map((pattern) => {
            const isBullish = pattern.type === 'BULLISH';
            const isBearish = pattern.type === 'BEARISH';
            const displayName = isBn ? pattern.nameBn : pattern.name;
            const subName = isBn ? pattern.name : pattern.nameBn;
            const description = isBn ? pattern.descriptionBn : pattern.description;
            const entryRule = isBn ? pattern.entryRuleBn : pattern.entryRule;
            const stopLossRule = isBn ? pattern.stopLossRuleBn : pattern.stopLossRule;

            return (
              <div
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-950/50 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                        {displayName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{subName}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isBullish
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isBearish
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {pattern.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t('winRateEst')} ~{pattern.winRateEst}
                      </span>
                    </div>
                  </div>

                  {/* SVG Schematic Diagram */}
                  <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-2 mb-3 flex items-center justify-center">
                    <PatternSvg type={pattern.svgType} className="w-full h-28" />
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>

                {/* Rules Summary */}
                <div className="pt-3 mt-3 border-t border-slate-800/70 space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="truncate">
                      <strong>{t('entryRule')}:</strong> {entryRule}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-rose-300">
                    <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="truncate">
                      <strong>{t('stopLossRule')}:</strong> {stopLossRule}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPatterns.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-xs">
            {t('noPatternsFound')}
          </div>
        )}
      </div>

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {isBn ? selectedPattern.nameBn : selectedPattern.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      selectedPattern.type === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedPattern.type === 'BEARISH'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {selectedPattern.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn ? selectedPattern.name : selectedPattern.nameBn}
                </p>
              </div>

              <button
                onClick={() => setSelectedPattern(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Illustration */}
            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 flex items-center justify-center">
              <PatternSvg type={selectedPattern.svgType} className="w-full h-36" />
            </div>

            {/* Psychology & Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>{t('marketPsychology')}</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {isBn ? selectedPattern.descriptionBn : selectedPattern.description}
              </p>
            </div>

            {/* Deep-Dive Trade Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
                <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('entryRule')}</span>
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isBn ? selectedPattern.entryRuleBn : selectedPattern.entryRule}
                </p>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                <span className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t('stopLossRule')}</span>
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isBn ? selectedPattern.stopLossRuleBn : selectedPattern.stopLossRule}
                </p>
              </div>

              <div className="p-3 bg-cyan-950/30 border border-cyan-900/50 rounded-lg">
                <span className="font-bold text-cyan-400 flex items-center gap-1 mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>{t('targetRule')}</span>
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isBn ? selectedPattern.targetRuleBn : selectedPattern.targetRule}
                </p>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {onSelectPatternForChart && (
                <button
                  onClick={() => {
                    const pat = selectedPattern;
                    setSelectedPattern(null);
                    onSelectPatternForChart(pat);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isBn ? 'লাইভ চার্টে অনুশীলন করুন →' : 'Practice on Live Chart →'}
                </button>
              )}
              <button
                onClick={() => setSelectedPattern(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                {t('closeModal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
