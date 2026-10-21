import React, { useState, useMemo, useEffect } from 'react';
import { Asset, OrderSide, Position, TradeHistory } from '../../types/trading';
import { TRADING_ASSETS } from '../../data/assets';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coins,
  Globe2,
} from 'lucide-react';

interface PaperTradingPanelProps {
  currentAsset: Asset;
  currentPrice: number;
  balance: number;
  positions: Position[];
  tradeHistory: TradeHistory[];
  onOpenPosition: (order: {
    asset: Asset;
    side: OrderSide;
    entryPrice: number;
    size: number;
    margin: number;
    leverage: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => void;
  onClosePosition: (id: string, reason?: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS') => void;
  onResetAccount: () => void;
  defaultSide?: OrderSide;
  defaultEntryPrice?: number;
}

export const PaperTradingPanel: React.FC<PaperTradingPanelProps> = ({
  currentAsset,
  currentPrice,
  balance,
  positions,
  tradeHistory,
  onOpenPosition,
  onClosePosition,
  onResetAccount,
  defaultSide = 'LONG',
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'TRADE' | 'POSITIONS' | 'HISTORY'>('TRADE');
  const [side, setSide] = useState<OrderSide>(defaultSide);
  const [leverage, setLeverage] = useState<number>(5);
  const [marginInput, setMarginInput] = useState<string>('500');
  const [stopLossInput, setStopLossInput] = useState<string>('');
  const [takeProfitInput, setTakeProfitInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Sync side if defaultSide changes from Chart quick-order button
  useEffect(() => {
    setSide(defaultSide);
  }, [defaultSide]);

  // Reset SL/TP and clamp leverage when user switches between Crypto and Forex pairs
  useEffect(() => {
    setStopLossInput('');
    setTakeProfitInput('');
    setFeedbackMsg(null);
    setLeverage((prev) => Math.min(prev, currentAsset.leverageMax));
  }, [currentAsset.id, currentAsset.leverageMax]);

  // Lookup asset category & precision
  const getAssetInfo = (assetId: string) => {
    const found = TRADING_ASSETS.find((a) => a.id === assetId);
    return {
      category: found?.category || 'crypto',
      precision: found?.precision ?? 2,
    };
  };

  // Separate positions & history into CRYPTO and FOREX sections
  const cryptoPositions = useMemo(
    () => positions.filter((p) => getAssetInfo(p.assetId).category === 'crypto'),
    [positions]
  );
  const forexPositions = useMemo(
    () => positions.filter((p) => getAssetInfo(p.assetId).category === 'forex'),
    [positions]
  );

  const cryptoHistory = useMemo(
    () => tradeHistory.filter((h) => getAssetInfo(h.assetId).category === 'crypto'),
    [tradeHistory]
  );
  const forexHistory = useMemo(
    () => tradeHistory.filter((h) => getAssetInfo(h.assetId).category === 'forex'),
    [tradeHistory]
  );

  // Calculate position size, liquidation price, and R:R
  const {
    marginNum,
    positionValue,
    quantity,
    liquidationPrice,
    rrRatio,
    projectedRisk,
    projectedReward,
    isSlValid,
    isTpValid,
  } = useMemo(() => {
    const m = Math.max(0, parseFloat(marginInput) || 0);
    const posVal = m * leverage;
    const qty = currentPrice > 0 ? posVal / currentPrice : 0;

    // Liquidation price estimation
    const liqBuffer = 0.9 / leverage;
    const liq =
      side === 'LONG'
        ? currentPrice * (1 - liqBuffer)
        : currentPrice * (1 + liqBuffer);

    const sl = parseFloat(stopLossInput);
    const tp = parseFloat(takeProfitInput);

    let slValid = true;
    let tpValid = true;
    let riskDollar = 0;
    let rewardDollar = 0;
    let rr = 0;

    if (!isNaN(sl) && sl > 0) {
      if (side === 'LONG' && sl >= currentPrice) slValid = false;
      if (side === 'SHORT' && sl <= currentPrice) slValid = false;
      if (slValid) {
        riskDollar = Math.abs(currentPrice - sl) * qty;
      }
    }

    if (!isNaN(tp) && tp > 0) {
      if (side === 'LONG' && tp <= currentPrice) tpValid = false;
      if (side === 'SHORT' && tp >= currentPrice) tpValid = false;
      if (tpValid) {
        rewardDollar = Math.abs(tp - currentPrice) * qty;
      }
    }

    if (riskDollar > 0 && rewardDollar > 0) {
      rr = Number((rewardDollar / riskDollar).toFixed(2));
    }

    return {
      marginNum: m,
      positionValue: posVal,
      quantity: qty,
      liquidationPrice: Math.max(0, liq),
      rrRatio: rr,
      projectedRisk: riskDollar,
      projectedReward: rewardDollar,
      isSlValid: slValid,
      isTpValid: tpValid,
    };
  }, [marginInput, leverage, currentPrice, side, stopLossInput, takeProfitInput]);

  // Auto-populate recommended SL (1.5% away) and TP (3% away -> 1:2 RR)
  const handleAutoSetPresets = (rrTarget: number = 2) => {
    const riskDist = currentAsset.category === 'forex' ? 0.005 : 0.015;
    const slPrice =
      side === 'LONG'
        ? currentPrice * (1 - riskDist)
        : currentPrice * (1 + riskDist);
    const tpPrice =
      side === 'LONG'
        ? currentPrice * (1 + riskDist * rrTarget)
        : currentPrice * (1 - riskDist * rrTarget);

    setStopLossInput(slPrice.toFixed(currentAsset.precision));
    setTakeProfitInput(tpPrice.toFixed(currentAsset.precision));
  };

  // Submit new virtual trade
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (marginNum <= 0) {
      setFeedbackMsg({
        type: 'error',
        text: t('validMarginError'),
      });
      return;
    }
    if (marginNum > balance) {
      setFeedbackMsg({
        type: 'error',
        text: t('insufficientBalanceError'),
      });
      return;
    }
    if (!isSlValid) {
      setFeedbackMsg({
        type: 'error',
        text: side === 'LONG' ? t('invalidSlLong') : t('invalidSlShort'),
      });
      return;
    }
    if (!isTpValid) {
      setFeedbackMsg({
        type: 'error',
        text: side === 'LONG' ? t('invalidTpLong') : t('invalidTpShort'),
      });
      return;
    }

    const sl = parseFloat(stopLossInput);
    const tp = parseFloat(takeProfitInput);

    onOpenPosition({
      asset: currentAsset,
      side,
      entryPrice: currentPrice,
      size: quantity,
      margin: marginNum,
      leverage,
      stopLoss: !isNaN(sl) && sl > 0 ? sl : undefined,
      takeProfit: !isNaN(tp) && tp > 0 ? tp : undefined,
    });

    setFeedbackMsg({
      type: 'success',
      text: `${currentAsset.symbol} (${currentAsset.category.toUpperCase()}) ${side} order placed!`,
    });

    setActiveTab('POSITIONS');
  };

  // Quick balance percentage selector
  const setMarginPercentage = (pct: number) => {
    const val = Math.floor(balance * (pct / 100));
    setMarginInput(val.toString());
  };

  // Performance metrics
  const totalTrades = tradeHistory.length;
  const winningTrades = tradeHistory.filter((item) => item.pnl > 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0.0';

  const localizedAssetName =
    currentAsset.localizedNames?.[language] ||
    (language === 'bn' ? currentAsset.nameBn : currentAsset.name);

  const renderPositionsTable = (list: Position[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-6 px-4 border border-dashed border-slate-800/80 rounded-lg bg-slate-900/30">
          <p className="text-slate-400 text-xs">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="py-2 px-2">{t('pairSide')}</th>
              <th className="py-2 px-2">{t('sizeMargin')}</th>
              <th className="py-2 px-2">{t('entryPrice')}</th>
              <th className="py-2 px-2">{t('currentPrice')}</th>
              <th className="py-2 px-2">SL / TP</th>
              <th className="py-2 px-2">{t('unrealizedPnl')}</th>
              <th className="py-2 px-2 text-right">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {list.map((pos) => {
              const isProfit = pos.pnl >= 0;
              const info = getAssetInfo(pos.assetId);
              return (
                <tr key={pos.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {pos.side} {pos.leverage}x
                      </span>
                      <span className="font-bold text-white">{pos.symbol}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">
                    ${(pos.margin * pos.leverage).toFixed(0)} (${pos.margin.toFixed(0)})
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">
                    ${pos.entryPrice.toFixed(info.precision)}
                  </td>
                  <td className="py-2.5 px-2 text-slate-200">
                    ${pos.currentPrice.toFixed(info.precision)}
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 text-[11px]">
                    <div>SL: {pos.stopLoss ? `$${pos.stopLoss.toFixed(info.precision)}` : '--'}</div>
                    <div>TP: {pos.takeProfit ? `$${pos.takeProfit.toFixed(info.precision)}` : '--'}</div>
                  </td>
                  <td className="py-2.5 px-2 font-bold tabular-numbers">
                    <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                      {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                      {pos.pnlPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => onClosePosition(pos.id, 'MANUAL')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded border border-slate-700 transition-colors cursor-pointer"
                    >
                      {t('closePosition')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderHistoryTable = (list: TradeHistory[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-6 px-4 border border-dashed border-slate-800/80 rounded-lg bg-slate-900/30">
          <p className="text-slate-400 text-xs">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="py-2 px-2">{t('marketPair')}</th>
              <th className="py-2 px-2">{t('pairSide')}</th>
              <th className="py-2 px-2">{t('entryPrice')} → Exit</th>
              <th className="py-2 px-2">{t('realizedPnl')}</th>
              <th className="py-2 px-2">{t('exitReason')}</th>
              <th className="py-2 px-2 text-right">{t('dateTime')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {list.map((item) => {
              const isProfit = item.pnl >= 0;
              const info = getAssetInfo(item.assetId);
              return (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2 px-2 font-bold text-white">{item.symbol}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.side === 'LONG'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {item.side} {item.leverage}x
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-300">
                    ${item.entryPrice.toFixed(info.precision)} → $
                    {item.exitPrice.toFixed(info.precision)}
                  </td>
                  <td className="py-2 px-2 font-bold tabular-numbers">
                    <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                      {isProfit ? '+' : ''}${item.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                      {item.pnlPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="text-[11px] text-slate-300">
                      {item.reason === 'TAKE_PROFIT'
                        ? t('tpHit')
                        : item.reason === 'STOP_LOSS'
                        ? t('slHit')
                        : t('manualClose')}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-400 text-[11px]">
                    {new Date(item.closeTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-lg overflow-hidden">
      {/* Simulator Navigation Tabs & Quick Account KPI */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0f172a] border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('TRADE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'TRADE'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('newOrder')}
          </button>
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'POSITIONS'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('openPositions')}</span>
            {positions.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono">
                {positions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('tradeJournal')} ({tradeHistory.length})
          </button>
        </div>

        {/* Portfolio Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('demoFund')}:</span>
            <span className="font-bold text-white tabular-numbers">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <span className="text-slate-700" aria-hidden="true">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('winRate')}:</span>
            <span className="font-bold text-cyan-400 tabular-numbers">{winRate}%</span>
          </div>

          <button
            onClick={onResetAccount}
            title={t('resetDemo')}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors ml-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {feedbackMsg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-xs ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {activeTab === 'TRADE' && (
          <form onSubmit={handleSubmitOrder} className="space-y-4 max-w-xl mx-auto">
            {/* Direction Selector (Long vs Short) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('LONG')}
                className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  side === 'LONG'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{t('longBuyAction')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSide('SHORT')}
                className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  side === 'SHORT'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 ring-2 ring-rose-400'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>{t('shortSellAction')}</span>
              </button>
            </div>

            {/* Current Asset & Live Execution Price with CRYPTO / FOREX Section Badge */}
            <div className="p-3 bg-[#0f172a] rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                    currentAsset.category === 'crypto'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {currentAsset.category === 'crypto' ? '🪙 CRYPTO SECTION' : '💱 FOREX SECTION'}
                </span>
                <div>
                  <span className="font-bold text-white font-mono">{currentAsset.symbol}</span>
                  <span className="text-slate-400 ml-1">({localizedAssetName})</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">{t('orderExecutionPrice')}: </span>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  ${currentPrice.toFixed(currentAsset.precision)}
                </span>
              </div>
            </div>

            {/* Leverage Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{t('leverageMultiplier')}:</span>
                <span className="font-mono text-cyan-400 font-bold">{leverage}x</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 5, 10, currentAsset.leverageMax].map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setLeverage(lev)}
                    className={`py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      leverage === lev
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">{t('leverageTip')}</p>
            </div>

            {/* Margin Input ($ USD) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{t('marginCapital')}:</span>
                <span className="text-slate-400 font-mono">
                  {t('available')}: ${balance.toFixed(2)}
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-mono text-xs">$</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={balance}
                  value={marginInput}
                  onChange={(e) => setMarginInput(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-cyan-500"
                  placeholder="500"
                />
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setMarginPercentage(pct)}
                    className="py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 transition-colors cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Stop Loss */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-300 font-medium">{t('stopLoss')}:</span>
                  {projectedRisk > 0 && (
                    <span className="font-mono text-rose-400 text-[11px]">
                      -${projectedRisk.toFixed(2)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  value={stopLossInput}
                  onChange={(e) => setStopLossInput(e.target.value)}
                  placeholder={
                    side === 'LONG'
                      ? `< $${(currentPrice * 0.985).toFixed(currentAsset.precision)}`
                      : `> $${(currentPrice * 1.015).toFixed(currentAsset.precision)}`
                  }
                  className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white font-mono text-xs focus:outline-hidden ${
                    !isSlValid ? 'border-rose-500' : 'border-slate-800 focus:border-rose-500'
                  }`}
                />
                {!isSlValid && (
                  <p className="text-[10px] text-rose-400">
                    {side === 'LONG' ? t('invalidSlLong') : t('invalidSlShort')}
                  </p>
                )}
              </div>

              {/* Take Profit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-medium">{t('takeProfit')}:</span>
                  {projectedReward > 0 && (
                    <span className="font-mono text-emerald-400 text-[11px]">
                      +${projectedReward.toFixed(2)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  value={takeProfitInput}
                  onChange={(e) => setTakeProfitInput(e.target.value)}
                  placeholder={
                    side === 'LONG'
                      ? `> $${(currentPrice * 1.03).toFixed(currentAsset.precision)}`
                      : `< $${(currentPrice * 0.97).toFixed(currentAsset.precision)}`
                  }
                  className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white font-mono text-xs focus:outline-hidden ${
                    !isTpValid ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {!isTpValid && (
                  <p className="text-[10px] text-rose-400">
                    {side === 'LONG' ? t('invalidTpLong') : t('invalidTpShort')}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Auto-preset button */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80">
              <span>{t('autoPresets')}:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAutoSetPresets(1.5)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] cursor-pointer"
                >
                  1:1.5 RR
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoSetPresets(2)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] cursor-pointer"
                >
                  1:2 RR
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoSetPresets(3)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] cursor-pointer"
                >
                  1:3 RR
                </button>
              </div>
            </div>

            {/* Trade Calculation Summary Card */}
            <div className="p-3.5 bg-[#0f172a] rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{t('positionSizeVal')}:</span>
                <span className="font-mono font-bold text-white">
                  ${positionValue.toFixed(2)} ({quantity.toFixed(4)}{' '}
                  {currentAsset.category === 'crypto' ? 'Coins' : 'Units'})
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{t('rrRatio')}:</span>
                <span
                  className={`font-mono font-bold ${
                    rrRatio >= 2
                      ? 'text-emerald-400'
                      : rrRatio >= 1.5
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {rrRatio > 0 ? `1:${rrRatio}` : t('notSet')}
                </span>
              </div>
              {leverage > 1 && (
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-rose-300">
                    <AlertTriangle className="w-3 h-3" />
                    {t('liqPrice')}:
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    ${liquidationPrice.toFixed(currentAsset.precision)}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Trade Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide text-white transition-all shadow-md cursor-pointer ${
                side === 'LONG'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
              }`}
            >
              {side === 'LONG' ? t('confirmBuyOrder') : t('confirmSellOrder')} ($
              {positionValue.toFixed(2)})
            </button>
          </form>
        )}

        {/* POSITIONS TAB: Separate CRYPTO & FOREX Sections */}
        {activeTab === 'POSITIONS' && (
          <div className="space-y-6">
            {/* CRYPTO POSITIONS SECTION */}
            <div className="border border-amber-500/30 bg-amber-950/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                    {language === 'bn'
                      ? 'ক্রিপ্টো ওপেন পজিশন সেকশন (CRYPTO POSITIONS)'
                      : 'CRYPTO POSITIONS SECTION'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded">
                  {cryptoPositions.length} Active
                </span>
              </div>
              {renderPositionsTable(
                cryptoPositions,
                language === 'bn'
                  ? 'ক্রিপ্টো সেকশনে কোনো সক্রিয় ট্রেড নেই।'
                  : 'No open positions in the CRYPTO section.'
              )}
            </div>

            {/* FOREX POSITIONS SECTION */}
            <div className="border border-cyan-500/30 bg-cyan-950/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                    {language === 'bn'
                      ? 'ফরেক্স ওপেন পজিশন সেকশন (FOREX POSITIONS)'
                      : 'FOREX POSITIONS SECTION'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded">
                  {forexPositions.length} Active
                </span>
              </div>
              {renderPositionsTable(
                forexPositions,
                language === 'bn'
                  ? 'ফরেক্স সেকশনে কোনো সক্রিয় ট্রেড নেই।'
                  : 'No open positions in the FOREX section.'
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB: Separate CRYPTO & FOREX Sections */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6">
            {/* CRYPTO TRADE HISTORY SECTION */}
            <div className="border border-amber-500/30 bg-amber-950/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                    {language === 'bn'
                      ? 'ক্রিপ্টো ট্রেড জার্নাল সেকশন (CRYPTO HISTORY)'
                      : 'CRYPTO TRADE JOURNAL SECTION'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded">
                  {cryptoHistory.length} Closed
                </span>
              </div>
              {renderHistoryTable(
                cryptoHistory,
                language === 'bn'
                  ? 'ক্রিপ্টো সেকশনে এখনো কোনো ট্রেড ক্লোজ করা হয়নি।'
                  : 'No closed trades in the CRYPTO section yet.'
              )}
            </div>

            {/* FOREX TRADE HISTORY SECTION */}
            <div className="border border-cyan-500/30 bg-cyan-950/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                    {language === 'bn'
                      ? 'ফরেক্স ট্রেড জার্নাল সেকশন (FOREX HISTORY)'
                      : 'FOREX TRADE JOURNAL SECTION'}
                  </h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded">
                  {forexHistory.length} Closed
                </span>
              </div>
              {renderHistoryTable(
                forexHistory,
                language === 'bn'
                  ? 'ফরেক্স সেকশনে এখনো কোনো ট্রেড ক্লোজ করা হয়নি।'
                  : 'No closed trades in the FOREX section yet.'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
