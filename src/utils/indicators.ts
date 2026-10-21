import { Candle } from '../types/trading';

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length < period) return result;

  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result[i] = ema;
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI) with 14-period standard
 */
export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const currentGain = change >= 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const currentRS = avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + currentRS);
    }
  }

  return result;
}

/**
 * Calculate Bollinger Bands (period 20, multiplier 2)
 */
export interface BollingerBandsResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsResult {
  const upper: (number | null)[] = new Array(candles.length).fill(null);
  const middle: (number | null)[] = new Array(candles.length).fill(null);
  const lower: (number | null)[] = new Array(candles.length).fill(null);

  if (candles.length < period) {
    return { upper, middle, lower };
  }

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const sma = sum / period;
    middle[i] = sma;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    upper[i] = sma + stdDevMultiplier * stdDev;
    lower[i] = sma - stdDevMultiplier * stdDev;
  }

  return { upper, middle, lower };
}

/**
 * Identify Key Support & Resistance Price Levels from local pivots
 */
export interface KeyLevel {
  price: number;
  type: 'SUPPORT' | 'RESISTANCE';
  strength: number; // 1 to 5
}

export function detectKeyLevels(candles: Candle[], tolerancePercent: number = 0.008): KeyLevel[] {
  if (candles.length < 15) return [];

  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];

  // Window of 4 candles on each side
  const window = 4;
  for (let i = window; i < candles.length - window; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - window; j <= i + window; j++) {
      if (j === i) continue;
      if (candles[j].high > candles[i].high) isHigh = false;
      if (candles[j].low < candles[i].low) isLow = false;
    }
    if (isHigh) pivotHighs.push(candles[i].high);
    if (isLow) pivotLows.push(candles[i].low);
  }

  const clusters: { sum: number; count: number; type: 'SUPPORT' | 'RESISTANCE' }[] = [];

  const clusterPoints = (points: number[], type: 'SUPPORT' | 'RESISTANCE') => {
    for (const p of points) {
      let matched = false;
      for (const c of clusters) {
        if (c.type !== type) continue;
        const avg = c.sum / c.count;
        if (Math.abs(p - avg) / avg < tolerancePercent) {
          c.sum += p;
          c.count += 1;
          matched = true;
          break;
        }
      }
      if (!matched) {
        clusters.push({ sum: p, count: 1, type });
      }
    }
  };

  clusterPoints(pivotHighs, 'RESISTANCE');
  clusterPoints(pivotLows, 'SUPPORT');

  // Filter significant levels (or fallback to top pivots if few clusters)
  const strongClusters = clusters.filter((c) => c.count >= 2);
  const sourceClusters = strongClusters.length >= 2 ? strongClusters : clusters;

  const supports = sourceClusters
    .filter((c) => c.type === 'SUPPORT')
    .slice(-2)
    .map((c) => ({
      price: c.sum / c.count,
      type: c.type,
      strength: Math.min(5, c.count),
    }));

  const resistances = sourceClusters
    .filter((c) => c.type === 'RESISTANCE')
    .slice(-2)
    .map((c) => ({
      price: c.sum / c.count,
      type: c.type,
      strength: Math.min(5, c.count),
    }));

  return [...supports, ...resistances];
}
