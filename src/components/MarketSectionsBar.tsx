import React, { useState } from 'react';
import { CRYPTO_ASSETS, FOREX_ASSETS } from '../data/assets';
import { Asset } from '../types/trading';
import { useLanguage } from '../context/LanguageContext';
import { Coins, Globe2, Layers, CheckCircle2 } from 'lucide-react';

interface MarketSectionsBarProps {
  selectedAsset: Asset;
  currentPrice: number;
  assetPrices?: Record<string, number>;
  onSelectAsset: (asset: Asset) => void;
}

export const MarketSectionsBar: React.FC<MarketSectionsBarProps> = ({
  selectedAsset,
  currentPrice,
  assetPrices,
  onSelectAsset,
}) => {
  const { language } = useLanguage();
  const [sectionView, setSectionView] = useState<'BOTH' | 'CRYPTO' | 'FOREX'>('BOTH');

  const getAssetName = (asset: Asset) => {
    return (
      asset.localizedNames?.[language] ||
      (language === 'bn' ? asset.nameBn : asset.name)
    );
  };

  // Localized labels for the dual market sections
  const labels = {
    marketSectionsHeader:
      language === 'bn'
        ? 'মার্কেট ক্যাটাগরি (আলাদা ক্রিপ্টো ও ফরেক্স সেকশন)'
        : language === 'es'
        ? 'Categorías de Mercado (Secciones Separadas Crypto y Forex)'
        : language === 'hi'
        ? 'मार्केट सेक्शन (अलग क्रिप्टो और फॉरेक्स सेक्शन)'
        : language === 'ar'
        ? 'أقسام السوق (قسم العملات الرقمية وقسم الفوركس)'
        : 'Market Categories (Separate Crypto & Forex Sections)',
    showBoth:
      language === 'bn'
        ? 'উভয় সেকশন (FOREX + CRYPTO)'
        : language === 'es'
        ? 'Ambos (FOREX + CRYPTO)'
        : language === 'hi'
        ? 'दोनों सेक्शन (FOREX + CRYPTO)'
        : language === 'ar'
        ? 'كلا القسمين (FOREX + CRYPTO)'
        : 'Both Sections (FOREX + CRYPTO)',
    cryptoTab:
      language === 'bn'
        ? '🪙 ক্রিপ্টো সেকশন (CRYPTO)'
        : '🪙 CRYPTO Section',
    forexTab:
      language === 'bn'
        ? '💱 ফরেক্স সেকশন (FOREX)'
        : '💱 FOREX Section',
    cryptoTitle:
      language === 'bn'
        ? 'CRYPTO মার্কেট সেকশন (ক্রিপ্টোকারেন্সি)'
        : language === 'es'
        ? 'SECCIÓN CRYPTO (Criptomonedas)'
        : language === 'hi'
        ? 'CRYPTO मार्केट सेक्शन (क्रिप्टोकरेंसी)'
        : language === 'ar'
        ? 'قسم العملات الرقمية (CRYPTO)'
        : 'CRYPTO MARKET SECTION',
    cryptoSub:
      language === 'bn'
        ? '২৪/৭ ডিজিটাল কয়েন ও USDT পেয়ার (Max 20x)'
        : '24/7 Digital Coins & USDT Pairs (Max 20x)',
    forexTitle:
      language === 'bn'
        ? 'FOREX মার্কেট সেকশন (ফরেক্স ও গোল্ড)'
        : language === 'es'
        ? 'SECCIÓN FOREX (Divisas y Oro)'
        : language === 'hi'
        ? 'FOREX मार्केट सेक्शन (फॉरेक्स और गोल्ड)'
        : language === 'ar'
        ? 'قسم الفوركس والذهب (FOREX)'
        : 'FOREX MARKET SECTION',
    forexSub:
      language === 'bn'
        ? 'আন্তর্জাতিক কারেন্সি পেয়ার ও স্পট গোল্ড (Max 30x)'
        : 'Global Currency Pairs & Spot Gold (Max 30x)',
    activeLabel:
      language === 'bn' ? 'সক্রিয় পেয়ার:' : 'Active Pair:',
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-sm">
      {/* Top Filter & Active Market Indicator Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 tracking-wide">
            {labels.marketSectionsHeader}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
              selectedAsset.category === 'crypto'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {selectedAsset.category === 'crypto' ? 'CRYPTO' : 'FOREX'} • {selectedAsset.symbol}
          </span>
        </div>

        {/* Section Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setSectionView('BOTH')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              sectionView === 'BOTH'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {labels.showBoth}
          </button>
          <button
            onClick={() => setSectionView('CRYPTO')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              sectionView === 'CRYPTO'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            {labels.cryptoTab}
          </button>
          <button
            onClick={() => setSectionView('FOREX')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              sectionView === 'FOREX'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            {labels.forexTab}
          </button>
        </div>
      </div>

      {/* Separate Sections Container */}
      <div
        className={`grid gap-3.5 ${
          sectionView === 'BOTH' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* SECTION 1: CRYPTO MARKET SECTION */}
        {(sectionView === 'BOTH' || sectionView === 'CRYPTO') && (
          <div
            className={`rounded-xl border p-3 transition-all ${
              selectedAsset.category === 'crypto'
                ? 'bg-amber-950/10 border-amber-500/40'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            {/* Crypto Section Header */}
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-extrabold text-amber-300 tracking-wide uppercase">
                      {labels.cryptoTitle}
                    </h2>
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold rounded">
                      {CRYPTO_ASSETS.length} PAIRS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{labels.cryptoSub}</p>
                </div>
              </div>
              {selectedAsset.category === 'crypto' && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  ACTIVE
                </span>
              )}
            </div>

            {/* Crypto Pairs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CRYPTO_ASSETS.map((asset) => {
                const isSelected = asset.id === selectedAsset.id;
                const displayPrice = isSelected
                  ? currentPrice
                  : assetPrices?.[asset.id] ?? asset.basePrice;
                return (
                  <button
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                        : 'bg-slate-900/90 border-slate-800/90 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="font-mono font-bold text-xs text-white">
                        {asset.symbol}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        CRYPTO
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-1 w-full">
                      <span className="text-[10px] text-slate-400 truncate">
                        {getAssetName(asset)}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isSelected ? 'text-amber-300' : 'text-slate-300'
                        }`}
                      >
                        ${displayPrice.toFixed(asset.precision)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: FOREX MARKET SECTION */}
        {(sectionView === 'BOTH' || sectionView === 'FOREX') && (
          <div
            className={`rounded-xl border p-3 transition-all ${
              selectedAsset.category === 'forex'
                ? 'bg-cyan-950/15 border-cyan-500/40'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            {/* Forex Section Header */}
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-extrabold text-cyan-300 tracking-wide uppercase">
                      {labels.forexTitle}
                    </h2>
                    <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold rounded">
                      {FOREX_ASSETS.length} PAIRS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{labels.forexSub}</p>
                </div>
              </div>
              {selectedAsset.category === 'forex' && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  ACTIVE
                </span>
              )}
            </div>

            {/* Forex Pairs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FOREX_ASSETS.map((asset) => {
                const isSelected = asset.id === selectedAsset.id;
                const displayPrice = isSelected
                  ? currentPrice
                  : assetPrices?.[asset.id] ?? asset.basePrice;
                return (
                  <button
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-900/90 border-slate-800/90 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="font-mono font-bold text-xs text-white">
                        {asset.symbol}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        FOREX
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-1 w-full">
                      <span className="text-[10px] text-slate-400 truncate">
                        {getAssetName(asset)}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isSelected ? 'text-cyan-300' : 'text-slate-300'
                        }`}
                      >
                        ${displayPrice.toFixed(asset.precision)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
