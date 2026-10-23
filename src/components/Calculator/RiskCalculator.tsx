import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CRYPTO_ASSETS, FOREX_ASSETS } from '../../data/assets';
import { Asset } from '../../types/trading';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Coins,
  Globe2,
} from 'lucide-react';

interface RiskCalculatorProps {
  currentBalance?: number;
  initialEntryPrice?: number;
  selectedAsset?: Asset;
  assetPrices?: Record<string, number>;
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  currentBalance = 25000,
  initialEntryPrice = 67450,
  selectedAsset,
  assetPrices,
}) => {
  const { t, language } = useLanguage();
  const initialPair = selectedAsset || CRYPTO_ASSETS[0];
  const initialSec = initialPair.category === 'forex' ? 'FOREX' : 'CRYPTO';
  const startEntry = Number(
    (initialEntryPrice || initialPair.basePrice).toFixed(initialPair.precision)
  );
  const startDist = initialPair.category === 'forex' ? 0.005 : 0.015;

  const [marketSection, setMarketSection] = useState<'CRYPTO' | 'FOREX'>(initialSec);
  const [selectedPair, setSelectedPair] = useState<Asset>(initialPair);
  const [balance, setBalance] = useState<number>(Number(currentBalance.toFixed(2)));
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(startEntry);
  const [stopLoss, setStopLoss] = useState<number>(
    Number((startEntry * (1 - startDist)).toFixed(initialPair.precision))
  );

  // Keep balance in sync if demo account balance changes
  useEffect(() => {
    setBalance(Number(currentBalance.toFixed(2)));
  }, [currentBalance]);

  // Keep selectedPair in sync if selectedAsset prop changes
  useEffect(() => {
    if (!selectedAsset) return;
    setMarketSection(selectedAsset.category === 'forex' ? 'FOREX' : 'CRYPTO');
    setSelectedPair(selectedAsset);
    const liveP = assetPrices?.[selectedAsset.id] ?? initialEntryPrice ?? selectedAsset.basePrice;
    const formattedEntry = Number(liveP.toFixed(selectedAsset.precision));
    setEntryPrice(formattedEntry);
    const dist = selectedAsset.category === 'forex' ? 0.005 : 0.015;
    setStopLoss(
      Number(
        (side === 'LONG' ? formattedEntry * (1 - dist) : formattedEntry * (1 + dist)).toFixed(
          selectedAsset.precision
        )
      )
    );
  }, [selectedAsset?.id]);

  const precision = selectedPair.precision;

  const handleSelectMarketSection = (sec: 'CRYPTO' | 'FOREX') => {
    setMarketSection(sec);
    const defaultAsset = sec === 'CRYPTO' ? CRYPTO_ASSETS[0] : FOREX_ASSETS[0];
    handleSelectPair(defaultAsset);
  };

  const handleSelectPair = (asset: Asset) => {
    setSelectedPair(asset);
    const liveP = Number((assetPrices?.[asset.id] ?? asset.basePrice).toFixed(asset.precision));
    setEntryPrice(liveP);
    const dist = asset.category === 'forex' ? 0.005 : 0.015;
    if (side === 'LONG') {
      setStopLoss(Number((liveP * (1 - dist)).toFixed(asset.precision)));
    } else {
      setStopLoss(Number((liveP * (1 + dist)).toFixed(asset.precision)));
    }
  };

  // When side changes, adjust default stop loss
  const handleSideChange = (newSide: 'LONG' | 'SHORT') => {
    setSide(newSide);
    const dist = marketSection === 'FOREX' ? 0.005 : 0.015;
    if (newSide === 'LONG') {
      setStopLoss(Number((entryPrice * (1 - dist)).toFixed(precision)));
    } else {
      setStopLoss(Number((entryPrice * (1 + dist)).toFixed(precision)));
    }
  };

  // Math Calculations
  const {
    riskAmount,
    perUnitRisk,
    perUnitRiskPct,
    positionUnits,
    standardLots,
    totalPositionValue,
    leverageNeeded,
    isSlValid,
    tp15,
    tp20,
    tp30,
  } = useMemo(() => {
    const risk = balance * (riskPercent / 100);

    let unitRisk = 0;
    let valid = true;

    if (side === 'LONG') {
      if (stopLoss >= entryPrice) valid = false;
      else unitRisk = entryPrice - stopLoss;
    } else {
      if (stopLoss <= entryPrice) valid = false;
      else unitRisk = stopLoss - entryPrice;
    }

    const unitRiskPct = entryPrice > 0 ? (unitRisk / entryPrice) * 100 : 0;
    const isUsdBase = selectedPair.symbol.startsWith('USD/');
    const isGold = selectedPair.id === 'xau-usd';
    const perUnitRiskUsd = isUsdBase && entryPrice > 0 ? unitRisk / entryPrice : unitRisk;
    const units = valid && perUnitRiskUsd > 0 ? risk / perUnitRiskUsd : 0;
    const lotSizeContract = isGold ? 100 : 100000;
    const lots = units / lotSizeContract;
    const positionValue = isUsdBase ? units : units * entryPrice;
    const levNeeded = balance > 0 ? Math.max(1, positionValue / balance) : 1;

    let t15 = 0;
    let t20 = 0;
    let t30 = 0;

    if (valid && unitRisk > 0) {
      if (side === 'LONG') {
        t15 = entryPrice + unitRisk * 1.5;
        t20 = entryPrice + unitRisk * 2.0;
        t30 = entryPrice + unitRisk * 3.0;
      } else {
        t15 = entryPrice - unitRisk * 1.5;
        t20 = entryPrice - unitRisk * 2.0;
        t30 = entryPrice - unitRisk * 3.0;
      }
    }

    return {
      riskAmount: risk,
      perUnitRisk: unitRisk,
      perUnitRiskPct: unitRiskPct,
      positionUnits: units,
      standardLots: lots,
      totalPositionValue: positionValue,
      leverageNeeded: levNeeded,
      isSlValid: valid,
      tp15: t15,
      tp20: t20,
      tp30: t30,
    };
  }, [balance, riskPercent, side, entryPrice, stopLoss, selectedPair.symbol, selectedPair.id]);

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-[#0f172a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>{t('calculatorTitle')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('calculatorSubtitle')}</p>
        </div>

        {/* Dedicated Separate Section Switcher: CRYPTO vs FOREX */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectMarketSection('CRYPTO')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              marketSection === 'CRYPTO'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ক্রিপ্টো সেকশন (CRYPTO)' : 'CRYPTO SECTION'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectMarketSection('FOREX')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              marketSection === 'FOREX'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ফরেক্স সেকশন (FOREX)' : 'FOREX SECTION'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Separate Section Pair Selector Strip */}
        <div className="max-w-5xl mx-auto">
          {marketSection === 'CRYPTO' ? (
            <div className="p-3.5 rounded-xl bg-amber-950/10 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  {language === 'bn'
                    ? 'ক্রিপ্টো সেকশন পেয়ার নির্বাচন করুন (CRYPTO PAIRS)'
                    : 'Select Crypto Section Pair (Coin / USDT Sizing)'}
                </span>
                <span className="text-[11px] font-mono text-amber-400">
                  Active: {selectedPair.symbol}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {CRYPTO_ASSETS.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleSelectPair(asset)}
                    className={`p-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedPair.id === asset.id
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{asset.symbol}</div>
                    <div className="text-[10px] text-amber-300 font-normal">
                      ${(assetPrices?.[asset.id] ?? asset.basePrice).toFixed(asset.precision)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-cyan-950/10 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4" />
                  {language === 'bn'
                    ? 'ফরেক্স সেকশন পেয়ার নির্বাচন করুন (FOREX PAIRS)'
                    : 'Select Forex Section Pair (Lot & Pip Sizing)'}
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Active: {selectedPair.symbol}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {FOREX_ASSETS.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleSelectPair(asset)}
                    className={`p-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedPair.id === asset.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{asset.symbol}</div>
                    <div className="text-[10px] text-cyan-300 font-normal">
                      ${(assetPrices?.[asset.id] ?? asset.basePrice).toFixed(asset.precision)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
          {/* Inputs Column (Left) */}
          <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>{t('tradeParams')}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  marketSection === 'CRYPTO'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                {marketSection} • {selectedPair.symbol}
              </span>
            </h3>

            {/* Trade Direction */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">{t('tradeDirection')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSideChange('LONG')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    side === 'LONG'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => handleSideChange('SHORT')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    side === 'SHORT'
                      ? 'bg-rose-600 border-rose-500 text-white shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>

            {/* Account Balance */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>{t('accountBalance')}</span>
                <span className="font-mono text-cyan-400 font-bold">
                  ${balance.toLocaleString()}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Risk Percentage */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{t('riskPercentage')}</span>
                <span className="font-mono text-rose-400 font-bold">
                  {riskPercent}% (–${riskAmount.toFixed(2)})
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1, 1.5, 2].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskPercent(r)}
                    className={`py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      riskPercent === r
                        ? 'bg-rose-600 border-rose-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">{t('riskRec')}</p>
            </div>

            {/* Entry Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t('orderExecutionPrice')} ({selectedPair.symbol})
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Stop Loss Price */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-rose-300">{t('stopLossPrice')}</label>
                {isSlValid && perUnitRisk > 0 && (
                  <span className="font-mono text-[11px] text-rose-400">
                    {t('slDistance')}: {perUnitRiskPct.toFixed(2)}%
                  </span>
                )}
              </div>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white font-mono text-xs focus:outline-hidden ${
                  !isSlValid ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'
                }`}
              />
              {!isSlValid && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{side === 'LONG' ? t('invalidSlLong') : t('invalidSlShort')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Results Column (Right) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main Math Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {t('calculatedResults')} ({marketSection})
                </span>
              </h3>

              {isSlValid ? (
                <>
                  {/* Hero Metric: Position Size */}
                  <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        {t('recQuantity')} ({selectedPair.symbol})
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {positionUnits.toFixed(
                          marketSection === 'CRYPTO'
                            ? 4
                            : selectedPair.id === 'xau-usd'
                            ? 2
                            : 0
                        )}{' '}
                        <span className="text-xs text-slate-300 font-sans font-normal">
                          {marketSection === 'CRYPTO'
                            ? 'Coins / Tokens'
                            : selectedPair.id === 'xau-usd'
                            ? 'Oz (Troy Ounces)'
                            : 'Forex Units'}
                        </span>
                      </div>
                      {marketSection === 'FOREX' && (
                        <div className="text-xs font-mono text-cyan-300 mt-1">
                          ≈ {standardLots.toFixed(2)} Standard Lots (
                          {selectedPair.id === 'xau-usd' ? '1 Lot = 100 Oz' : '1 Lot = 100k'})
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block">{t('positionSizeVal')}</span>
                      <span className="text-base font-bold font-mono text-white">
                        $
                        {totalPositionValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Supporting Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">
                        {t('estLeverageNeeded')}
                      </span>
                      <span className="text-sm font-bold font-mono text-cyan-400">
                        {leverageNeeded.toFixed(1)}x
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">{t('maxLoss')}</span>
                      <span className="text-sm font-bold font-mono text-rose-400">
                        -${riskAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{t('exactRisk')}</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[11px]">{t('perUnitRisk')}</span>
                      <span className="text-sm font-bold font-mono text-white">
                        ${perUnitRisk.toFixed(precision)}
                      </span>
                    </div>
                  </div>

                  {/* Target TP Scenarios based on R:R */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-300 block">
                      {t('rrTargets')}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex flex-col justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {t('tp15Target')}
                        </span>
                        <span className="font-bold font-mono text-emerald-400 mt-1">
                          ${tp15.toFixed(precision)}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-mono">
                          +$({(riskAmount * 1.5).toFixed(2)})
                        </span>
                      </div>

                      <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-800/60 flex flex-col justify-between">
                        <span className="text-emerald-300 font-mono text-[11px] font-bold">
                          {t('tp20Target')}
                        </span>
                        <span className="font-bold font-mono text-emerald-400 mt-1 text-sm">
                          ${tp20.toFixed(precision)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          +$({(riskAmount * 2.0).toFixed(2)})
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex flex-col justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {t('tp30Target')}
                        </span>
                        <span className="font-bold font-mono text-emerald-400 mt-1">
                          ${tp30.toFixed(precision)}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-mono">
                          +$({(riskAmount * 3.0).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-rose-400 text-xs">
                  {side === 'LONG' ? t('invalidSlLong') : t('invalidSlShort')}
                </div>
              )}
            </div>

            {/* Educational Why Position Sizing Matters Box */}
            <div className="bg-[#090d16] border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('whySizingMatters')}</span>
              </h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {t('whySizingExplanation')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
