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
  Play,
  Pause,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ChevronsRight,
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
  const indicatorMenuRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Zoom (visible candle count) & Pan (floating-point candle offset from latest) state
  // Positive panOffset = looking back into history (older candles)
  // Negative panOffset = shifting latest candle left to leave empty space on the right (like TradingView)
  const MIN_VISIBLE_CANDLES = 16;
  const MAX_VISIBLE_CANDLES = 200;
  const DEFAULT_VISIBLE_CANDLES = 60;

  const [visibleCandleCount, setVisibleCandleCount] = useState<number>(DEFAULT_VISIBLE_CANDLES);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startPanOffset: number;
    pinchStartDist: number | null;
    pinchStartVisible: number;
  }>({
    active: false,
    startX: 0,
    startPanOffset: 0,
    pinchStartDist: null,
    pinchStartVisible: DEFAULT_VISIBLE_CANDLES,
  });

  // Reset panOffset when switching asset or timeframe
  useEffect(() => {
    setPanOffset(0);
  }, [asset.id, timeframe]);

  // Keep historical view locked in place when a new live candle is appended while user is panned back
  const prevLastCandleTimeRef = useRef<number | null>(
    candles.length > 0 ? candles[candles.length - 1].time : null
  );
  useEffect(() => {
    if (candles.length === 0) return;
    const latestTime = candles[candles.length - 1].time;
    if (
      prevLastCandleTimeRef.current !== null &&
      latestTime > prevLastCandleTimeRef.current &&
      panOffset > 0.5
    ) {
      setPanOffset((prev) => prev + 1);
    }
    prevLastCandleTimeRef.current = latestTime;
  }, [candles, panOffset]);

  const effectiveVisibleCount = Math.max(10, Math.min(candles.length, visibleCandleCount));
  // Allow panning up to 50% of screen into future right-margin (negative offset) and all the way to candle 0
  const minPanOffset = -Math.floor(effectiveVisibleCount * 0.5);
  const maxPanOffset = Math.max(0, candles.length - Math.floor(effectiveVisibleCount * 0.3));
  const clampedPanOffset = Math.max(minPanOffset, Math.min(panOffset, maxPanOffset));

  const handleZoomIn = useCallback(() => {
    setVisibleCandleCount((prev) => Math.max(MIN_VISIBLE_CANDLES, Math.round(prev * 0.78)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setVisibleCandleCount((prev) =>
      Math.min(
        Math.max(MIN_VISIBLE_CANDLES, candles.length),
        MAX_VISIBLE_CANDLES,
        Math.round(prev * 1.28)
      )
    );
  }, [candles.length]);

  const handlePanLeft = useCallback(() => {
    setPanOffset((prev) => {
      const step = Math.max(6, Math.round(effectiveVisibleCount * 0.25));
      return Math.min(maxPanOffset, prev + step);
    });
  }, [effectiveVisibleCount, maxPanOffset]);

  const handlePanRight = useCallback(() => {
    setPanOffset((prev) => {
      const step = Math.max(6, Math.round(effectiveVisibleCount * 0.25));
      return Math.max(minPanOffset, prev - step);
    });
  }, [effectiveVisibleCount, minPanOffset]);

  const handleResetView = useCallback(() => {
    setVisibleCandleCount(DEFAULT_VISIBLE_CANDLES);
    setPanOffset(0);
  }, []);

  // Close indicator menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (indicatorMenuRef.current && !indicatorMenuRef.current.contains(event.target as Node)) {
        setShowIndicatorMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate indicators memoized across all 500 candles
  const ema20 = useMemo(() => calculateEMA(candles, 20), [candles]);
  const ema50 = useMemo(() => calculateEMA(candles, 50), [candles]);
  const ema200 = useMemo(() => calculateEMA(candles, 200), [candles]);
  const rsi = useMemo(() => calculateRSI(candles, 14), [candles]);
  const bollinger = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);
  const keyLevels = useMemo(
    () => detectKeyLevels(candles, asset.category === 'forex' ? 0.0015 : 0.008),
    [candles, asset.category]
  );

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2] || lastCandle;
  const currentPrice = lastCandle ? lastCandle.close : asset.basePrice;
  const priceChange = lastCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePct = prevCandle ? (priceChange / prevCandle.close) * 100 : 0;
  const isUp = priceChange >= 0;

  // Render chart with pixel-smooth fractional panning
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
    const chartWidth = Math.max(100, width - rightPriceBarWidth);

    const visibleCount = effectiveVisibleCount;
    const candleWidth = chartWidth / visibleCount;
    const barWidth = Math.max(2, candleWidth * 0.68);

    // Floating-point base index at the left edge of the screen
    const baseStart = candles.length - visibleCount - clampedPanOffset;
    const firstGlobalIdx = Math.max(0, Math.floor(baseStart) - 1);
    const lastGlobalIdx = Math.min(candles.length - 1, Math.ceil(baseStart + visibleCount) + 1);

    // Helper: convert global candle index g to horizontal X center
    const globalIdxToX = (g: number) => (g - baseStart + 0.5) * candleWidth;

    // Compute price range for visible candles
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
      const c = candles[g];
      if (!c) continue;
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;

      if (indicators.showBollinger) {
        const u = bollinger.upper[g];
        const l = bollinger.lower[g];
        if (u !== null && u > maxPrice) maxPrice = u;
        if (l !== null && l < minPrice) minPrice = l;
      }

      if (indicators.showEMA200) {
        const v200 = ema200[g];
        if (v200 !== null) {
          if (v200 > maxPrice) maxPrice = v200;
          if (v200 < minPrice) minPrice = v200;
        }
      }
    }

    if (!isFinite(minPrice) || !isFinite(maxPrice)) {
      minPrice = currentPrice * 0.98;
      maxPrice = currentPrice * 1.02;
    }

    // Add 5% vertical padding
    const pricePadding = (maxPrice - minPrice) * 0.05 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice || 1;

    const priceToY = (price: number) => {
      return mainHeight - ((price - minPrice) / priceRange) * (mainHeight - 30) - 15;
    };

    // 1. Draw horizontal price grid & right-axis labels
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

    // Clip main chart drawing region to [0, chartWidth] so panned candles never overlap price axis
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, chartWidth, height);
    ctx.clip();

    // 2. Draw Key Support & Resistance Levels
    if (indicators.showKeyLevels) {
      for (const level of keyLevels) {
        if (level.price >= minPrice && level.price <= maxPrice) {
          const y = priceToY(level.price);
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle =
            level.type === 'SUPPORT' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = level.type === 'SUPPORT' ? '#10b981' : '#ef4444';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillText(
            `${level.type === 'SUPPORT' ? 'Support' : 'Resist'} $${level.price.toFixed(
              asset.precision
            )}`,
            6,
            y - 4
          );
        }
      }
    }

    // 3. Draw Bollinger Bands Area & Lines
    if (indicators.showBollinger) {
      ctx.beginPath();
      let started = false;
      for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
        const u = bollinger.upper[g];
        if (u !== null) {
          const x = globalIdxToX(g);
          const y = priceToY(u);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let g = lastGlobalIdx; g >= firstGlobalIdx; g--) {
        const l = bollinger.lower[g];
        if (l !== null) {
          const x = globalIdxToX(g);
          const y = priceToY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      const drawGlobalLine = (arr: (number | null)[], color: string, dash: number[] = []) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash(dash);
        let first = true;
        for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
          const v = arr[g];
          if (v !== null) {
            const x = globalIdxToX(g);
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

      drawGlobalLine(bollinger.upper, 'rgba(96, 165, 250, 0.6)');
      drawGlobalLine(bollinger.middle, 'rgba(147, 197, 253, 0.4)', [2, 2]);
      drawGlobalLine(bollinger.lower, 'rgba(96, 165, 250, 0.6)');
    }

    // 4. Draw EMAs
    const drawEma = (arr: (number | null)[], color: string, strokeWidth = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      let first = true;
      for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
        const v = arr[g];
        if (v !== null) {
          const x = globalIdxToX(g);
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

    if (indicators.showEMA20) drawEma(ema20, '#06b6d4', 1.5); // Cyan
    if (indicators.showEMA50) drawEma(ema50, '#f97316', 1.5); // Orange
    if (indicators.showEMA200) drawEma(ema200, '#a855f7', 1.8); // Purple

    // 5. Draw Volume bars at bottom of main chart
    if (indicators.showVolume && maxVolume > 0) {
      const volHeightMax = mainHeight * 0.16;
      for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
        const c = candles[g];
        if (!c) continue;
        const isGreen = c.close >= c.open;
        const xCenter = globalIdxToX(g);
        const xLeft = xCenter - barWidth / 2;
        const h = (c.volume / maxVolume) * volHeightMax;
        const y = mainHeight - h;

        ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(xLeft, y, barWidth, h);
      }
    }

    // 6. Draw Candlesticks (Wicks and Bodies)
    for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
      const c = candles[g];
      if (!c) continue;
      const isGreen = c.close >= c.open;
      const xCenter = globalIdxToX(g);
      const xLeft = xCenter - barWidth / 2;

      const yOpen = priceToY(c.open);
      const yClose = priceToY(c.close);
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);

      const color = isGreen ? '#10b981' : '#ef4444';

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.moveTo(xCenter, yHigh);
      ctx.lineTo(xCenter, yLow);
      ctx.stroke();

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

    // 8. Render Sub-Chart: RSI (14)
    if (hasRSI && subHeight > 20) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, subTop - 5);
      ctx.lineTo(chartWidth, subTop - 5);
      ctx.stroke();

      const rsiToY = (val: number) => subTop + (1 - val / 100) * subHeight;
      const y70 = rsiToY(70);
      const y50 = rsiToY(50);
      const y30 = rsiToY(30);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.03)';
      ctx.fillRect(0, y70, chartWidth, y30 - y70);

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([2, 3]);
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.moveTo(0, y50);
      ctx.lineTo(chartWidth, y50);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Line
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      let firstRsi = true;
      for (let g = firstGlobalIdx; g <= lastGlobalIdx; g++) {
        const val = rsi[g];
        if (val !== null && val !== undefined) {
          const x = globalIdxToX(g);
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

      const latestVisibleRsi = rsi[Math.min(candles.length - 1, Math.max(0, lastGlobalIdx))];
      ctx.fillStyle = '#c084fc';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(
        `RSI (14): ${latestVisibleRsi ? latestVisibleRsi.toFixed(1) : '--'}`,
        8,
        subTop + 14
      );
    }

    // 8b. Draw Bottom Time Axis Labels
    const timeAxisY = height - 4;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const timeTickStep = Math.max(1, Math.floor(visibleCount / 6));
    const startTick = Math.ceil(firstGlobalIdx / timeTickStep) * timeTickStep;
    for (let g = startTick; g <= lastGlobalIdx; g += timeTickStep) {
      const c = candles[g];
      if (!c) continue;
      const x = globalIdxToX(g);
      if (x < 25 || x > chartWidth - 25) continue;
      const label =
        timeframe === '1D'
          ? new Date(c.time).toLocaleDateString([], { month: 'short', day: 'numeric' })
          : new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(label, x, timeAxisY);
    }
    ctx.textAlign = 'left';

    // Restore clip so right-axis badges can draw outside chartWidth
    ctx.restore();

    // Right-axis badges (Current Price & RSI 70/50/30)
    if (currentY >= 10 && currentY <= mainHeight) {
      ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
      ctx.fillRect(chartWidth + 2, currentY - 9, rightPriceBarWidth - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(currentPrice.toFixed(asset.precision), chartWidth + 7, currentY + 4);
    }

    if (hasRSI && subHeight > 20) {
      const rsiToY = (val: number) => subTop + (1 - val / 100) * subHeight;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('70', chartWidth + 6, rsiToY(70) + 3);
      ctx.fillText('50', chartWidth + 6, rsiToY(50) + 3);
      ctx.fillText('30', chartWidth + 6, rsiToY(30) + 3);
    }

    // 9. Interactive Crosshair & Tooltip
    if (hoverIndex !== null && hoverCoord && hoverIndex >= 0 && hoverIndex < candles.length) {
      const activeCandle = candles[hoverIndex];
      const hx = globalIdxToX(hoverIndex);
      const hy = hoverCoord.y;

      if (hx >= 0 && hx <= chartWidth) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(hx, 0);
        ctx.lineTo(hx, height);
        ctx.stroke();

        if (hy <= mainHeight) {
          ctx.beginPath();
          ctx.moveTo(0, hy);
          ctx.lineTo(chartWidth, hy);
          ctx.stroke();

          const cursorPrice =
            minPrice + ((mainHeight - 15 - hy) / (mainHeight - 30)) * priceRange;
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
    effectiveVisibleCount,
    clampedPanOffset,
    timeframe,
  ]);

  // Redraw on window resize or data update
  useEffect(() => {
    renderChart();
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  // Global window mousemove & mouseup listeners while dragging so cursor leaving canvas never breaks panning
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.active || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const chartWidth = Math.max(100, rect.width - 68);
      const candleWidth = chartWidth / effectiveVisibleCount;

      const deltaX = e.clientX - dragStateRef.current.startX;
      // Use floating-point candle delta for silky-smooth pixel panning
      const candlesDelta = deltaX / candleWidth;
      const nextOffset = Math.max(
        minPanOffset,
        Math.min(maxPanOffset, dragStateRef.current.startPanOffset + candlesDelta)
      );
      setPanOffset(nextOffset);
    };

    const handleWindowMouseUp = () => {
      dragStateRef.current.active = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, effectiveVisibleCount, minPanOffset, maxPanOffset]);

  // Attach native non-passive wheel listener on canvas for smooth Mouse Wheel Zoom In/Out & Horizontal Pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Shift+Wheel or horizontal trackpad gesture pans left/right
      if (e.shiftKey || (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2)) {
        const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const candlesMoved = -(rawDelta / 18);
        setPanOffset((prev) => Math.max(minPanOffset, Math.min(maxPanOffset, prev + candlesMoved)));
        return;
      }

      if (e.deltaY < 0) {
        setVisibleCandleCount((prev) => Math.max(MIN_VISIBLE_CANDLES, Math.round(prev * 0.86)));
      } else if (e.deltaY > 0) {
        setVisibleCandleCount((prev) =>
          Math.min(
            Math.max(MIN_VISIBLE_CANDLES, candles.length),
            MAX_VISIBLE_CANDLES,
            Math.round(prev * 1.16)
          )
        );
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [candles.length, minPanOffset, maxPanOffset]);

  // Mouse Down -> Start dragging to pan left/right
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    dragStateRef.current.active = true;
    dragStateRef.current.startX = e.clientX;
    dragStateRef.current.startPanOffset = clampedPanOffset;
    setIsDragging(true);
  };

  // Mouse Move on canvas -> Update crosshair when hovering
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !containerRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rightPriceBarWidth = 68;
    const chartWidth = Math.max(100, rect.width - rightPriceBarWidth);
    const candleWidth = chartWidth / effectiveVisibleCount;
    const baseStart = candles.length - effectiveVisibleCount - clampedPanOffset;

    const globalIndex = Math.round(baseStart + x / candleWidth - 0.5);
    if (x >= 0 && x <= chartWidth && globalIndex >= 0 && globalIndex < candles.length) {
      setHoverIndex(globalIndex);
      setHoverCoord({ x, y });
    } else {
      setHoverIndex(null);
      setHoverCoord(null);
    }
  };

  const handleMouseUp = () => {
    dragStateRef.current.active = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverCoord(null);
  };

  // Touch handlers for Mobile Drag Panning & Two-Finger Pinch Zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      dragStateRef.current.active = true;
      dragStateRef.current.startX = e.touches[0].clientX;
      dragStateRef.current.startPanOffset = clampedPanOffset;
      dragStateRef.current.pinchStartDist = null;
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      dragStateRef.current.active = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dragStateRef.current.pinchStartDist = Math.hypot(dx, dy);
      dragStateRef.current.pinchStartVisible = visibleCandleCount;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const chartWidth = Math.max(100, rect.width - 68);
    const candleWidth = chartWidth / effectiveVisibleCount;

    if (e.touches.length === 2 && dragStateRef.current.pinchStartDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        const scale = dragStateRef.current.pinchStartDist / dist;
        const nextCount = Math.round(dragStateRef.current.pinchStartVisible * scale);
        setVisibleCandleCount(
          Math.max(
            MIN_VISIBLE_CANDLES,
            Math.min(Math.max(MIN_VISIBLE_CANDLES, candles.length), MAX_VISIBLE_CANDLES, nextCount)
          )
        );
      }
    } else if (e.touches.length === 1 && dragStateRef.current.active) {
      const deltaX = e.touches[0].clientX - dragStateRef.current.startX;
      const candlesDelta = deltaX / candleWidth;
      const nextOffset = Math.max(
        minPanOffset,
        Math.min(maxPanOffset, dragStateRef.current.startPanOffset + candlesDelta)
      );
      setPanOffset(nextOffset);
    }
  };

  const handleTouchEnd = () => {
    dragStateRef.current.active = false;
    dragStateRef.current.pinchStartDist = null;
    setIsDragging(false);
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
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors border cursor-pointer ${
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
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
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
          <div className="relative" ref={indicatorMenuRef}>
            <button
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span>{t('indicators')}</span>
            </button>

            {showIndicatorMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl p-2 z-50 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800">
                  {t('technicalIndicators')}
                </div>
                <div className="flex flex-col gap-1 mt-1.5">
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
                      {language === 'bn' ? 'EMA 20 (মোমেন্টাম)' : 'EMA 20 (Momentum)'}
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
                      {language === 'bn' ? 'EMA 50 (ট্রেন্ড)' : 'EMA 50 (Trend)'}
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
                      {language === 'bn' ? 'EMA 200 (ম্যাক্রো)' : 'EMA 200 (Macro Trend)'}
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
                      {language === 'bn' ? 'সাপোর্ট ও রেজিস্ট্যান্স' : 'Support & Resistance'}
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
                      {language === 'bn' ? 'ভলিউম বার (Volume)' : 'Volume Bars'}
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
      <div ref={containerRef} className="relative flex-1 w-full h-[440px] min-h-[360px] select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`absolute inset-0 block touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        />

        {/* Quick-Trade Entry Shortcuts floating in bottom-left corner */}
        {onSelectPriceForOrder && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-lg border border-slate-800 text-xs z-10">
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              {t('currentPrice')}:
            </span>
            <button
              onClick={() => onSelectPriceForOrder(currentPrice, 'LONG')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
            >
              {t('buyAtCurrent')} (${currentPrice.toFixed(asset.precision)})
            </button>
            <button
              onClick={() => onSelectPriceForOrder(currentPrice, 'SHORT')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
            >
              {t('sellAtCurrent')} (${currentPrice.toFixed(asset.precision)})
            </button>
          </div>
        )}
      </div>

      {/* Dedicated Interactive Timeline Pan & Zoom Bar (আগে-পিছনে ও জুম কন্ট্রোল বার) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0f172a] border-t border-slate-800 text-xs select-none">
        {/* Left: Pan Backward / Forward Buttons & Timeline Slider */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <button
            type="button"
            onClick={handlePanLeft}
            disabled={clampedPanOffset >= maxPanOffset}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-semibold rounded border border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'bn' ? 'পিছে (পুরনো)' : 'Back'}</span>
          </button>

          {/* Timeline Scrubber Slider (Left = Oldest history, Right = Latest/Future) */}
          <div className="flex-1 flex items-center gap-2 px-1">
            <input
              type="range"
              min={-maxPanOffset}
              max={-minPanOffset}
              step={1}
              value={Math.round(-clampedPanOffset)}
              onChange={(e) => setPanOffset(-parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={
                language === 'bn'
                  ? 'স্লাইডার টেনে চার্ট আগে বা পিছনে নিন'
                  : 'Drag slider to scrub chart backward or forward'
              }
            />
          </div>

          <button
            type="button"
            onClick={handlePanRight}
            disabled={clampedPanOffset <= minPanOffset}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-semibold rounded border border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <span>{language === 'bn' ? 'সামনে (নতুন)' : 'Forward'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Right: Zoom Out / Zoom In & Reset to Live Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={visibleCandleCount >= Math.min(MAX_VISIBLE_CANDLES, candles.length)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded border border-slate-700 transition-colors cursor-pointer"
            title={language === 'bn' ? 'জুম আউট' : 'Zoom Out'}
          >
            <ZoomOut className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'bn' ? 'জুম -' : 'Zoom -'}</span>
          </button>

          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-cyan-400 font-bold">
            {effectiveVisibleCount} {language === 'bn' ? 'ক্যান্ডেল' : 'bars'}
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={visibleCandleCount <= MIN_VISIBLE_CANDLES}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded border border-slate-700 transition-colors cursor-pointer"
            title={language === 'bn' ? 'জুম ইন' : 'Zoom In'}
          >
            <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{language === 'bn' ? 'জুম +' : 'Zoom +'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
              Math.abs(clampedPanOffset) > 0.5 || visibleCandleCount !== DEFAULT_VISIBLE_CANDLES
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title={language === 'bn' ? 'লাইভ চার্টে রিসেট করুন' : 'Reset to Live Chart'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'bn' ? 'লাইভ রিসেট' : 'Reset'}</span>
          </button>
        </div>
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
