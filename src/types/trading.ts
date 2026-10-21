export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type AssetCategory = 'crypto' | 'forex' | 'stock';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  nameBn: string;
  category: AssetCategory;
  basePrice: number;
  precision: number;
  minQty: number;
  leverageMax: number;
  localizedNames?: Record<string, string>;
}

export interface IndicatorSettings {
  showEMA20: boolean;
  showEMA50: boolean;
  showEMA200: boolean;
  showBollinger: boolean;
  showRSI: boolean;
  showVolume: boolean;
  showKeyLevels: boolean;
}

export type OrderSide = 'LONG' | 'SHORT';

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  currentPrice: number;
  size: number;
  margin: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  openTime: number;
}

export interface TradeHistory {
  id: string;
  assetId: string;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  closeTime: number;
  reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL';
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  titleBn: string;
  readTime: string;
  summary: string;
  summaryBn: string;
  content: string; // English / Default
  contentBn: string; // Bengali
  keyTakeaways: string[];
  keyTakeawaysBn?: string[];
}

export interface LessonModule {
  id: string;
  number: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionBn: string;
  questionEn: string;
  options: string[];
  optionsEn: string[];
  correctIndex: number;
  explanation: string;
  explanationBn: string;
  explanationEn: string;
}

export interface PatternItem {
  id: string;
  name: string;
  nameBn: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  category: 'CANDLESTICK' | 'CHART_PATTERN';
  reliability: 'HIGH' | 'MEDIUM';
  winRateEst: string;
  description: string;
  descriptionBn: string;
  entryRule: string;
  entryRuleBn: string;
  stopLossRule: string;
  stopLossRuleBn: string;
  targetRule: string;
  targetRuleBn: string;
  svgType: string;
}
