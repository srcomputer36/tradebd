import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Candle, Asset, IndicatorSettings } from '../../types/trading';
import {
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  detectKeyLevels,
} from '../../utils/indicators';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Play,
  Pause,
  FastForward,
  Maximize2,
  SlidersHorizontal,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CandlestickChartProps {
  candles: Candle[];
  asset: Asset;
  isLiveTicking: boolean;
  tickSpeed: number; // 1, 2, 5
  onToggleLive: () => void;
  onChangeSpeed: (speed: number) => void;
  onSelectPriceForOrder?: (price: number, side: 'LONG' | 'SHORT') => void;
  timeframe: string;
  onChangeTimeframe: (tf: string) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  asset,
  isLiveTicking,
  tickSpeed,
  onToggleLive,
  onChangeSpeed,
  onSelectPriceForOrder,
  timeframe,
  onChangeTimeframe,
}) => {
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Indicators toggle state
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showEMA20: true,
    showEMA50: true,
    showEMA200: false,
    showBollinger: true,
    showRSI: true,
    showVolume: true,
    showKeyLevels: true,
  });

  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Calculate indicators memoized
  const ema20 = useMemo(() => calculateEMA(candles, 20), [candles]);
  const ema50 = useMemo(() => calculateEMA(candles, 50), [candles]);
  const ema200 = useMemo(() => calculateEMA(candles, 200), [candles]);
  const rsi = useMemo(() => calculateRSI(candles, 14), [candles]);
  const bollinger = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);
  const keyLevels = useMemo(() => detectKeyLevels(candles), [candles]);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2] || lastCandle;
  const currentPrice = lastCandle ? lastCandle.close : asset.basePrice;
  const priceChange = lastCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePct = prevCandle ? (priceChange / prevCandle.close) * 100 : 0;
  const isUp = priceChange >= 0;

  // Render chart
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Partition height: Main chart (70%), Sub-chart for RSI (30%)
    const hasRSI = indicators.showRSI;
    const mainHeight = hasRSI ? height * 0.72 : height - 28;
    const subTop = mainHeight + 10;
    const subHeight = height - subTop - 18;
    const rightPriceBarWidth = 68;
    const chartWidth = width - rightPriceBarWidth;

    // Visible window: last 60 candles
    const visibleCount = Math.min(candles.length, 65);
    const startIndex = candles.length - visibleCount;
    const visibleCandles = candles.slice(startIndex);
    const visibleEma20 = ema20.slice(startIndex);
    const visibleEma50 = ema50.slice(startIndex);
    const visibleEma200 = ema200.slice(startIndex);
    const visibleBbUpper = bollinger.upper.slice(startIndex);
    const visibleBbLower = bollinger.lower.slice(startIndex);
    const visibleBbMiddle = bollinger.middle.slice(startIndex);
    const visibleRsi = rsi.slice(startIndex);

    // Compute price range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (const c of visibleCandles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    }

    // Include Bollinger in min/max if active
    if (indicators.showBollinger) {
      for (let i = 0; i < visibleBbUpper.length; i++) {
        const u = visibleBbUpper[i];
        const l = visibleBbLower[i];
        if (u !== null && u > maxPrice) maxPrice = u;
        if (l !== null && l < minPrice) minPrice = l;
      }
    }

    // Add 4% vertical padding
    const pricePadding = (maxPrice - minPrice) * 0.05 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice || 1;

    // Helper functions
    const priceToY = (price: number) => {
      return mainHeight - ((price - minPrice) / priceRange) * (mainHeight - 30) - 15;
    };

    const candleWidth = chartWidth / visibleCount;
    const barWidth = Math.max(2, candleWidth * 0.68);

    // 1. Draw horizontal price grid & labels
    const gridSteps = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange / gridSteps) * i;
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price on right axis
      ctx.fillText(p.toFixed(asset.precision), chartWidth + 6, y + 3);
    }

    // 2. Draw Key Support & Resistance Levels
    if (indicators.showKeyLevels) {
      for (const level of keyLevels) {
        if (level.price >= minPrice && level.price <= maxPrice) {
          const y = priceToY(level.price);
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = level.type === 'SUPPORT' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tag
          ctx.fillStyle = level.type === 'SUPPORT' ? '#10b981' : '#ef4444';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillText(
            `${level.type === 'SUPPORT' ? 'Support' : 'Resist'} $${level.price.toFixed(asset.precision)}`,
            6,
            y - 4
          );
        }
      }
    }

    // 3. Draw Bollinger Bands Area & Lines
    if (indicators.showBollinger) {
      // Shaded cloud
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleCount; i++) {
        const u = visibleBbUpper[i];
        if (u !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(u);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleCount - 1; i >= 0; i--) {
        const l = visibleBbLower[i];
        if (l !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      // Lines: Upper & Lower
      const drawLine = (arr: (number | null)[], color: string, dash: number[] = []) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash(dash);
        let first = true;
        for (let i = 0; i < visibleCount; i++) {
          const v = arr[i];
          if (v !== null) {
            const x = i * candleWidth + candleWidth / 2;
            const y = priceToY(v);
            if (first) {
              ctx.moveTo(x, y);
              first = false;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawLine(visibleBbUpper, 'rgba(96, 165, 250, 0.6)');
      drawLine(visibleBbMiddle, 'rgba(147, 197, 253, 0.4)', [2, 2]);
      drawLine(visibleBbLower, 'rgba(96, 165, 250, 0.6)');
    }

    // 4. Draw EMAs
    const drawEma = (arr: (number | null)[], color: string, strokeWidth = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      let first = true;
      for (let i = 0; i < visibleCount; i++) {
        const v = arr[i];
        if (v !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = priceToY(v);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    };

    if (indicators.showEMA20) drawEma(visibleEma20, '#06b6d4', 1.5); // Cyan
    if (indicators.showEMA50) drawEma(visibleEma50, '#f97316', 1.5); // Orange
    if (indicators.showEMA200) drawEma(visibleEma200, '#a855f7', 1.8); // Purple

    // 5. Draw Volume bars at bottom of main chart
    if (indicators.showVolume && maxVolume > 0) {
      const volHeightMax = mainHeight * 0.16;
      for (let i = 0; i < visibleCount; i++) {
        const c = visibleCandles[i];
        const isGreen = c.close >= c.open;
        const x = i * candleWidth + (candleWidth - barWidth) / 2;
        const h = (c.volume / maxVolume) * volHeightMax;
        const y = mainHeight - h;

        ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(x, y, barWidth, h);
      }
    }

    // 6. Draw Candlesticks (Wicks and Bodies)
    for (let i = 0; i < visibleCount; i++) {
      const c = visibleCandles[i];
      const isGreen = c.close >= c.open;
      const xCenter = i * candleWidth + candleWidth / 2;
      const xLeft = xCenter - barWidth / 2;

      const yOpen = priceToY(c.open);
      const yClose = priceToY(c.close);
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);

      const color = isGreen ? '#10b981' : '#ef4444';

      // Upper & Lower Wick
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.moveTo(xCenter, yHigh);
      ctx.lineTo(xCenter, yLow);
      ctx.stroke();

      // Candle body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5);

      ctx.fillStyle = color;
      ctx.fillRect(xLeft, bodyTop, barWidth, bodyHeight);
    }

    // 7. Current Price Horizontal Marker & Dash
    const currentY = priceToY(currentPrice);
    ctx.beginPath();
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price badge on right axis
    ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
    ctx.fillRect(chartWidth + 2, currentY - 9, rightPriceBarWidth - 4, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(currentPrice.toFixed(asset.precision), chartWidth + 7, currentY + 4);

    // 8. Render Sub-Chart: RSI (14)
    if (hasRSI && subHeight > 20) {
      // Sub-chart border and divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, subTop - 5);
      ctx.lineTo(width, subTop - 5);
      ctx.stroke();

      // RSI Guide Lines: 70 (Overbought), 50 (Neutral), 30 (Oversold)
      const rsiToY = (val: number) => subTop + (1 - val / 100) * subHeight;

      const y70 = rsiToY(70);
      const y50 = rsiToY(50);
      const y30 = rsiToY(30);

      // Shaded zone between 30 and 70
      ctx.fillStyle = 'rgba(148, 163, 184, 0.03)';
      ctx.fillRect(0, y70, chartWidth, y30 - y70);

      // 70 line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([2, 3]);
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.stroke();

      // 50 line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.moveTo(0, y50);
      ctx.lineTo(chartWidth, y50);
      ctx.stroke();

      // 30 line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('70', chartWidth + 6, y70 + 3);
      ctx.fillText('50', chartWidth + 6, y50 + 3);
      ctx.fillText('30', chartWidth + 6, y30 + 3);

      // RSI Line
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7'; // Purple line for RSI
      ctx.lineWidth = 1.5;
      let firstRsi = true;
      for (let i = 0; i < visibleCount; i++) {
        const val = visibleRsi[i];
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = rsiToY(val);
          if (firstRsi) {
            ctx.moveTo(x, y);
            firstRsi = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      // Current RSI label
      const latestRsi = rsi[rsi.length - 1];
      ctx.fillStyle = '#c084fc';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`RSI (14): ${latestRsi ? latestRsi.toFixed(1) : '--'}`, 8, subTop + 14);
    }

    // 9. Interactive Crosshair & Tooltip
    if (hoverIndex !== null && hoverCoord && hoverIndex >= 0 && hoverIndex < visibleCount) {
      const activeCandle = visibleCandles[hoverIndex];
      const hx = hoverIndex * candleWidth + candleWidth / 2;
      const hy = hoverCoord.y;

      // Vertical crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, height);
      ctx.stroke();

      // Horizontal crosshair on main
      if (hy <= mainHeight) {
        ctx.beginPath();
        ctx.moveTo(0, hy);
        ctx.lineTo(chartWidth, hy);
        ctx.stroke();

        // Price at cursor
        const cursorPrice = minPrice + ((mainHeight - hy) / (mainHeight - 30)) * priceRange;
        ctx.fillStyle = '#334155';
        ctx.fillRect(chartWidth + 2, hy - 9, rightPriceBarWidth - 4, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(cursorPrice.toFixed(asset.precision), chartWidth + 7, hy + 4);
      }
      ctx.setLineDash([]);

      // Top Floating OHLCV Bar
      const dateStr = new Date(activeCandle.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const cDiff = activeCandle.close - activeCandle.open;
      const cDiffPct = (cDiff / activeCandle.open) * 100;
      const candleColor = cDiff >= 0 ? '#10b981' : '#ef4444';

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, 6, Math.min(width - 100, 480), 22);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(6, 6, Math.min(width - 100, 480), 22);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      let textX = 14;
      ctx.fillText(`${dateStr} ·`, textX, 21);
      textX += 62;

      ctx.fillText(`O:`, textX, 21);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${activeCandle.open.toFixed(asset.precision)}`, textX + 14, 21);
      textX += 68;

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`H:`, textX, 21);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${activeCandle.high.toFixed(asset.precision)}`, textX + 14, 21);
      textX += 68;

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`L:`, textX, 21);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`${activeCandle.low.toFixed(asset.precision)}`, textX + 14, 21);
      textX += 68;

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`C:`, textX, 21);
      ctx.fillStyle = candleColor;
      ctx.fillText(`${activeCandle.close.toFixed(asset.precision)}`, textX + 14, 21);
      textX += 70;

      ctx.fillText(`${cDiff >= 0 ? '+' : ''}${cDiffPct.toFixed(2)}%`, textX, 21);
    }
  }, [
    candles,
    asset,
    indicators,
    ema20,
    ema50,
    ema200,
    rsi,
    bollinger,
    keyLevels,
    hoverIndex,
    hoverCoord,
    currentPrice,
    isUp,
  ]);

  // Redraw on window resize or data update
  useEffect(() => {
    renderChart();
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  // Mouse move handler for crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !containerRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const visibleCount = Math.min(candles.length, 65);
    const rightPriceBarWidth = 68;
    const chartWidth = rect.width - rightPriceBarWidth;
    const candleWidth = chartWidth / visibleCount;

    const index = Math.floor(x / candleWidth);
    if (index >= 0 && index < visibleCount) {
      setHoverIndex(index);
      setHoverCoord({ x, y });
    } else {
      setHoverIndex(null);
      setHoverCoord(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverCoord(null);
  };

  // Technical Summary Interpretation
  const latestRsi = rsi[rsi.length - 1];
  const latestEma20 = ema20[ema20.length - 1];
  const latestEma50 = ema50[ema50.length - 1];
  const isEmaBullish = latestEma20 && latestEma50 ? latestEma20 > latestEma50 : true;

  let rsiStatus = t('rsiNeutral');
  if (latestRsi && latestRsi > 70) rsiStatus = t('rsiOverbought');
  else if (latestRsi && latestRsi < 30) rsiStatus = t('rsiOversold');

  const localizedAssetName =
    asset.localizedNames?.[language] ||
    (language === 'bn' ? asset.nameBn : asset.name);

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-lg overflow-hidden">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0f172a] border-b border-slate-800 text-xs">
        {/* Asset Info & Current Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${
                asset.category === 'crypto'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {asset.category === 'crypto' ? 'CRYPTO' : 'FOREX'}
            </span>
            <span className="font-bold text-white text-sm tabular-numbers tracking-tight">
              {asset.symbol}
            </span>
            <span className="text-slate-400 font-medium">{localizedAssetName}</span>
          </div>

          <div className="flex items-center gap-1.5 tabular-numbers font-mono">
            <span
              className={`text-sm font-bold ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ${currentPrice.toFixed(asset.precision)}
            </span>
            <span
              className={`flex items-center text-[11px] font-semibold ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
              )}
              {isUp ? '+' : ''}
              {priceChange.toFixed(asset.precision)} ({isUp ? '+' : ''}
              {priceChangePct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-800">
          {['1m', '5m', '15m', '1h', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => onChangeTimeframe(tf)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-slate-700 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Live Simulator Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Play live tick */}
          <button
            onClick={onToggleLive}
            title={isLiveTicking ? t('livePaused') : t('liveRunning')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
              isLiveTicking
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isLiveTicking ? (
              <>
                <Pause className="w-3 h-3" />
                <span>{t('liveRunning')}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>{t('livePaused')}</span>
              </>
            )}
          </button>

          {/* Speed multiplier */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-800 p-0.5 text-[11px] font-mono">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-1.5 py-0.5 rounded ${
                  tickSpeed === speed
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Indicator toggles dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span>{t('indicators')}</span>
            </button>

            {showIndicatorMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl p-2 z-50 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800">
                  {t('technicalIndicators')}
                </div>
                <div className="flex flex-col gap-1 mt-1.5">
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
                      EMA 20 (মোমেন্টাম)
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showEMA20}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showEMA20: e.target.checked })
                      }
                      className="rounded accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-orange-500 inline-block"></span>
                      EMA 50 (ট্রেন্ড)
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showEMA50}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showEMA50: e.target.checked })
                      }
                      className="rounded accent-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-purple-500 inline-block"></span>
                      EMA 200 (ম্যাক্রো)
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showEMA200}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showEMA200: e.target.checked })
                      }
                      className="rounded accent-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-blue-400 inline-block"></span>
                      Bollinger Bands
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showBollinger}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showBollinger: e.target.checked })
                      }
                      className="rounded accent-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-purple-400 inline-block"></span>
                      RSI (14) Oscillator
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showRSI}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showRSI: e.target.checked })
                      }
                      className="rounded accent-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span>
                      সাপোর্ট ও রেজিস্ট্যান্স
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showKeyLevels}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showKeyLevels: e.target.checked })
                      }
                      className="rounded accent-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-slate-400 inline-block"></span>
                      ভলিউম বার (Volume)
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators.showVolume}
                      onChange={(e) =>
                        setIndicators({ ...indicators, showVolume: e.target.checked })
                      }
                      className="rounded accent-slate-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full h-[460px] min-h-[380px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 cursor-crosshair block"
        />

        {/* Quick Quick-Trade Entry Shortcuts floating in corner */}
        {onSelectPriceForOrder && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              {t('currentPrice')}:
            </span>
            <button
              onClick={() => onSelectPriceForOrder(currentPrice, 'LONG')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] transition-colors"
            >
              {t('buyAtCurrent')} (${currentPrice.toFixed(asset.precision)})
            </button>
            <button
              onClick={() => onSelectPriceForOrder(currentPrice, 'SHORT')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-[11px] transition-colors"
            >
              {t('sellAtCurrent')} (${currentPrice.toFixed(asset.precision)})
            </button>
          </div>
        )}
      </div>

      {/* Chart Footer with Live Market Technical Reading */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#0c121e] border-t border-slate-800/90 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('trend')}:</span>
            <span
              className={`font-semibold ${
                isEmaBullish ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isEmaBullish ? t('bullishMomentum') : t('bearishMomentum')}
            </span>
          </div>

          <span className="text-slate-600" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('rsiStatus')}:</span>
            <span className="font-semibold text-slate-300">{rsiStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">{t('chartTip')}</span>
        </div>
      </div>
    </div>
  );
};
