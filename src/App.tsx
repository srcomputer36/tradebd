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
import {
  MarketIntelView,
  GLOBAL_SESSIONS,
  ECONOMIC_CALENDAR_EVENTS,
  isSessionOpenAtUtc,
} from './components/MarketIntel/MarketIntelView';
import { LegalPagesView, LegalSection } from './components/Legal/LegalPagesView';
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
  Calendar,
  Clock,
  Flame,
} from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavTab>('CHART');
  const [legalSection, setLegalSection] = useState<LegalSection>('ABOUT');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(TRADING_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [simulatorDefaultSide, setSimulatorDefaultSide] = useState<OrderSide>('LONG');

  // Cookie Consent Banner state for Google AdSense / GDPR compliance
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tradebd_cookie_consent') === 'accepted';
    } catch {
      return false;
    }
  });

  const handleAcceptCookies = () => {
    setCookieConsentAccepted(true);
    try {
      localStorage.setItem('tradebd_cookie_consent', 'accepted');
    } catch {
      // ignore
    }
  };

  const openLegalPage = useCallback((section: LegalSection) => {
    setLegalSection(section);
    setActiveTab('LEGAL');
    window.location.hash = section.toLowerCase();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectTab = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    const hashMap: Record<NavTab, string> = {
      CHART: 'chart',
      SIMULATOR: 'simulator',
      CALENDAR: 'calendar',
      ACADEMY: 'academy',
      PATTERNS: 'patterns',
      CALCULATOR: 'calculator',
      MENTOR: 'mentor',
      LEGAL: 'about',
    };
    if (window.location.hash && window.location.hash !== `#${hashMap[tab]}`) {
      window.history.replaceState(null, '', `#${hashMap[tab]}`);
    }
  }, []);

  // Sync URL hash with activeTab / legalSection so direct links (#privacy, #about, #contact, etc.) work for AdSense reviewers & crawlers
  useEffect(() => {
    const applyHashRoute = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'privacy' || hash === 'privacy-policy') {
        setLegalSection('PRIVACY');
        setActiveTab('LEGAL');
      } else if (hash === 'terms' || hash === 'terms-of-service') {
        setLegalSection('TERMS');
        setActiveTab('LEGAL');
      } else if (hash === 'disclaimer' || hash === 'risk-disclaimer') {
        setLegalSection('DISCLAIMER');
        setActiveTab('LEGAL');
      } else if (hash === 'about' || hash === 'about-us') {
        setLegalSection('ABOUT');
        setActiveTab('LEGAL');
      } else if (hash === 'contact' || hash === 'contact-us') {
        setLegalSection('CONTACT');
        setActiveTab('LEGAL');
      } else if (hash === 'academy') {
        setActiveTab('ACADEMY');
      } else if (hash === 'calendar' || hash === 'news' || hash === 'sessions') {
        setActiveTab('CALENDAR');
      } else if (hash === 'patterns') {
        setActiveTab('PATTERNS');
      } else if (hash === 'calculator') {
        setActiveTab('CALCULATOR');
      } else if (hash === 'simulator') {
        setActiveTab('SIMULATOR');
      } else if (hash === 'mentor') {
        setActiveTab('MENTOR');
      } else if (hash === 'chart') {
        setActiveTab('CHART');
      }
    };
    applyHashRoute();
    window.addEventListener('hashchange', applyHashRoute);
    return () => window.removeEventListener('hashchange', applyHashRoute);
  }, []);

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

  // Sync document title with current language
  useEffect(() => {
    document.title = `${t('appName')} - ${t('appTagline')}`;
  }, [t]);

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
        (Math.max(prevLast.open, spikedPrice) * (1 + Math.abs(signedPct) * 0.25)).toFixed(
          asset.precision
        )
      );
      const low = Number(
        (Math.min(prevLast.open, spikedPrice) * (1 - Math.abs(signedPct) * 0.25)).toFixed(
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
  const activeSessionsNow = GLOBAL_SESSIONS.filter((s) =>
    isSessionOpenAtUtc(s, nowUtcFloat)
  );
  const nextHighImpactEvent =
    ECONOMIC_CALENDAR_EVENTS.find((e) => e.status === 'UPCOMING' && e.impact === 'HIGH') ||
    ECONOMIC_CALENDAR_EVENTS[0];

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
          // Keep 500 candles so users can pan far back in history and EMA 200 has full data
          return [...prevCandles.slice(-499), newCandle];
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
        onSelectTab={handleSelectTab}
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
                      className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{t('quickSellShort')}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    {language === 'bn'
                      ? `* কুইক ট্রেডে $${quickTradeMargin} মার্জিন (5x লিভারেজ) ও অটো ১:২ স্টপ-লস/টেক-প্রফিট সেট হয়।`
                      : `* Quick trade uses $${quickTradeMargin} margin (5x leverage) with automatic 1:2 SL/TP.`}
                  </p>

                  <button
                    onClick={() => handleSelectTab('SIMULATOR')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-cyan-400 transition-colors cursor-pointer"
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

                {/* Live Trading Session & Next High-Impact Economic News Mini Card */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {language === 'bn' ? 'লাইভ সেশন ও পরবর্তী নিউজ' : 'Live Session & Next News'}
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
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
                        <span className="text-rose-400 font-bold flex items-center gap-1">
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
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>
                          {language === 'bn' ? 'পূর্ববর্তী:' : 'Prev:'} {nextHighImpactEvent.previous}
                        </span>
                        <span>
                          {language === 'bn' ? 'পূর্বাভাস:' : 'Forecast:'}{' '}
                          <strong className="text-slate-200">{nextHighImpactEvent.forecast}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab('CALENDAR')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-cyan-400 transition-colors cursor-pointer"
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
          </div>
        )}

        {/* TAB 2.5: ECONOMIC CALENDAR, TRADING SESSIONS & MARKET NEWS */}
        {activeTab === 'CALENDAR' && (
          <MarketIntelView
            onSelectAssetAndGoToChart={(asset) => {
              handleSelectAsset(asset);
              handleSelectTab('CHART');
            }}
            onSimulateVolatilitySpike={handleSimulateVolatilitySpike}
          />
        )}

        {/* TAB 3: TRADING ACADEMY & LESSONS */}
        {activeTab === 'ACADEMY' && <AcademyView />}

        {/* TAB 4: PATTERNS CHEATSHEET & GALLERY */}
        {activeTab === 'PATTERNS' && (
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
        )}

        {/* TAB 5: RISK & POSITION SIZING CALCULATOR */}
        {activeTab === 'CALCULATOR' && (
          <RiskCalculator
            currentBalance={balance}
            initialEntryPrice={currentPrice}
            selectedAsset={selectedAsset}
            assetPrices={assetPrices}
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

        {/* TAB 7: LEGAL, ABOUT, PRIVACY POLICY, DISCLAIMER & CONTACT PAGES */}
        {activeTab === 'LEGAL' && (
          <LegalPagesView
            activeSection={legalSection}
            onSelectSection={(sec) => {
              setLegalSection(sec);
              window.location.hash = sec.toLowerCase();
            }}
            onBackToChart={() => {
              setActiveTab('CHART');
              window.location.hash = 'chart';
            }}
          />
        )}
      </main>

      {/* Global Site Footer (Required for Google AdSense Compliance, Trust & Navigation) */}
      <footer className="bg-[#080c14] border-t border-slate-800/90 text-slate-400 text-xs mt-8 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Column 1: Brand & Mission */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center text-slate-950 font-black text-xs">
                  TB
                </span>
                <span className="text-sm font-extrabold text-white tracking-tight">
                  {t('appName')} (tradebd.online)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                {language === 'bn'
                  ? 'Tradebd হলো একটি সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য ফরেক্স ও ক্রিপ্টো ট্রেডিং একাডেমি, টেকনিক্যাল চার্ট অ্যানালাইসিস ও ভার্চুয়াল পেপার ট্রেডিং প্ল্যাটফর্ম। আসল অর্থ ঝুঁকিতে না ফেলে ট্রেডিং দক্ষতা ও রিস্ক ম্যানেজমেন্ট শিখুন।'
                  : 'Tradebd is a free educational trading academy, interactive technical chart analysis workspace, and virtual paper-trading simulator designed to build disciplined risk management skills.'}
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Support: support@tradebd.online · Dhaka, Bangladesh (BST UTC+6)
              </div>
            </div>

            {/* Column 2: Platform Tools */}
            <div className="md:col-span-4 space-y-2">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                {language === 'bn' ? 'প্ল্যাটফর্ম ফিচারসমূহ' : 'Platform Features'}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('CHART');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'লাইভ চার্ট অ্যানালাইসিস' : 'Live Chart Analysis'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('SIMULATOR');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'পেপার ট্রেডিং সিমুলেটর' : 'Paper Trading Simulator'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('CALENDAR');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'অর্থনৈতিক ক্যালেন্ডার ও সেশন' : 'Economic Calendar & Sessions'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('ACADEMY');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'ট্রেডিং একাডেমি কোর্স' : 'Trading Academy Course'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('PATTERNS');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'ক্যান্ডেলস্টিক প্যাটার্ন' : 'Candlestick Patterns'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('CALCULATOR');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'রিস্ক ও লট ক্যালকুলেটর' : 'Risk & Lot Calculator'}
                </button>
              </div>
            </div>

            {/* Column 3: Legal, Privacy & AdSense Compliance Links */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                {language === 'bn' ? 'আইনি ও নীতিমালা (Legal)' : 'Legal & Compliance'}
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('ABOUT');
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {language === 'bn' ? 'আমাদের সম্পর্কে (About Us)' : 'About Us'}
                </a>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('PRIVACY');
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {language === 'bn' ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}
                </a>
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('TERMS');
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {language === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms of Use)' : 'Terms & Conditions'}
                </a>
                <a
                  href="#disclaimer"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('DISCLAIMER');
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {language === 'bn' ? 'ঝুঁকি সতর্কবার্তা (Risk Disclaimer)' : 'Financial Risk Disclaimer'}
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalPage('CONTACT');
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {language === 'bn' ? 'যোগাযোগ করুন (Contact Us)' : 'Contact Us'}
                </a>
              </div>
            </div>
          </div>

          {/* YMYL Financial Educational Disclaimer & Copyright */}
          <div className="pt-5 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-500 leading-relaxed">
            <p>
              <strong className="text-slate-400">
                {language === 'bn' ? 'আর্থিক ঝুঁকি ডিসক্লেইমার: ' : 'Educational & Risk Disclaimer: '}
              </strong>
              {language === 'bn'
                ? 'Tradebd (tradebd.online) শুধুমাত্র একটি শিক্ষামূলক প্ল্যাটফর্ম এবং ভার্চুয়াল ট্রেডিং সিমুলেটর। এখানে প্রদত্ত যেকোনো কাস্টম ডেমো ব্যালেন্স সম্পূর্ণ কাল্পনিক এবং এই ওয়েবসাইটের কোনো তথ্য বা বিশ্লেষণ সরাসরি বিনিয়োগ পরামর্শ (Financial Advice) নয়। ফরেক্স ও ক্রিপ্টোকারেন্সি মার্কেটে বাস্তব অর্থ বিনিয়োগের পূর্বে নিজ দায়িত্বে ঝুঁকি যাচাই করুন।'
                : 'Tradebd (tradebd.online) is strictly an educational platform and virtual paper-trading simulator. All customizable demo balances are virtual with no monetary value. Content provided on this site does not constitute financial or investment advice.'}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-slate-500">
              <span>
                © {new Date().getFullYear()} Tradebd (tradebd.online). All rights reserved.
              </span>
              <span>
                {language === 'bn'
                  ? '১০০% বিনামূল্যে ফিন্যান্সিয়াল এডুকেশন ও পেপার ট্রেডিং প্ল্যাটফর্ম'
                  : '100% Free Financial Education & Virtual Paper Trading Workspace'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner (GDPR & Google AdSense Compliance) */}
      {!cookieConsentAccepted && (
        <div className="fixed bottom-14 md:bottom-4 left-3 right-3 md:left-auto md:right-5 md:max-w-lg bg-[#0f172a] border border-slate-700 rounded-xl p-4 shadow-2xl z-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে, ডেমো ট্রেডিং ডাটা সংরক্ষণ করতে এবং প্রাসঙ্গিক বিজ্ঞাপন (Google AdSense) প্রদর্শনের জন্য আমরা কুকিজ ব্যবহার করি।'
              : 'We use cookies and local storage to save your virtual trading progress and serve relevant educational content and advertisements.'}{' '}
            <button
              onClick={() => openLegalPage('PRIVACY')}
              className="text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'গোপনীয়তা নীতি দেখুন' : 'Privacy Policy'}
            </button>
          </div>
          <button
            onClick={handleAcceptCookies}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'সম্মতি দিন (Accept)' : 'Accept Cookies'}
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800 py-2 px-1 shrink-0 z-40 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CHART')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 shrink-0 ${
            activeTab === 'CHART' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('navChartShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 relative shrink-0 ${
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
          onClick={() => setActiveTab('CALENDAR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 shrink-0 ${
            activeTab === 'CALENDAR' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ACADEMY')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 shrink-0 ${
            activeTab === 'ACADEMY' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('navAcademyShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('PATTERNS')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 shrink-0 ${
            activeTab === 'PATTERNS' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('navPatternsShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('CALCULATOR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 shrink-0 ${
            activeTab === 'CALCULATOR' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('navCalculatorShort')}</span>
        </button>

        <button
          onClick={() => setActiveTab('MENTOR')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 shrink-0 ${
            activeTab === 'MENTOR' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>{t('navMentorShort')}</span>
        </button>
      </nav>
    </div>
  );
}
