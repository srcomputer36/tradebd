import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Asset } from '../../types/trading';
import { TRADING_ASSETS } from '../../data/assets';
import {
  Calendar,
  Clock,
  Newspaper,
  Flame,
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Activity,
  Zap,
  ShieldAlert,
  Info,
  RefreshCw,
} from 'lucide-react';

interface MarketIntelViewProps {
  onSelectAssetAndGoToChart?: (asset: Asset) => void;
  onSimulateVolatilitySpike?: (asset: Asset, direction: 'BULLISH' | 'BEARISH') => void;
}

export interface TradingSessionInfo {
  id: 'sydney' | 'tokyo' | 'london' | 'newyork';
  nameEn: string;
  nameBn: string;
  cityEn: string;
  cityBn: string;
  flag: string;
  openUtcHour: number; // 0-23
  closeUtcHour: number; // 0-23
  openBstLabel: string;
  closeBstLabel: string;
  openBstLabelEn: string;
  closeBstLabelEn: string;
  volatility: 'HIGH' | 'VERY_HIGH' | 'MEDIUM';
  bestPairs: string[];
  characteristicsEn: string;
  characteristicsBn: string;
  strategyTipEn: string;
  strategyTipBn: string;
  accentColor: string;
}

export const GLOBAL_SESSIONS: TradingSessionInfo[] = [
  {
    id: 'sydney',
    nameEn: 'Sydney Session (Pacific)',
    nameBn: 'সিডনি সেশন (প্যাসিফিক)',
    cityEn: 'Sydney, Australia',
    cityBn: 'সিডনি, অস্ট্রেলিয়া',
    flag: '🇦🇺',
    openUtcHour: 22,
    closeUtcHour: 7,
    openBstLabel: 'ভোর ৪:০০ AM',
    closeBstLabel: 'দুপুর ১:০০ PM',
    openBstLabelEn: '04:00 AM',
    closeBstLabelEn: '01:00 PM',
    volatility: 'MEDIUM',
    bestPairs: ['AUD/USD', 'USD/JPY', 'EUR/USD'],
    characteristicsEn:
      'Marks the official start of the weekly forex market. Lower liquidity compared to London/NY, ideal for range-bound strategies.',
    characteristicsBn:
      'ফরেক্স মার্কেটের দিনের প্রথম সেশন। লন্ডন বা নিউ ইয়র্কের তুলনায় ভোলাটিলিটি কিছুটা কম থাকে, তবে রেঞ্জ ট্রেডিংয়ের জন্য উপযুক্ত।',
    strategyTipEn:
      'Focus on AUD & JPY pairs and support/resistance bounce setups rather than aggressive breakouts.',
    strategyTipBn:
      'বড় ব্রেকআউটের চেয়ে সাপোর্ট ও রেজিস্ট্যান্স বাউন্স ট্রেডিং এবং AUD/USD পেয়ারে ট্রেড করা নিরাপদ।',
    accentColor: 'cyan',
  },
  {
    id: 'tokyo',
    nameEn: 'Tokyo Session (Asian)',
    nameBn: 'টোকিও সেশন (এশিয়ান)',
    cityEn: 'Tokyo, Japan & Singapore',
    cityBn: 'টোকিও, জাপান ও সিঙ্গাপুর',
    flag: '🇯🇵',
    openUtcHour: 0,
    closeUtcHour: 9,
    openBstLabel: 'সকাল ৬:০০ AM',
    closeBstLabel: 'দুপুর ৩:০০ PM',
    openBstLabelEn: '06:00 AM',
    closeBstLabelEn: '03:00 PM',
    volatility: 'MEDIUM',
    bestPairs: ['USD/JPY', 'AUD/USD', 'BTC/USDT', 'ETH/USDT'],
    characteristicsEn:
      'Driven by Bank of Japan policy, Asian central banks, and Japanese exporters. Forms the Asian consolidation box often swept during London Open.',
    characteristicsBn:
      'ব্যাংক অফ জাপান (BOJ) ও এশীয় বাজারের লেনদেন এই সময়ে সবচেয়ে বেশি হয়। এই সেশনের হাই এবং লো (Asian Range) লন্ডন সেশনের ব্রেকআউট ট্রেডারদের প্রধান টার্গেট থাকে।',
    strategyTipEn:
      'Mark the Asian Session High and Low between 6:00 AM – 1:30 PM BST to prepare for the London Open breakout.',
    strategyTipBn:
      'সকাল ৬টা থেকে দুপুর ১:৩০ পর্যন্ত এশিয়ান হাই ও লো মার্ক করে রাখুন—লন্ডন ওপেনে এই লেভেল ব্রেক হলে দারুণ এন্ট্রি পাওয়া যায়।',
    accentColor: 'amber',
  },
  {
    id: 'london',
    nameEn: 'London Session (European)',
    nameBn: 'লন্ডন সেশন (ইউরোপিয়ান)',
    cityEn: 'London, UK & Frankfurt',
    cityBn: 'লন্ডন, যুক্তরাজ্য ও ফ্রাঙ্কফুর্ট',
    flag: '🇬🇧',
    openUtcHour: 8,
    closeUtcHour: 17,
    openBstLabel: 'দুপুর ২:০০ PM',
    closeBstLabel: 'রাত ১১:০০ PM',
    openBstLabelEn: '02:00 PM',
    closeBstLabelEn: '11:00 PM',
    volatility: 'VERY_HIGH',
    bestPairs: ['EUR/USD', 'GBP/USD', 'USD/CHF', 'BTC/USDT'],
    characteristicsEn:
      'The largest forex clearing hub in the world (~38% of global volume). Strong trends, liquidity sweeps, and major breakouts begin at 2:00 PM BST.',
    characteristicsBn:
      'বিশ্বের সবচেয়ে বড় ফরেক্স সেশন (মোট লেনদেনের প্রায় ৩৮%)। বাংলাদেশ সময় দুপুর ২:০০টায় শুরু হওয়ার সাথে সাথেই মার্কেটে তীব্র মুভমেন্ট ও ট্রেন্ড তৈরি হয়।',
    strategyTipEn:
      'Watch for fakeouts (Judas Swing) in the first 30 minutes (2:00 PM – 2:30 PM BST), then trade in the direction of the true trend.',
    strategyTipBn:
      'দুপুর ২:০০টা থেকে ২:৩০ পর্যন্ত প্রথম ৩০ মিনিট ফেকআউট (Liquidity Sweep) হতে পারে; ক্যান্ডেল ক্লোজ হওয়া দেখে ট্রেন্ডের দিকে এন্ট্রি নিন।',
    accentColor: 'emerald',
  },
  {
    id: 'newyork',
    nameEn: 'New York Session (North American)',
    nameBn: 'নিউ ইয়র্ক সেশন (আমেরিকান)',
    cityEn: 'New York, USA',
    cityBn: 'নিউ ইয়র্ক, যুক্তরাষ্ট্র',
    flag: '🇺🇸',
    openUtcHour: 13,
    closeUtcHour: 22,
    openBstLabel: 'সন্ধ্যা ৭:০০ PM',
    closeBstLabel: 'ভোর ৪:০০ AM',
    openBstLabelEn: '07:00 PM',
    closeBstLabelEn: '04:00 AM',
    volatility: 'VERY_HIGH',
    bestPairs: ['EUR/USD', 'GBP/USD', 'USD/CAD', 'BTC/USDT', 'SOL/USDT'],
    characteristicsEn:
      'Heavily influenced by US Economic Data releases (6:30 PM / 7:30 PM BST) and Wall Street equity flows. Huge volatility during the first 4 hours.',
    characteristicsBn:
      'মার্কিন ডলার (USD) সব মেজর পেয়ারের সাথে যুক্ত থাকায় সন্ধ্যা ৭:০০টায় নিউ ইয়র্ক সেশন শুরু হলে ফরেক্স ও ক্রিপ্টো উভয় মার্কেটেই সবচেয়ে বড় মুভমেন্ট দেখা যায়।',
    strategyTipEn:
      'Check high-impact USD news at 6:30 PM – 8:00 PM BST before opening high-leverage trades.',
    strategyTipBn:
      'সন্ধ্যা ৬:৩০ থেকে রাত ৮:০০টার মধ্যে গুরুত্বপূর্ণ USD নিউজ (NFP, CPI) প্রকাশ পায়—এই সময় স্টপ-লস ছাড়া ট্রেড করবেন না।',
    accentColor: 'rose',
  },
];

export interface EconomicEventItem {
  id: string;
  dayCategory: 'TODAY' | 'TOMORROW' | 'THIS_WEEK';
  dateLabelBn: string;
  dateLabelEn: string;
  timeBst: string;
  timeUtc: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CRYPTO';
  flag: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  titleEn: string;
  titleBn: string;
  previous: string;
  forecast: string;
  actual?: string;
  status: 'RELEASED' | 'UPCOMING';
  effectDirection?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  affectedPairSymbol: string;
  explanationEn: string;
  explanationBn: string;
  tradingRuleEn: string;
  tradingRuleBn: string;
}

export const ECONOMIC_CALENDAR_EVENTS: EconomicEventItem[] = [
  {
    id: 'evt-1',
    dayCategory: 'TODAY',
    dateLabelBn: 'আজ',
    dateLabelEn: 'Today',
    timeBst: '02:00 PM',
    timeUtc: '08:00 UTC',
    currency: 'GBP',
    flag: '🇬🇧',
    impact: 'HIGH',
    titleEn: 'UK Consumer Price Index (CPI) YoY',
    titleBn: 'যুক্তরাজ্যের মুদ্রাস্ফীতি রিপোর্ট (UK CPI YoY)',
    previous: '2.2%',
    forecast: '2.0%',
    actual: '2.3%',
    status: 'RELEASED',
    effectDirection: 'BULLISH',
    affectedPairSymbol: 'GBP/USD',
    explanationEn:
      'Measures changes in the price of goods and services in the UK. Higher-than-expected inflation pressures the Bank of England to keep interest rates high, strengthening GBP.',
    explanationBn:
      'যুক্তরাজ্যের পণ্য ও সেবার মূল্যবৃদ্ধির হার নির্দেশ করে। পূর্বাভাসের (Forecast) চেয়ে প্রকৃত ফলাফল (Actual) বেশি আসলে ব্যাংক অফ ইংল্যান্ড সুদের হার কমায় না, ফলে পাউন্ড (GBP/USD) শক্তিশালী হয়।',
    tradingRuleEn:
      'Actual > Forecast = Bullish for GBP/USD. Actual < Forecast = Bearish for GBP/USD.',
    tradingRuleBn:
      'Actual যদি Forecast-এর চেয়ে বেশি হয় তবে GBP/USD বাই (Long) সেটআপ এবং কম হলে সেল (Short) সেটআপ খুঁজুন।',
  },
  {
    id: 'evt-2',
    dayCategory: 'TODAY',
    dateLabelBn: 'আজ',
    dateLabelEn: 'Today',
    timeBst: '06:30 PM',
    timeUtc: '12:30 UTC',
    currency: 'USD',
    flag: '🇺🇸',
    impact: 'HIGH',
    titleEn: 'US Core CPI Inflation Rate (MoM)',
    titleBn: 'যুক্তরাষ্ট্রের কোর মুদ্রাস্ফীতি হার (US Core CPI MoM)',
    previous: '0.2%',
    forecast: '0.3%',
    status: 'UPCOMING',
    effectDirection: 'BULLISH',
    affectedPairSymbol: 'EUR/USD',
    explanationEn:
      'The Federal Reserve’s primary inflation gauge. A hot CPI print boosts the US Dollar (DXY) and pushes EUR/USD, GBP/USD, and BTC/USDT downward initially.',
    explanationBn:
      'মার্কিন ফেডারেল রিজার্ভ সুদের হার নির্ধারণের জন্য এই CPI ডাটা সবচেয়ে গুরুত্ব সহকারে দেখে। মুদ্রাস্ফীতি বাড়লে USD শক্তিশালী হয় এবং বিপরীতে EUR/USD ও BTC/USDT নিচে নামতে পারে।',
    tradingRuleEn:
      'Avoid opening tight stop-loss orders 15 minutes before 6:30 PM BST. Wait for the first 15m candle close after release.',
    tradingRuleBn:
      'সন্ধ্যা ৬:৩০টার ১৫ মিনিট আগে নতুন এন্ট্রি নেওয়া থেকে বিরত থাকুন। নিউজ প্রকাশের পর প্রথম ১৫ মিনিটের ক্যান্ডেল ক্লোজ হলে সাপোর্ট/রেজিস্ট্যান্স দেখে ট্রেড নিন।',
  },
  {
    id: 'evt-3',
    dayCategory: 'TODAY',
    dateLabelBn: 'আজ',
    dateLabelEn: 'Today',
    timeBst: '06:30 PM',
    timeUtc: '12:30 UTC',
    currency: 'USD',
    flag: '🇺🇸',
    impact: 'MEDIUM',
    titleEn: 'US Initial Jobless Claims',
    titleBn: 'যুক্তরাষ্ট্রের সাপ্তাহিক বেকারত্বের দাবি (Jobless Claims)',
    previous: '241K',
    forecast: '240K',
    status: 'UPCOMING',
    effectDirection: 'NEUTRAL',
    affectedPairSymbol: 'USD/JPY',
    explanationEn:
      'Measures the number of individuals filing for unemployment insurance for the first time during the past week.',
    explanationBn:
      'গত সপ্তাহে যুক্তরাষ্ট্রে কতজন মানুষ নতুন করে বেকার ভাতার আবেদন করেছেন তা প্রকাশ করে। সংখ্যাটি কম আসলে মার্কিন অর্থনীতি শক্তিশালী ধরা হয় (USD Bullish)।',
    tradingRuleEn:
      'Lower than 235K = Bullish USD/JPY. Higher than 250K = Bearish USD/JPY.',
    tradingRuleBn:
      'Forecast-এর চেয়ে কম মানুষ বেকার হলে USD/JPY উপরে যাওয়ার সম্ভাবনা বাড়ে।',
  },
  {
    id: 'evt-4',
    dayCategory: 'TODAY',
    dateLabelBn: 'আজ',
    dateLabelEn: 'Today',
    timeBst: '08:00 PM',
    timeUtc: '14:00 UTC',
    currency: 'CRYPTO',
    flag: '₿',
    impact: 'HIGH',
    titleEn: 'US Spot Bitcoin & Ethereum ETF Net Inflow Report',
    titleBn: 'স্পট বিটকয়েনে প্রাতিষ্ঠানিক ETF ইনফ্লো রিপোর্ট',
    previous: '+$378M',
    forecast: '+$410M',
    status: 'UPCOMING',
    effectDirection: 'BULLISH',
    affectedPairSymbol: 'BTC/USDT',
    explanationEn:
      'Tracks daily institutional buying and selling across BlackRock, Fidelity, and Ark Spot ETFs during the New York session.',
    explanationBn:
      'ব্ল্যাকরক (BlackRock) ও ফিডেলিটির মতো বড় প্রতিষ্ঠানগুলো প্রতিদিন কী পরিমাণ বিটকয়েন ও ইথেরিয়াম কিনছে তা নির্দেশ করে। পজিটিভ ইনফ্লো ক্রিপ্টো মার্কেটে শক্তিশালী বুলিশ মুভমেন্ট তৈরি করে।',
    tradingRuleEn:
      'Strong net inflows (> $300M) support BTC/USDT and ETH/USDT breakouts during the NY session.',
    tradingRuleBn:
      'ইনফ্লো +$300M এর বেশি হলে নিউ ইয়র্ক সেশনে BTC/USDT ও ETH/USDT-তে বুলিশ ব্রেকআউট ট্রেড প্রাধান্য দিন।',
  },
  {
    id: 'evt-5',
    dayCategory: 'TOMORROW',
    dateLabelBn: 'আগামীকাল',
    dateLabelEn: 'Tomorrow',
    timeBst: '06:15 PM',
    timeUtc: '12:15 UTC',
    currency: 'EUR',
    flag: '🇪🇺',
    impact: 'HIGH',
    titleEn: 'ECB Main Refinancing Rate Decision',
    titleBn: 'ইউরোপীয় কেন্দ্রীয় ব্যাংকের সুদের হার ঘোষণা (ECB Rate)',
    previous: '3.40%',
    forecast: '3.15%',
    status: 'UPCOMING',
    effectDirection: 'BEARISH',
    affectedPairSymbol: 'EUR/USD',
    explanationEn:
      'The European Central Bank decides on interest rates for the Eurozone. A rate cut typically weakens the Euro unless accompanied by hawkish guidance.',
    explanationBn:
      'ইউরোপীয় কেন্দ্রীয় ব্যাংক (ECB) সুদের হার কমালে ইউরো (EUR/USD) দুর্বল হতে পারে, আর সুদের হার অপরিবর্তিত রাখলে ইউরো শক্তিশালী হয়।',
    tradingRuleEn:
      'Watch the ECB Press Conference 30 minutes after the rate decision at 6:45 PM BST for major EUR/USD trend continuation.',
    tradingRuleBn:
      'সন্ধ্যা ৬:১৫-তে রেট ঘোষণার পর ৬:৪৫-এ প্রেস কনফারেন্স চলাকালীন EUR/USD পেয়ারে সবচেয়ে বড় ট্রেন্ড তৈরি হয়।',
  },
  {
    id: 'evt-6',
    dayCategory: 'TOMORROW',
    dateLabelBn: 'আগামীকাল',
    dateLabelEn: 'Tomorrow',
    timeBst: '06:30 PM',
    timeUtc: '12:30 UTC',
    currency: 'USD',
    flag: '🇺🇸',
    impact: 'HIGH',
    titleEn: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
    titleBn: 'যুক্তরাষ্ট্রের নন-ফার্ম পে-রোল (NFP) ও বেকারত্বের হার',
    previous: '254K',
    forecast: '185K',
    status: 'UPCOMING',
    effectDirection: 'BULLISH',
    affectedPairSymbol: 'EUR/USD',
    explanationEn:
      'The single most volatile monthly economic report in Forex & Crypto. Measures new jobs created in the US outside the farming sector.',
    explanationBn:
      'ফরেক্স ও ক্রিপ্টো মার্কেটের সবচেয়ে শক্তিশালী মাসিক নিউজ। যুক্তরাষ্ট্রে নতুন কর্মসংস্থান পূর্বাভাসের চেয়ে বেশি হলে ডলার (USD) মুহূর্তেই ১০০+ পিপস মুভ করতে পারে।',
    tradingRuleEn:
      'Spreads widen during NFP release. Wait 15-30 minutes after 6:30 PM BST for market structure to settle before entering.',
    tradingRuleBn:
      'NFP প্রকাশের মুহূর্তে ক্যান্ডেল উভয় দিকেই বড় উইক (Wick) তৈরি করে স্টপ-লস হিট করাতে পারে। তাই নিউজ প্রকাশের অন্তত ১৫-৩০ মিনিট পর ট্রেন্ড স্থির হলে ট্রেড নিন।',
  },
  {
    id: 'evt-7',
    dayCategory: 'THIS_WEEK',
    dateLabelBn: 'এই সপ্তাহ',
    dateLabelEn: 'This Week',
    timeBst: '09:00 AM',
    timeUtc: '03:00 UTC',
    currency: 'JPY',
    flag: '🇯🇵',
    impact: 'HIGH',
    titleEn: 'Bank of Japan (BOJ) Monetary Policy Statement',
    titleBn: 'ব্যাংক অফ জাপান (BOJ) মুদ্রানীতি ও সুদের হার ঘোষণা',
    previous: '0.25%',
    forecast: '0.25%',
    status: 'UPCOMING',
    effectDirection: 'BULLISH',
    affectedPairSymbol: 'USD/JPY',
    explanationEn:
      'Any hint of a rate hike or currency intervention by the Bank of Japan causes sharp drops in USD/JPY (strengthening the Yen).',
    explanationBn:
      'ব্যাংক অফ জাপান সুদের হার বাড়ানোর ইঙ্গিত দিলে জাপানি ইয়েন (JPY) শক্তিশালী হয় এবং USD/JPY পেয়ার দ্রুত নিচে নামে।',
    tradingRuleEn:
      'High volatility expected during the Tokyo session on USD/JPY.',
    tradingRuleBn:
      'টোকিও সেশনে USD/JPY ট্রেড করার সময় এই নিউজের দিকে বিশেষ নজর রাখুন।',
  },
  {
    id: 'evt-8',
    dayCategory: 'THIS_WEEK',
    dateLabelBn: 'এই সপ্তাহ',
    dateLabelEn: 'This Week',
    timeBst: '12:00 AM',
    timeUtc: '18:00 UTC',
    currency: 'USD',
    flag: '🇺🇸',
    impact: 'HIGH',
    titleEn: 'FOMC Interest Rate Decision & Fed Chair Powell Speech',
    titleBn: 'ফেডারেল রিজার্ভ (FOMC) সুদের হার ও জেরোম পাওয়েলের বক্তব্য',
    previous: '5.00%',
    forecast: '4.75%',
    status: 'UPCOMING',
    effectDirection: 'BULLISH',
    affectedPairSymbol: 'BTC/USDT',
    explanationEn:
      'Federal Reserve interest rate cuts inject liquidity into global financial markets, typically acting as a major catalyst for Bitcoin, Crypto, and EUR/USD.',
    explanationBn:
      'ফেডারেল রিজার্ভ সুদের হার কমালে (Rate Cut) গ্লোবাল মার্কেটে তারল্য বৃদ্ধি পায়, যা বিটকয়েন (BTC/USDT) এবং EUR/USD-এর জন্য অত্যন্ত পজিটিভ (Bullish)।',
    tradingRuleEn:
      'Watch both the 12:00 AM BST rate statement and the 12:30 AM BST press conference.',
    tradingRuleBn:
      'রাত ১২:০০টায় রেট ঘোষণার চেয়েও ১২:৩০ মিনিটে ফেড চেয়ারম্যান পাওয়েলের প্রেস কনফারেন্সে মার্কেট বেশি মুভ করে।',
  },
];

export interface MarketNewsItem {
  id: string;
  timeAgoEn: string;
  timeAgoBn: string;
  category: 'FOREX' | 'CRYPTO' | 'MACRO';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact: 'HIGH' | 'MEDIUM';
  headlineEn: string;
  headlineBn: string;
  summaryEn: string;
  summaryBn: string;
  keyTakeawayEn: string;
  keyTakeawayBn: string;
  relatedPairs: string[];
}

export const MARKET_NEWS_ITEMS: MarketNewsItem[] = [
  {
    id: 'news-1',
    timeAgoEn: '18 mins ago',
    timeAgoBn: '১৮ মিনিট আগে',
    category: 'CRYPTO',
    sentiment: 'BULLISH',
    impact: 'HIGH',
    headlineEn: 'Institutional Bitcoin ETFs Record Strong Buying Ahead of US Macro Data',
    headlineBn: 'মার্কিন অর্থনৈতিক ডাটার আগে বিটকয়েন ETF-এ প্রাতিষ্ঠানিক বিনিয়োগকারীদের রেকর্ড কেনাকাটা',
    summaryEn:
      'On-chain data and Wall Street ETF flow trackers show steady accumulation above key EMA-50 support levels as institutional desks position for potential Fed rate easing.',
    summaryBn:
      'অন-চেইন ডাটা এবং ওয়াল স্ট্রিট ETF ট্র্যাকার অনুযায়ী বড় প্রাতিষ্ঠানিক ফান্ডগুলো মূল সাপোর্ট লেভেলের উপরে বিটকয়েন এবং ইথেরিয়াম হোল্ডিং বাড়াচ্ছে। এর ফলে ক্রিপ্টো মার্কেটে বায়ারদের আধিপত্য বজায় রয়েছে।',
    keyTakeawayEn:
      'Key support on BTC/USDT remains strong; dips toward the 20/50 EMA are being bought aggressively during the New York session.',
    keyTakeawayBn:
      'BTC/USDT এবং ETH/USDT-তে মেজর সাপোর্ট লেভেলগুলোতে বায়ারদের চাপ বেশি। নিউ ইয়র্ক সেশনে পুলব্যাক (Pullback) থেকে Long সেটআপ বেশি কার্যকর।',
    relatedPairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  },
  {
    id: 'news-2',
    timeAgoEn: '45 mins ago',
    timeAgoBn: '৪৫ মিনিট আগে',
    category: 'FOREX',
    sentiment: 'BEARISH',
    impact: 'HIGH',
    headlineEn: 'EUR/USD Tests Key Liquidity Zone as Traders Weigh ECB Rate Cut Expectations',
    headlineBn: 'ইসিবি (ECB) সুদের হার কমানোর সম্ভাবনায় গুরুত্বপূর্ণ সাপোর্ট জোনে EUR/USD',
    summaryEn:
      'European bond yields edged lower during the Frankfurt and London open as markets price in a 25 bps rate cut by the European Central Bank, keeping EUR/USD near technical support.',
    summaryBn:
      'ইউরোপীয় কেন্দ্রীয় ব্যাংক (ECB) আগামী মিটিংয়ে সুদের হার ২৫ বেসিস পয়েন্ট কমাতে পারে—এমন পূর্বাভাসে ইউরোর ওপর চাপ সৃষ্টি হয়েছে। লন্ডন সেশনে EUR/USD মেজর সাপোর্ট লেভেল টেস্ট করছে।',
    keyTakeawayEn:
      'Watch for a clean break or rejection around key support on EUR/USD before the 6:30 PM BST US data release.',
    keyTakeawayBn:
      'সন্ধ্যা ৬:৩০টার মার্কিন নিউজের আগে EUR/USD সাপোর্ট লেভেল ধরে রাখতে পারলে বাউন্স করবে, অন্যথায় ব্রেকআউট হয়ে নিচে নামতে পারে।',
    relatedPairs: ['EUR/USD', 'GBP/USD'],
  },
  {
    id: 'news-3',
    timeAgoEn: '1 hour ago',
    timeAgoBn: '১ ঘণ্টা আগে',
    category: 'FOREX',
    sentiment: 'NEUTRAL',
    impact: 'HIGH',
    headlineEn: 'Japanese Finance Ministry Warns Against Excessive Yen Volatility Near Key Levels',
    headlineBn: 'ইয়েনের অতিরিক্ত দরপতন রোধে জাপানের অর্থ মন্ত্রণালয়ের বিশেষ সতর্কবার্তা',
    summaryEn:
      'Japanese officials reiterated that they are closely monitoring FX moves with a high sense of urgency, prompting cautious profit-taking on USD/JPY longs near resistance.',
    summaryBn:
      'জাপানের অর্থ মন্ত্রণালয় জানিয়েছে তারা ফরেক্স মার্কেটে ইয়েনের বিনিময় হারের দিকে কড়া নজর রাখছে। ফলে USD/JPY রেজিস্ট্যান্স লেভেলের কাছে পৌঁছালে বড় ট্রেডাররা প্রফিট বুকিং করছেন।',
    keyTakeawayEn:
      'Be cautious with high-leverage Long positions on USD/JPY right below major resistance.',
    keyTakeawayBn:
      'USD/JPY পেয়ারে একদম টপ রেজিস্ট্যান্সের কাছে অতিরিক্ত লেভারেজ নিয়ে Buy (Long) পজিশন নেওয়া থেকে সতর্ক থাকুন।',
    relatedPairs: ['USD/JPY', 'AUD/USD'],
  },
  {
    id: 'news-4',
    timeAgoEn: '2 hours ago',
    timeAgoBn: '২ ঘণ্টা আগে',
    category: 'MACRO',
    sentiment: 'BULLISH',
    impact: 'MEDIUM',
    headlineEn: 'London–New York Overlap Volume Projected to Surge 40% Around US Inflation Print',
    headlineBn: 'আজ সন্ধ্যা ৭টা থেকে রাত ১১টা (লন্ডন-নিউ ইয়র্ক ওভারল্যাপ) মার্কেটে উচ্চ ভোলাটিলিটির পূর্বাভাস',
    summaryEn:
      'Liquidity providers report heavy order-book depth clustering around major psychological levels across Forex majors and Solana/Bitcoin perpetuals ahead of the NY open.',
    summaryBn:
      'আজ বাংলাদেশ সময় সন্ধ্যা ৭:০০টা থেকে রাত ১১:০০টা পর্যন্ত লন্ডন ও নিউ ইয়র্ক সেশনের ওভারল্যাপ এবং মার্কিন অর্থনৈতিক ডাটার কারণে মেজর কারেন্সি পেয়ার ও ক্রিপ্টোতে স্বাভাবিকের চেয়ে ৪০% বেশি মুভমেন্ট হওয়ার সম্ভাবনা রয়েছে।',
    keyTakeawayEn:
      'Use the Risk Calculator to keep risk per trade within 1%–2% of total capital during high-impact overlap hours.',
    keyTakeawayBn:
      'ওভারল্যাপ সেশনে ট্রেড করার সময় অবশ্যই রিস্ক ক্যালকুলেটর ব্যবহার করে মোট ব্যালেন্সের ১%-২% এর মধ্যে ঝুঁকি সীমাবদ্ধ রাখুন।',
    relatedPairs: ['EUR/USD', 'GBP/USD', 'BTC/USDT', 'SOL/USDT'],
  },
  {
    id: 'news-5',
    timeAgoEn: '3 hours ago',
    timeAgoBn: '৩ ঘণ্টা আগে',
    category: 'CRYPTO',
    sentiment: 'BULLISH',
    impact: 'MEDIUM',
    headlineEn: 'Solana & Layer-1 DEX Volume Hits Monthly High Driven by Asian & European Retail Flow',
    headlineBn: 'এশিয়ান ও ইউরোপিয়ান সেশনে সোলানা (SOL) ও লেয়ার-১ নেটওয়ার্কে লেনদেনের নতুন রেকর্ড',
    summaryEn:
      'Decentralized exchange volume on Solana and BNB Chain expanded significantly over the past 24 hours, boosting momentum across high-beta altcoins.',
    summaryBn:
      'গত ২৪ ঘণ্টায় সোলানা (SOL/USDT) এবং BNB নেটওয়ার্কে অন-চেইন লেনদেন উল্লেখযোগ্য হারে বৃদ্ধি পেয়েছে, যা অল্টকয়েন মার্কেটে ইতিবাচক মোমেন্টাম তৈরি করছে।',
    keyTakeawayEn:
      'SOL/USDT and BNB/USDT show strong relative strength when Bitcoin consolidates.',
    keyTakeawayBn:
      'বিটকয়েন স্থিতিশীল থাকলে SOL/USDT ও BNB/USDT পেয়ারে দ্রুত ব্রেকআউট এন্ট্রি পাওয়া যেতে পারে।',
    relatedPairs: ['SOL/USDT', 'BNB/USDT', 'XRP/USDT'],
  },
];

/**
 * Helper to check if a session is open at a given UTC fractional hour (0..24)
 */
export function isSessionOpenAtUtc(session: TradingSessionInfo, utcHourFloat: number): boolean {
  const h = ((utcHourFloat % 24) + 24) % 24;
  if (session.openUtcHour < session.closeUtcHour) {
    return h >= session.openUtcHour && h < session.closeUtcHour;
  } else {
    // Wraps around midnight UTC (e.g., Sydney 22:00 -> 07:00 UTC)
    return h >= session.openUtcHour || h < session.closeUtcHour;
  }
}

/**
 * Calculate hours remaining until session opens or closes
 */
function getSessionCountdown(session: TradingSessionInfo, utcHourFloat: number, isBn: boolean): string {
  const h = ((utcHourFloat % 24) + 24) % 24;
  const isOpen = isSessionOpenAtUtc(session, h);
  const targetHour = isOpen ? session.closeUtcHour : session.openUtcHour;
  let diff = targetHour - h;
  if (diff <= 0) diff += 24;
  const hours = Math.floor(diff);
  const mins = Math.floor((diff - hours) * 60);
  if (isOpen) {
    return isBn
      ? `${hours} ঘঃ ${mins} মিঃ পর বন্ধ হবে`
      : `Closes in ${hours}h ${mins}m`;
  }
  return isBn
    ? `${hours} ঘঃ ${mins} মিঃ পর শুরু হবে`
    : `Opens in ${hours}h ${mins}m`;
}

const FLASH_NEWS_POOL: Omit<MarketNewsItem, 'id' | 'timeAgoEn' | 'timeAgoBn'>[] = [
  {
    category: 'FOREX',
    sentiment: 'BULLISH',
    impact: 'HIGH',
    headlineEn: 'GBP/USD Holds Firm Above Key Support Following Stronger UK CPI Reading',
    headlineBn: 'যুক্তরাজ্যের শক্তিশালী মুদ্রাস্ফীতি (CPI) ডাটার পর সাপোর্ট লেভেলের উপরে শক্ত অবস্থানে GBP/USD',
    summaryEn:
      'Sterling buyers defended intraday support zones during London trading as hotter UK inflation reduced odds of near-term Bank of England rate cuts.',
    summaryBn:
      'যুক্তরাজ্যের মুদ্রাস্ফীতি পূর্বাভাসের চেয়ে বেশি আসায় ব্যাংক অফ ইংল্যান্ড আপাতত সুদের হার কমাচ্ছে না—এই প্রত্যাশায় লন্ডন সেশনে GBP/USD পেয়ারে বায়ারদের চাপ বেড়েছে।',
    keyTakeawayEn:
      'Look for bullish continuation setups on GBP/USD above EMA-20 during London and NY sessions.',
    keyTakeawayBn:
      'লন্ডন ও নিউ ইয়র্ক সেশনে GBP/USD পেয়ারে EMA-20 এর উপরে বুলিশ (Long) সেটআপ খুঁজুন।',
    relatedPairs: ['GBP/USD', 'EUR/USD'],
  },
  {
    category: 'CRYPTO',
    sentiment: 'BULLISH',
    impact: 'HIGH',
    headlineEn: 'Ethereum & Bitcoin Exchange Reserves Drop to Multi-Month Low as Whales Accumulate',
    headlineBn: 'এক্সচেঞ্জে বিটকয়েন ও ইথেরিয়ামের রিজার্ভ কমেছে—বড় হোয়েল (Whales) ওয়ালেটে আকুমুলেশন বৃদ্ধি',
    summaryEn:
      'On-chain analytics confirm large outflows from centralized exchanges into cold storage wallets, reducing immediate sell-side liquidity on BTC/USDT and ETH/USDT.',
    summaryBn:
      'অন-চেইন ডাটা অনুযায়ী বড় বিনিয়োগকারীরা (Whales) এক্সচেঞ্জ থেকে বিটকয়েন ও ইথেরিয়াম নিজস্ব কোল্ড ওয়ালেটে সরিয়ে নিচ্ছেন, ফলে মার্কেটে সেল প্রেসার কমে বুলিশ প্রবণতা তৈরি হয়েছে।',
    keyTakeawayEn:
      'Reduced exchange supply favors upside breakouts on BTC/USDT and ETH/USDT when volume spikes.',
    keyTakeawayBn:
      'ভলিউম বৃদ্ধি পেলে BTC/USDT এবং ETH/USDT পেয়ারে রেজিস্ট্যান্স ব্রেকআউট ট্রেড নেওয়া লাভজনক হতে পারে।',
    relatedPairs: ['BTC/USDT', 'ETH/USDT'],
  },
  {
    category: 'MACRO',
    sentiment: 'NEUTRAL',
    impact: 'HIGH',
    headlineEn: 'US Treasury Yields Stabilize Ahead of 6:30 PM BST Core Inflation & Jobless Claims Data',
    headlineBn: 'সন্ধ্যা ৬:৩০টার মার্কিন CPI ও বেকারত্ব ডাটার আগে স্থিতিশীল অবস্থানে US Treasury Yields ও ডলার',
    summaryEn:
      'Global institutional desks are trimming excess leverage ahead of the upcoming US macroeconomic release, keeping EUR/USD and Gold within tight intraday ranges.',
    summaryBn:
      'বাংলাদেশ সময় সন্ধ্যা ৬:৩০টায় প্রকাশিতব্য মার্কিন অর্থনৈতিক ডাটার আগে বড় প্রাতিষ্ঠানিক ট্রেডাররা অতিরিক্ত লেভারেজ কমিয়ে সতর্ক অবস্থান নিচ্ছেন।',
    keyTakeawayEn:
      'Wait for the 6:30 PM BST candle volatility to settle before committing to directional trades.',
    keyTakeawayBn:
      'হাই-ইমপ্যাক্ট নিউজের ঠিক আগে ট্রেড না নিয়ে ক্যান্ডেল স্থির হওয়া পর্যন্ত অপেক্ষা করুন।',
    relatedPairs: ['EUR/USD', 'USD/JPY', 'BTC/USDT'],
  },
  {
    category: 'FOREX',
    sentiment: 'BULLISH',
    impact: 'MEDIUM',
    headlineEn: 'AUD/USD & USD/CAD React to Commodity Market Momentum Ahead of North American Open',
    headlineBn: 'কমোডিটি ও তেলের বাজারের ইতিবাচক মুভমেন্টে AUD/USD এবং USD/CAD পেয়ারে নতুন ট্রেডিং সুযোগ',
    summaryEn:
      'Commodity-linked currencies saw renewed institutional order flow as energy and metals markets ticked higher heading into the New York session.',
    summaryBn:
      'আন্তর্জাতিক বাজারে জ্বালানি তেল ও ধাতব পণ্যের চাহিদা বাড়ায় কমোডিটি কারেন্সি AUD/USD এবং USD/CAD পেয়ারে ভোলাটিলিটি বৃদ্ধি পেয়েছে।',
    keyTakeawayEn:
      'Check key support/resistance levels on AUD/USD and USD/CAD for clean 1:2 Risk-Reward entries.',
    keyTakeawayBn:
      'AUD/USD ও USD/CAD পেয়ারে সাপোর্ট-রেজিস্ট্যান্স লেভেল দেখে ১:২ রিস্ক-রিওয়ার্ড অনুপাতে এন্ট্রি নিন।',
    relatedPairs: ['AUD/USD', 'USD/CAD'],
  },
];

export const MarketIntelView: React.FC<MarketIntelViewProps> = ({
  onSelectAssetAndGoToChart,
  onSimulateVolatilitySpike,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [now, setNow] = useState<Date>(() => new Date());
  // Sub-navigation inside Market Intel Hub
  const [subTab, setSubTab] = useState<'ALL' | 'SESSIONS' | 'CALENDAR' | 'NEWS'>('ALL');

  // Time scrubber for testing/previewing any hour in Bangladesh Time (null = live real-time)
  const [previewBstHour, setPreviewBstHour] = useState<number | null>(null);

  // Economic calendar filters
  const [dayFilter, setDayFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK'>('ALL');
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>('evt-2');

  // News filters & Live Auto-Refresh State (every 60 seconds)
  const AUTO_REFRESH_SECONDS = 60;
  const [newsCategory, setNewsCategory] = useState<'ALL' | 'FOREX' | 'CRYPTO' | 'MACRO'>('ALL');
  const [newsList, setNewsList] = useState<MarketNewsItem[]>(MARKET_NEWS_ITEMS);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(AUTO_REFRESH_SECONDS);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fearGreedScore, setFearGreedScore] = useState<number>(68);
  const [fearGreedLabel, setFearGreedLabel] = useState<string>('Greed');
  const [dxyValue, setDxyValue] = useState<number>(103.85);
  const [flashIndex, setFlashIndex] = useState<number>(0);

  // Function to fetch live sentiment & inject latest market news automatically
  const triggerMarketRefresh = React.useCallback(
    async (currentFlashIdx: number) => {
      setIsRefreshing(true);
      try {
        // 1. Fetch live Crypto Fear & Greed Index from public CORS API
        try {
          const fgRes = await fetch('https://api.alternative.me/fng/?limit=1');
          if (fgRes.ok) {
            const fgJson = await fgRes.json();
            const item = fgJson?.data?.[0];
            if (item && item.value) {
              setFearGreedScore(Number(item.value));
              setFearGreedLabel(item.value_classification || 'Greed');
            }
          }
        } catch {
          // Fallback slight live fluctuation if offline
          setFearGreedScore((prev) => Math.max(25, Math.min(85, prev + (Math.random() > 0.5 ? 1 : -1))));
        }

        // 2. Slightly tick DXY index to reflect live market activity
        setDxyValue((prev) =>
          Number((prev + (Math.random() - 0.49) * 0.04).toFixed(2))
        );

        // 3. Rotate in a fresh live flash news item at the top of the feed
        const template = FLASH_NEWS_POOL[currentFlashIdx % FLASH_NEWS_POOL.length];
        const newFlashItem: MarketNewsItem = {
          ...template,
          id: `live-news-${Date.now()}`,
          timeAgoEn: 'Just now (Auto-updated)',
          timeAgoBn: 'এইমাত্র (অটো-আপডেট)',
        };

        setNewsList((prev) => {
          const aged = prev.slice(0, 7).map((item, idx) => {
            if (idx === 0 && item.timeAgoEn.includes('Just now')) {
              return {
                ...item,
                timeAgoEn: '1 min ago',
                timeAgoBn: '১ মিনিট আগে',
              };
            }
            if (idx === 1 && item.timeAgoEn === '1 min ago') {
              return {
                ...item,
                timeAgoEn: '2 mins ago',
                timeAgoBn: '২ মিনিট আগে',
              };
            }
            return item;
          });
          return [newFlashItem, ...aged];
        });

        setFlashIndex((i) => i + 1);
        setLastUpdatedTime(new Date());
        setSecondsUntilRefresh(AUTO_REFRESH_SECONDS);
      } finally {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    },
    []
  );

  // Initial live API fetch on mount
  useEffect(() => {
    triggerMarketRefresh(0);
  }, [triggerMarketRefresh]);

  // 1-second live clock & 60-second automatic news refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger refresh whenever countdown wraps around to AUTO_REFRESH_SECONDS after hitting 1
  useEffect(() => {
    if (secondsUntilRefresh === AUTO_REFRESH_SECONDS && Date.now() - lastUpdatedTime.getTime() >= 55000) {
      triggerMarketRefresh(flashIndex);
    }
  }, [secondsUntilRefresh, lastUpdatedTime, flashIndex, triggerMarketRefresh]);

  // Calculate live UTC and BST (UTC + 6) time
  const liveUtcHourFloat =
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const liveBstHourFloat = (liveUtcHourFloat + 6) % 24;

  const activeBstHourFloat = previewBstHour !== null ? previewBstHour : liveBstHourFloat;
  const activeUtcHourFloat = (activeBstHourFloat - 6 + 24) % 24;

  // Format BST digital clock string
  const formatBstClock = (bstFloat: number, includeSeconds: boolean = false) => {
    const totalSeconds = Math.floor(((bstFloat % 24) + 24) % 24 * 3600);
    const hours24 = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const hStr = String(hours12).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    return includeSeconds ? `${hStr}:${mStr}:${sStr} ${period}` : `${hStr}:${mStr} ${period}`;
  };

  // Determine open sessions & overlaps
  const openSessions = useMemo(() => {
    return GLOBAL_SESSIONS.filter((s) => isSessionOpenAtUtc(s, activeUtcHourFloat));
  }, [activeUtcHourFloat]);

  const isLondonNyOverlap =
    openSessions.some((s) => s.id === 'london') &&
    openSessions.some((s) => s.id === 'newyork');

  const isTokyoLondonOverlap =
    openSessions.some((s) => s.id === 'tokyo') &&
    openSessions.some((s) => s.id === 'london');

  // Filter Economic Calendar events
  const filteredEvents = useMemo(() => {
    return ECONOMIC_CALENDAR_EVENTS.filter((ev) => {
      if (dayFilter !== 'ALL' && ev.dayCategory !== dayFilter) return false;
      if (impactFilter === 'HIGH' && ev.impact !== 'HIGH') return false;
      if (impactFilter === 'MEDIUM' && ev.impact !== 'MEDIUM') return false;
      if (currencyFilter !== 'ALL' && ev.currency !== currencyFilter) return false;
      return true;
    });
  }, [dayFilter, impactFilter, currencyFilter]);

  // Filter Market News
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      if (newsCategory !== 'ALL' && item.category !== newsCategory) return false;
      return true;
    });
  }, [newsList, newsCategory]);

  const handleJumpToPair = (symbol: string) => {
    if (!onSelectAssetAndGoToChart) return;
    const found = TRADING_ASSETS.find((a) => a.symbol === symbol);
    if (found) {
      onSelectAssetAndGoToChart(found);
    }
  };

  const handleSimulateImpact = (symbol: string, direction: 'BULLISH' | 'BEARISH') => {
    if (!onSimulateVolatilitySpike) return;
    const found = TRADING_ASSETS.find((a) => a.symbol === symbol) || TRADING_ASSETS[0];
    onSimulateVolatilitySpike(found, direction);
  };

  return (
    <div className="flex flex-col gap-5 flex-1">
      {/* Top Header & Live Bangladesh Time (BST) + Global Market Status Bar */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold tracking-wider uppercase">
            <Globe className="w-3.5 h-3.5" />
            <span>
              {isBn
                ? 'গ্লোবাল মার্কেট ইন্টেলিজেন্স ও ইকোনমিক হাব'
                : 'Global Market Intelligence & Economic Hub'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {isBn
              ? 'ট্রেডিং সেশন, অর্থনৈতিক ক্যালেন্ডার ও লাইভ মার্কেট নিউজ'
              : 'Trading Sessions, Economic Calendar & Market News'}
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            {isBn
              ? 'বাংলাদেশ সময় (BST - UTC+6) অনুযায়ী কোন ফরেক্স সেশন এখন খোলা আছে, কখন হাই-ইমপ্যাক্ট USD/EUR/Crypto নিউজ প্রকাশ পাবে এবং মার্কেট সেন্টিমেন্ট কোন দিকে তা এখান থেকে দেখে ট্রেড পরিকল্পনা করুন।'
              : 'Track live global Forex trading sessions in Bangladesh Standard Time (BST - UTC+6), upcoming high-impact economic releases, and real-time market sentiment.'}
          </p>
        </div>

        {/* Live Clocks & Active Session Summary */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2 flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {previewBstHour !== null
                  ? isBn
                    ? 'প্রিভিউ সময় (BST UTC+6)'
                    : 'Preview Time (BST UTC+6)'
                  : isBn
                    ? 'বাংলাদেশ সময় (BST UTC+6)'
                    : 'Bangladesh Time (BST UTC+6)'}
              </div>
              <div className="text-sm font-mono font-bold text-white tabular-nums">
                {formatBstClock(activeBstHourFloat, previewBstHour === null)}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {isBn ? 'বর্তমান মার্কেট স্ট্যাটাস' : 'Active Market Status'}
            </div>
            <div className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400">
                {openSessions.length > 0
                  ? openSessions
                      .map((s) => (isBn ? s.nameBn.split(' ')[0] : s.nameEn.split(' ')[0]))
                      .join(' + ') + (isBn ? ' সেশন খোলা' : ' Open')
                  : isBn
                    ? 'ক্রিপ্টো ২৪/৭ খোলা'
                    : 'Crypto 24/7 Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-[#0b0f19] border border-slate-800 rounded-lg">
          <button
            onClick={() => setSubTab('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              subTab === 'ALL'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isBn ? 'সব একসাথে (All)' : 'All Overview'}
          </button>
          <button
            onClick={() => setSubTab('SESSIONS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              subTab === 'SESSIONS'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isBn ? 'ট্রেডিং সেশন (Sessions)' : 'Trading Sessions'}</span>
          </button>
          <button
            onClick={() => setSubTab('CALENDAR')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              subTab === 'CALENDAR'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isBn ? 'অর্থনৈতিক ক্যালেন্ডার (Calendar)' : 'Economic Calendar'}</span>
          </button>
          <button
            onClick={() => setSubTab('NEWS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              subTab === 'NEWS'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>{isBn ? 'মার্কেট নিউজ (News)' : 'Market News'}</span>
          </button>
        </div>

        {/* Overlap Alert Banner if London+NY or Tokyo+London is active */}
        {isLondonNyOverlap ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isBn
                ? '🔥 লন্ডন + নিউ ইয়র্ক গোল্ডেন ওভারল্যাপ চলছে! (সন্ধ্যা ৭:০০ - রাত ১১:০০ BST — সর্বোচ্চ ভোলাটিলিটি)'
                : '🔥 London + New York Overlap Active! (7:00 PM – 11:00 PM BST — Peak Volatility)'}
            </span>
          </div>
        ) : isTokyoLondonOverlap ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {isBn
                ? '⚡ টোকিও + লন্ডন ওভারল্যাপ চলছে! (দুপুর ২:০০ - ৩:০০ BST — ব্রেকআউট জোন)'
                : '⚡ Tokyo + London Overlap Active! (2:00 PM – 3:00 PM BST — Breakout Window)'}
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            {isBn
              ? '💡 সেরা ট্রেডিং সময়: দুপুর ২:০০টা (লন্ডন ওপেন) এবং সন্ধ্যা ৭:০০টা - রাত ১১:০০টা (লন্ডন-নিউ ইয়র্ক ওভারল্যাপ)'
              : '💡 Best Trading Hours: 2:00 PM BST (London Open) & 7:00 PM – 11:00 PM BST (London–NY Overlap)'}
          </div>
        )}
      </div>

      {/* =====================================================================
          SECTION 1: GLOBAL TRADING SESSIONS & 24-HOUR BST TIMELINE
      ===================================================================== */}
      {(subTab === 'ALL' || subTab === 'SESSIONS') && (
        <section className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>
                  {isBn
                    ? 'গ্লোবাল ফরেক্স ট্রেডিং সেশন ও বাংলাদেশ সময়সূচি (BST)'
                    : 'Global Forex Trading Sessions & Bangladesh Time Schedule'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'নিচের স্লাইডারটি টেনে দিনের যেকোনো সময়ে কোন সেশন খোলা থাকে তা পরীক্ষা করতে পারেন।'
                  : 'Drag the time slider below to inspect which global sessions are open at any hour of the day.'}
              </p>
            </div>

            {/* Interactive Time Simulator Control */}
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {isBn ? 'সময় চেক করুন:' : 'Test Hour (BST):'}
              </span>
              <input
                type="range"
                min={0}
                max={23.75}
                step={0.25}
                value={activeBstHourFloat}
                onChange={(e) => setPreviewBstHour(parseFloat(e.target.value))}
                className="w-28 sm:w-36 accent-cyan-400 cursor-pointer"
              />
              {previewBstHour !== null && (
                <button
                  onClick={() => setPreviewBstHour(null)}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline whitespace-nowrap cursor-pointer"
                >
                  {isBn ? 'লাইভ সময়ে ফিরুন' : 'Reset Live'}
                </button>
              )}
            </div>
          </div>

          {/* 24-Hour Visual Timeline Bar (00:00 BST to 24:00 BST) */}
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-lg p-3.5 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800/80">
              <span>12 AM (BST)</span>
              <span>4 AM</span>
              <span>8 AM</span>
              <span>12 PM</span>
              <span className="text-emerald-400 font-bold">2 PM (London)</span>
              <span className="text-amber-400 font-bold">7 PM (NY Overlap)</span>
              <span>11 PM</span>
            </div>

            {/* 4 Session Timeline Tracks in BST (UTC+6) */}
            <div className="space-y-2 relative py-1">
              {/* Vertical Current Time Needle */}
              <div
                style={{ left: `${(activeBstHourFloat / 24) * 100}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.9)]"
              >
                <div className=" -translate-x-1/2 -top-1 bg-cyan-400 text-slate-950 text-[9px] font-mono font-extrabold px-1 rounded">
                  {formatBstClock(activeBstHourFloat, false)}
                </div>
              </div>

              {/* Sydney: 04:00 BST to 13:00 BST */}
              <div className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-slate-300 font-medium truncate">
                  🇦🇺 {isBn ? 'সিডনি' : 'Sydney'}
                </span>
                <div className="flex-1 h-5 bg-slate-900 rounded relative overflow-hidden border border-slate-800/70">
                  <div
                    style={{ left: `${(4 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
                    className="absolute top-0.5 bottom-0.5 bg-cyan-500/30 border border-cyan-500/50 rounded flex items-center justify-center text-[10px] font-mono text-cyan-200"
                  >
                    04:00 AM – 01:00 PM BST
                  </div>
                </div>
              </div>

              {/* Tokyo: 06:00 BST to 15:00 BST */}
              <div className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-slate-300 font-medium truncate">
                  🇯🇵 {isBn ? 'টোকিও' : 'Tokyo'}
                </span>
                <div className="flex-1 h-5 bg-slate-900 rounded relative overflow-hidden border border-slate-800/70">
                  <div
                    style={{ left: `${(6 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
                    className="absolute top-0.5 bottom-0.5 bg-amber-500/30 border border-amber-500/50 rounded flex items-center justify-center text-[10px] font-mono text-amber-200"
                  >
                    06:00 AM – 03:00 PM BST
                  </div>
                </div>
              </div>

              {/* London: 14:00 BST to 23:00 BST */}
              <div className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-slate-300 font-medium truncate">
                  🇬🇧 {isBn ? 'লন্ডন' : 'London'}
                </span>
                <div className="flex-1 h-5 bg-slate-900 rounded relative overflow-hidden border border-slate-800/70">
                  <div
                    style={{ left: `${(14 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
                    className="absolute top-0.5 bottom-0.5 bg-emerald-500/30 border border-emerald-500/50 rounded flex items-center justify-center text-[10px] font-mono text-emerald-200"
                  >
                    02:00 PM – 11:00 PM BST
                  </div>
                </div>
              </div>

              {/* New York: 19:00 BST to 24:00 BST + 00:00 BST to 04:00 BST */}
              <div className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 text-slate-300 font-medium truncate">
                  🇺🇸 {isBn ? 'নিউ ইয়র্ক' : 'New York'}
                </span>
                <div className="flex-1 h-5 bg-slate-900 rounded relative overflow-hidden border border-slate-800/70">
                  {/* Morning wrap 00:00 - 04:00 BST */}
                  <div
                    style={{ left: '0%', width: `${(4 / 24) * 100}%` }}
                    className="absolute top-0.5 bottom-0.5 bg-rose-500/30 border border-rose-500/50 rounded flex items-center justify-center text-[9px] font-mono text-rose-200"
                  >
                    12AM–4AM
                  </div>
                  {/* Evening 19:00 - 24:00 BST */}
                  <div
                    style={{ left: `${(19 / 24) * 100}%`, width: `${(5 / 24) * 100}%` }}
                    className="absolute top-0.5 bottom-0.5 bg-rose-500/30 border border-rose-500/50 rounded flex items-center justify-center text-[10px] font-mono text-rose-200"
                  >
                    07:00 PM – 04:00 AM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Session Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {GLOBAL_SESSIONS.map((session) => {
              const isOpen = isSessionOpenAtUtc(session, activeUtcHourFloat);
              const countdown = getSessionCountdown(session, activeUtcHourFloat, isBn);

              return (
                <div
                  key={session.id}
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                    isOpen
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-85'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{session.flag}</span>
                          <h3 className="text-sm font-bold text-white">
                            {isBn ? session.nameBn : session.nameEn}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isBn ? session.cityBn : session.cityEn}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isOpen ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {isOpen ? (isBn ? '● চালু (OPEN)' : '● OPEN') : isBn ? '○ বন্ধ' : '○ CLOSED'}
                      </span>
                    </div>

                    <div className="bg-[#0b0f19] border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isBn ? 'বাংলাদেশ সময়:' : 'BST Hours:'}</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {isBn
                            ? `${session.openBstLabel} – ${session.closeBstLabel}`
                            : `${session.openBstLabelEn} – ${session.closeBstLabelEn}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{isBn ? 'স্ট্যাটাস:' : 'Countdown:'}</span>
                        <span className={isOpen ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                          {countdown}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isBn ? session.characteristicsBn : session.characteristicsEn}
                    </p>

                    <div className="pt-1 border-t border-slate-800/70">
                      <div className="text-[11px] text-amber-300/90 font-medium leading-snug">
                        💡 {isBn ? session.strategyTipBn : session.strategyTipEn}
                      </div>
                    </div>
                  </div>

                  {/* Best Pairs to Trade in this Session */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                      {isBn ? 'সেরা পেয়ার (ক্লিক করে চার্টে দেখুন):' : 'Best Pairs (Click to open Chart):'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {session.bestPairs.map((pairSymbol) => (
                        <button
                          key={pairSymbol}
                          onClick={() => handleJumpToPair(pairSymbol)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-mono font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{pairSymbol}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 2: ECONOMIC CALENDAR (অর্থনৈতিক ক্যালেন্ডার)
      ===================================================================== */}
      {(subTab === 'ALL' || subTab === 'CALENDAR') && (
        <section className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>
                  {isBn
                    ? 'ফরেক্স ও ক্রিপ্টো অর্থনৈতিক ক্যালেন্ডার (Economic Calendar)'
                    : 'Forex & Crypto Economic Calendar'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'যেকোনো নিউজে ক্লিক করে জানুন ডাটাটি কী বোঝায়, মার্কেটে এর প্রভাব কী এবং কীভাবে ট্রেড নেওয়া উচিত।'
                  : 'Click any economic event row to inspect its market impact explanation and trading strategy.'}
              </p>
            </div>

            {/* Filters for Day, Impact, Currency */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Day Filter */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(
                  [
                    { id: 'ALL', labelBn: 'সব দিন', labelEn: 'All Days' },
                    { id: 'TODAY', labelBn: 'আজ', labelEn: 'Today' },
                    { id: 'TOMORROW', labelBn: 'আগামীকাল', labelEn: 'Tomorrow' },
                    { id: 'THIS_WEEK', labelBn: 'এই সপ্তাহ', labelEn: 'This Week' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDayFilter(d.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      dayFilter === d.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isBn ? d.labelBn : d.labelEn}
                  </button>
                ))}
              </div>

              {/* Impact Filter */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setImpactFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    impactFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  {isBn ? 'সব ইমপ্যাক্ট' : 'All Impact'}
                </button>
                <button
                  onClick={() => setImpactFilter('HIGH')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    impactFilter === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'
                  }`}
                >
                  🔴 {isBn ? 'হাই ইমপ্যাক্ট' : 'High Only'}
                </button>
              </div>

              {/* Currency Filter */}
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">{isBn ? 'সব কারেন্সি (All)' : 'All Currencies'}</option>
                <option value="USD">🇺🇸 USD (US Dollar)</option>
                <option value="EUR">🇪🇺 EUR (Euro)</option>
                <option value="GBP">🇬🇧 GBP (British Pound)</option>
                <option value="JPY">🇯🇵 JPY (Japanese Yen)</option>
                <option value="CRYPTO">₿ CRYPTO (Bitcoin / ETF)</option>
              </select>
            </div>
          </div>

          {/* Calendar Table / Accordion Rows */}
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid md:grid-cols-12 gap-3 bg-slate-900/90 px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-2">{isBn ? 'সময় (BST)' : 'Time (BST)'}</div>
              <div className="col-span-1">{isBn ? 'কারেন্সি' : 'Currency'}</div>
              <div className="col-span-4">{isBn ? 'ইভেন্ট / নিউজের নাম' : 'Economic Event'}</div>
              <div className="col-span-2">{isBn ? 'ইমপ্যাক্ট (প্রভাব)' : 'Impact'}</div>
              <div className="col-span-1 text-right">{isBn ? 'পূর্ববর্তী' : 'Previous'}</div>
              <div className="col-span-1 text-right">{isBn ? 'পূর্বাভাস' : 'Forecast'}</div>
              <div className="col-span-1 text-right">{isBn ? 'ফলাফল' : 'Actual'}</div>
            </div>

            {filteredEvents.map((ev) => {
              const isExpanded = expandedEventId === ev.id;
              return (
                <div key={ev.id} className="bg-slate-950/60 hover:bg-slate-900/40 transition-colors">
                  {/* Summary Row */}
                  <div
                    onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-4 py-3.5 items-center cursor-pointer"
                  >
                    {/* Time & Day */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-start gap-2">
                      <div>
                        <div className="text-xs font-mono font-bold text-white">{ev.timeBst}</div>
                        <div className="text-[11px] text-slate-400">
                          {isBn ? ev.dateLabelBn : ev.dateLabelEn} · {ev.timeUtc}
                        </div>
                      </div>
                      <span className="md:hidden text-xs font-mono font-bold text-slate-300">
                        {ev.flag} {ev.currency}
                      </span>
                    </div>

                    {/* Currency */}
                    <div className="hidden md:flex md:col-span-1 items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                      <span>{ev.flag}</span>
                      <span>{ev.currency}</span>
                    </div>

                    {/* Event Title */}
                    <div className="md:col-span-4">
                      <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{isBn ? ev.titleBn : ev.titleEn}</span>
                      </div>
                      <div className="text-[11px] text-cyan-400/90 mt-0.5 flex items-center gap-1">
                        <span>
                          {isBn ? 'প্রভাবিত পেয়ার:' : 'Target Pair:'} {ev.affectedPairSymbol}
                        </span>
                        <span>·</span>
                        <span className="underline">
                          {isExpanded
                            ? isBn
                              ? 'সংক্ষিপ্ত করুন'
                              : 'Hide Guide'
                            : isBn
                              ? 'ট্রেডিং গাইড দেখুন'
                              : 'View Strategy'}
                        </span>
                      </div>
                    </div>

                    {/* Impact Indicator */}
                    <div className="md:col-span-2 flex items-center gap-1.5 text-xs">
                      {ev.impact === 'HIGH' ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          <span>{isBn ? 'হাই ইমপ্যাক্ট (High)' : 'High Impact'}</span>
                        </span>
                      ) : ev.impact === 'MEDIUM' ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isBn ? 'মিডিয়াম (Medium)' : 'Medium Impact'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {isBn ? 'লো ইমপ্যাক্ট (Low)' : 'Low Impact'}
                        </span>
                      )}
                    </div>

                    {/* Previous / Forecast / Actual */}
                    <div className="md:col-span-3 grid grid-cols-3 gap-2 text-xs font-mono pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                      <div className="md:text-right">
                        <span className="md:hidden text-[10px] text-slate-500 block">
                          {isBn ? 'পূর্ববর্তী' : 'Prev'}
                        </span>
                        <span className="text-slate-400">{ev.previous}</span>
                      </div>
                      <div className="md:text-right">
                        <span className="md:hidden text-[10px] text-slate-500 block">
                          {isBn ? 'পূর্বাভাস' : 'Forecast'}
                        </span>
                        <span className="text-slate-200 font-semibold">{ev.forecast}</span>
                      </div>
                      <div className="md:text-right flex md:justify-end items-center gap-1">
                        <div>
                          <span className="md:hidden text-[10px] text-slate-500 block">
                            {isBn ? 'ফলাফল' : 'Actual'}
                          </span>
                          {ev.actual ? (
                            <span className="text-emerald-400 font-bold">{ev.actual}</span>
                          ) : (
                            <span className="text-amber-400/80 text-[11px]">
                              {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Educational & Strategy Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 bg-slate-900/70 border-t border-slate-800/80 space-y-3">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-3 space-y-1">
                          <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            <span>
                              {isBn
                                ? 'এই অর্থনৈতিক ডাটাটি কী এবং কেন গুরুত্বপূর্ণ?'
                                : 'What is this Economic Release?'}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {isBn ? ev.explanationBn : ev.explanationEn}
                          </p>
                        </div>

                        <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-3 space-y-1">
                          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              {isBn
                                ? 'ট্রেডারদের করণীয় ও এন্ট্রি কৌশল:'
                                : 'Trading Rule & Risk Strategy:'}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {isBn ? ev.tradingRuleBn : ev.tradingRuleEn}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons to open the affected pair on Chart or Simulate News Spike */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="text-[11px] text-slate-400">
                          {isBn
                            ? `টার্গেট কারেন্সি পেয়ার: ${ev.affectedPairSymbol}`
                            : `Primary Affected Pair: ${ev.affectedPairSymbol}`}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {onSimulateVolatilitySpike && (
                            <>
                              <button
                                onClick={() => handleSimulateImpact(ev.affectedPairSymbol, 'BULLISH')}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>
                                  {isBn
                                    ? `${ev.affectedPairSymbol} বুলিশ নিউজ ইমপ্যাক্ট টেস্ট করুন`
                                    : `Simulate Bullish News on ${ev.affectedPairSymbol}`}
                                </span>
                              </button>
                              <button
                                onClick={() => handleSimulateImpact(ev.affectedPairSymbol, 'BEARISH')}
                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>
                                  {isBn
                                    ? `${ev.affectedPairSymbol} বিয়ারিশ নিউজ ইমপ্যাক্ট টেস্ট করুন`
                                    : `Simulate Bearish News on ${ev.affectedPairSymbol}`}
                                </span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleJumpToPair(ev.affectedPairSymbol)}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>
                              {isBn
                                ? `${ev.affectedPairSymbol} লাইভ চার্টে দেখুন`
                                : `Open ${ev.affectedPairSymbol} Chart`}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 3: MARKET NEWS & SENTIMENT ANALYSIS (মার্কেট নিউজ ও সেন্টিমেন্ট)
      ===================================================================== */}
      {(subTab === 'ALL' || subTab === 'NEWS') && (
        <section className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-amber-400" />
                  <span>
                    {isBn
                      ? 'মার্কেট নিউজ, ফান্ডামেন্টাল বিশ্লেষণ ও সেন্টিমেন্ট'
                      : 'Market News, Fundamental Analysis & Sentiment'}
                  </span>
                </h2>
                <span className="text-[11px] font-mono text-emerald-400">
                  ●{' '}
                  {isBn
                    ? `অটো-আপডেট: প্রতি ৬০ সেকেন্ডে (${secondsUntilRefresh}s বাকি)`
                    : `Auto-updates every 60s (${secondsUntilRefresh}s)`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'ফরেক্স ও ক্রিপ্টো মার্কেটের সর্বশেষ ব্রেকিং নিউজ প্রতি ১ মিনিট (৬০ সেকেন্ড) পরপর স্বয়ংক্রিয়ভাবে আপডেট হয়।'
                  : 'Breaking Forex & Crypto news and market sentiment automatically refresh every 60 seconds.'}
              </p>
            </div>

            {/* Manual Refresh Button + Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => triggerMarketRefresh(flashIndex)}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isBn ? 'এখনই আপডেট করুন' : 'Refresh Now'}</span>
              </button>

              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(
                  [
                    { id: 'ALL', labelBn: 'সব নিউজ', labelEn: 'All News' },
                    { id: 'FOREX', labelBn: 'ফরেক্স (Forex)', labelEn: 'Forex' },
                    { id: 'CRYPTO', labelBn: 'ক্রিপ্টো (Crypto)', labelEn: 'Crypto' },
                    { id: 'MACRO', labelBn: 'সেন্ট্রাল ব্যাংক / ম্যাক্রো', labelEn: 'Macro' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewsCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      newsCategory === cat.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isBn ? cat.labelBn : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Market Sentiment Overview Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">
                  {isBn ? 'ক্রিপ্টো ফিয়ার ও গ্রিড ইনডেক্স (Live API)' : 'Crypto Fear & Greed Index (Live)'}
                </div>
                <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                  {fearGreedScore} / 100 ·{' '}
                  {isBn
                    ? fearGreedScore >= 55
                      ? 'গ্রিড / বুলিশ (Bullish)'
                      : fearGreedScore <= 45
                        ? 'ফিয়ার / বিয়ারিশ (Bearish)'
                        : 'নিউট্রাল (Neutral)'
                    : `${fearGreedLabel}`}
                </div>
              </div>
              <Activity className="w-7 h-7 text-emerald-400/70" />
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">
                  {isBn ? 'মার্কিন ডলার ইনডেক্স (DXY) ট্রেন্ড' : 'US Dollar Index (DXY) Bias'}
                </div>
                <div className="text-base font-extrabold text-amber-400 mt-0.5 font-mono">
                  {dxyValue.toFixed(2)} · {isBn ? 'নিউজের আগে সাইডওয়েজ' : 'Consolidating Pre-CPI'}
                </div>
              </div>
              <Globe className="w-7 h-7 text-amber-400/70" />
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">
                  {isBn ? 'আজকের রিস্ক ওয়ার্নিং' : 'Intraday Volatility Warning'}
                </div>
                <div className="text-base font-extrabold text-rose-400 mt-0.5">
                  {isBn ? 'সন্ধ্যা ৬:৩০ - ৮:০০ BST (উচ্চ ঝুঁকি)' : '6:30 PM – 8:00 PM BST (High)'}
                </div>
              </div>
              <Flame className="w-7 h-7 text-rose-400/70" />
            </div>
          </div>

          {/* News Feed Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredNews.map((news) => (
              <article
                key={news.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="space-y-2">
                  {/* Metadata Line (Unboxed clean typography per design rules) */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{news.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{isBn ? news.timeAgoBn : news.timeAgoEn}</span>
                    </div>
                    <span
                      className={`font-bold ${
                        news.sentiment === 'BULLISH'
                          ? 'text-emerald-400'
                          : news.sentiment === 'BEARISH'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                      }`}
                    >
                      {news.sentiment === 'BULLISH'
                        ? isBn
                          ? '▲ বুলিশ (Bullish)'
                          : '▲ BULLISH'
                        : news.sentiment === 'BEARISH'
                          ? isBn
                            ? '▼ বিয়ারিশ (Bearish)'
                            : '▼ BEARISH'
                          : isBn
                            ? '◆ নিউট্রাল (Neutral)'
                            : '◆ NEUTRAL'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {isBn ? news.headlineBn : news.headlineEn}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isBn ? news.summaryBn : news.summaryEn}
                  </p>

                  <div className="bg-slate-900/90 border-l-2 border-cyan-400 pl-3 py-2 text-xs text-slate-200">
                    <span className="font-bold text-cyan-400">
                      {isBn ? 'ট্রেডারদের জন্য মূল বার্তা: ' : 'Key Takeaway: '}
                    </span>
                    {isBn ? news.keyTakeawayBn : news.keyTakeawayEn}
                  </div>
                </div>

                {/* Related Pairs clickable buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {isBn ? 'সংশ্লিষ্ট পেয়ার:' : 'Affected Pairs:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {news.relatedPairs.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => handleJumpToPair(symbol)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded text-[11px] font-mono font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{symbol}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
