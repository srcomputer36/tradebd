import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TRADING_ASSETS, generateCandles, simulateTick } from './data/assets';
import { Asset, Candle, OrderSide, Position, TradeHistory } from './types/trading';
import { Navbar, NavTab } from './components/Navbar';
import { CandlestickChart } from './components/Chart/CandlestickChart';
import { PaperTradingPanel } from './components/Simulator/PaperTradingPanel';
import { AcademyView } from './components/Academy/AcademyView';
import { PatternGallery } from './components/Patterns/PatternGallery';
import { RiskCalculator } from './components/Calculator/RiskCalculator';
import { AiMentorView } from './components/Mentor/AiMentorView';
import { MarketSectionsBar } from './components/MarketSectionsBar';
import { useLanguage } from './context/LanguageContext';
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
} from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavTab>('CHART');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(TRADING_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [simulatorDefaultSide, setSimulatorDefaultSide] = useState<OrderSide>('LONG');

  // Track live prices for all Crypto and Forex pairs simultaneously
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const a of TRADING_ASSETS) {
      initial[a.id] = a.basePrice;
    }
    return initial;
  });

  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(TRADING_ASSETS[0], 220, '15m', TRADING_ASSETS[0].basePrice)
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

  // Toast notification state & Reset Demo confirmation modal state
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  // Sync document title with current language
  useEffect(() => {
    document.title = `${t('appName')} - ${t('appTagline')}`;
  }, [t]);

  // When selected asset changes, generate 220 candles anchored to that asset's current live price
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    const targetPrice = assetPrices[asset.id] ?? asset.basePrice;
    setCandles(generateCandles(asset, 220, timeframe, targetPrice));
  };

  // When timeframe changes on the chart, regenerate 220 candles for that timeframe anchored to live price
  const handleChangeTimeframe = (tf: string) => {
    setTimeframe(tf);
    const targetPrice = assetPrices[selectedAsset.id] ?? selectedAsset.basePrice;
    setCandles(generateCandles(selectedAsset, 220, tf, targetPrice));
  };

  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle ? lastCandle.close : (assetPrices[selectedAsset.id] ?? selectedAsset.basePrice);

  // Counter to produce new candle every ~12 ticks
  const tickCounterRef = useRef(0);

  // Live price tick simulation loop for both selected chart candles & all background assets
  useEffect(() => {
    if (!isLiveTicking) return;

    const intervalMs = Math.max(250, 1200 / tickSpeed);
    const interval = setInterval(() => {
      tickCounterRef.current += 1;
      const isNewCandle = tickCounterRef.current >= 12;
      if (isNewCandle) tickCounterRef.current = 0;

      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;

        const last = prevCandles[prevCandles.length - 1];
        const { updatedCandle, newCandle } = simulateTick(last, selectedAsset, isNewCandle);
        const latestClose = newCandle ? newCandle.close : updatedCandle.close;

        // Update live prices for all assets (selectedAsset uses exact candle close)
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

        if (newCandle) {
          // Keep 220 candles so EMA 200 always has full data
          return [...prevCandles.slice(-220), newCandle];
        } else {
          return [...prevCandles.slice(0, -1), updatedCandle];
        }
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isLiveTicking, tickSpeed, selectedAsset]);

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
    let liqPrice = 0;
    if (order.leverage > 1) {
      liqPrice =
        order.side === 'LONG'
          ? order.entryPrice * (1 - maintenanceFactor)
          : order.entryPrice * (1 + maintenanceFactor);
    }

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

  // Open Reset Demo confirmation modal (iframe-safe instead of window.confirm)
  const handleResetDemo = () => {
    setShowResetModal(true);
  };

  const confirmResetDemo = () => {
    setBalance(25000);
    setPositions([]);
    setTradeHistory([]);
    try {
      localStorage.removeItem('tradebd_balance');
      localStorage.removeItem('tradebd_positions');
      localStorage.removeItem('tradebd_history');
    } catch {
      // ignore
    }
    setShowResetModal(false);
    showToast(t('resetDemoSuccess'), 'success');
  };

  const getAssetName = (asset: Asset) => {
    return asset.localizedNames?.[language] || (language === 'bn' ? asset.nameBn : asset.name);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
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

      {/* In-App Reset Demo Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{t('resetDemo')}</span>
              </h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{t('resetDemoConfirm')}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
              </button>
              <button
                onClick={confirmResetDemo}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                {t('resetDemo')} ($25,000)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
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
                    setActiveTab('SIMULATOR');
                  }}
                />
              </div>

              {/* Side Fast-Action & Educational Context Panel */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Fast Order Execution Mini Panel */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {t('quickTradeTitle')}
                    </span>
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
                          size: (500 * 5) / currentPrice,
                          margin: 500,
                          leverage: 5,
                          stopLoss: Number(
                            (currentPrice * (1 - dist)).toFixed(selectedAsset.precision)
                          ),
                          takeProfit: Number(
                            (currentPrice * (1 + dist * 2)).toFixed(selectedAsset.precision)
                          ),
                        });
                      }}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
                          size: (500 * 5) / currentPrice,
                          margin: 500,
                          leverage: 5,
                          stopLoss: Number(
                            (currentPrice * (1 + dist)).toFixed(selectedAsset.precision)
                          ),
                          takeProfit: Number(
                            (currentPrice * (1 - dist * 2)).toFixed(selectedAsset.precision)
                          ),
                        });
                      }}
                      className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{t('quickSellShort')}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    {t('quickTradeNote')}
                  </p>

                  <button
                    onClick={() => setActiveTab('SIMULATOR')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-cyan-400 transition-colors"
                  >
                    {t('customOrderBtn')}
                  </button>
                </div>

                {/* Technical Analysis Checklist for Beginners */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('checklistTitle')}</span>
                    </h4>
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
                    <span className="text-slate-400">{t('wantToLearn')}</span>
                    <button
                      onClick={() => setActiveTab('ACADEMY')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      {t('viewAcademyCourse')}
                    </button>
                  </div>
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
            <PaperTradingPanel
              currentAsset={selectedAsset}
              currentPrice={currentPrice}
              balance={balance}
              positions={positions}
              tradeHistory={tradeHistory}
              onOpenPosition={handleOpenPosition}
              onClosePosition={handleClosePosition}
              onResetAccount={handleResetDemo}
              defaultSide={simulatorDefaultSide}
            />
          </div>
        )}

        {/* TAB 3: TRADING ACADEMY & LESSONS */}
        {activeTab === 'ACADEMY' && <AcademyView />}

        {/* TAB 4: PATTERNS CHEATSHEET & GALLERY */}
        {activeTab === 'PATTERNS' && <PatternGallery />}

        {/* TAB 5: RISK & POSITION SIZING CALCULATOR */}
        {activeTab === 'CALCULATOR' && (
          <RiskCalculator
            currentBalance={balance}
            initialEntryPrice={currentPrice}
            selectedAsset={selectedAsset}
          />
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
            <AiMentorView currentAsset={selectedAsset} currentPrice={currentPrice} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <footer className="md:hidden flex items-center justify-around bg-[#090d16] border-t border-slate-800 py-2 px-1 shrink-0 z-40">
        <button
          onClick={() => setActiveTab('CHART')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 ${
            activeTab === 'CHART' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('navChartShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 relative ${
            activeTab === 'SIMULATOR' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t('navSimulatorShort')}</span>
          {positions.length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ACADEMY')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 ${
            activeTab === 'ACADEMY' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('navAcademyShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('PATTERNS')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 ${
            activeTab === 'PATTERNS' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('navPatternsShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('CALCULATOR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 ${
            activeTab === 'CALCULATOR' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('navCalculatorShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('MENTOR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 ${
            activeTab === 'MENTOR' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>{t('navMentorShort')}</span>
        </button>
      </footer>
    </div>
  );
}
