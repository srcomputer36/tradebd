import React, { useState, useEffect } from 'react';
import { Asset } from '../../types/trading';
import { useLanguage } from '../../context/LanguageContext';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  HelpCircle,
  Shield,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Scale,
} from 'lucide-react';

interface AiMentorViewProps {
  currentAsset: Asset;
  currentPrice: number;
}

interface EvaluationResult {
  riskRewardRatio: number;
  verdict: 'STRONG' | 'MODERATE' | 'HIGH_RISK' | 'INVALID';
  score: number;
  feedback: string;
  checklist: { item: string; passed: boolean }[];
  riskAdvice: string;
  psychologyTip: string;
}

export const AiMentorView: React.FC<AiMentorViewProps> = ({ currentAsset, currentPrice }) => {
  const { t, language } = useLanguage();
  const initialDist = currentAsset.category === 'forex' ? 0.005 : 0.015;
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<string>(currentPrice.toFixed(currentAsset.precision));
  const [stopLoss, setStopLoss] = useState<string>(
    (currentPrice * (1 - initialDist)).toFixed(currentAsset.precision)
  );
  const [takeProfit, setTakeProfit] = useState<string>(
    (currentPrice * (1 + initialDist * 2.2)).toFixed(currentAsset.precision)
  );
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [notes, setNotes] = useState<string>('');

  // Sync entry, SL, and TP when user switches between Crypto and Forex pairs
  useEffect(() => {
    const dist = currentAsset.category === 'forex' ? 0.005 : 0.015;
    const base = currentPrice || currentAsset.basePrice;
    setEntryPrice(base.toFixed(currentAsset.precision));
    setStopLoss(
      (side === 'LONG' ? base * (1 - dist) : base * (1 + dist)).toFixed(currentAsset.precision)
    );
    setTakeProfit(
      (side === 'LONG' ? base * (1 + dist * 2.2) : base * (1 - dist * 2.2)).toFixed(
        currentAsset.precision
      )
    );
    setEvaluation(null);
  }, [currentAsset.id]);

  // Confluences checkboxes
  const confluenceOptions = [
    { id: 'confluenceSR', label: t('confluenceSR') },
    { id: 'confluenceRSI', label: t('confluenceRSI') },
    { id: 'confluenceEMA', label: t('confluenceEMA') },
    { id: 'confluencePattern', label: t('confluencePattern') },
    { id: 'confluenceBreakout', label: t('confluenceBreakout') },
    { id: 'confluenceVolume', label: t('confluenceVolume') },
  ];

  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'confluenceSR',
    'confluenceRSI',
  ]);

  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Chat with mentor state
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);

  const toggleConfluence = (id: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const evaluateClientFallback = (): EvaluationResult => {
    const isBn = language === 'bn';
    const entry = parseFloat(entryPrice) || currentAsset.basePrice;
    const sl = parseFloat(stopLoss) || entry * 0.985;
    const tp = parseFloat(takeProfit) || entry * 1.035;
    const riskDist = side === 'LONG' ? entry - sl : sl - entry;
    const rewardDist = side === 'LONG' ? tp - entry : entry - tp;

    if (riskDist <= 0 || rewardDist <= 0) {
      return {
        riskRewardRatio: 0,
        verdict: 'INVALID',
        score: 20,
        feedback: isBn
          ? side === 'LONG'
            ? 'LONG ট্রেডে Stop Loss অবশ্যই Entry প্রাইসের নিচে এবং Take Profit উপরে হতে হবে।'
            : 'SHORT ট্রেডে Stop Loss অবশ্যই Entry প্রাইসের উপরে এবং Take Profit নিচে হতে হবে।'
          : side === 'LONG'
          ? 'For a LONG trade, Stop Loss must be below Entry Price and Take Profit must be above.'
          : 'For a SHORT trade, Stop Loss must be above Entry Price and Take Profit must be below.',
        checklist: [
          {
            item: isBn ? 'সঠিক স্টপ লস ও টেক প্রফিট দিকনির্দেশনা' : 'Valid Stop Loss & Take Profit alignment',
            passed: false,
          },
        ],
        riskAdvice: isBn
          ? 'ট্রেড নেওয়ার আগে আপনার স্টপ লস ও টেক প্রফিট লেভেল পুনরায় যাচাই করুন।'
          : 'Please double-check your Stop Loss and Take Profit levels before entering the trade.',
        psychologyTip: isBn
          ? 'তাড়াহুড়ো করে অর্ডার বসাবেন না; সবসময় চার্টে লেভেলগুলো মিলিয়ে নিন।'
          : 'Never rush order placement; always verify levels on the chart first.',
      };
    }

    const rrRatio = Number((rewardDist / riskDist).toFixed(2));
    const riskPctNum = (riskDist / entry) * 100;

    let score = 55;
    if (rrRatio >= 2) score += 25;
    else if (rrRatio >= 1.5) score += 12;
    else score -= 15;

    if (selectedIndicators.length >= 2) score += 15;
    score = Math.max(10, Math.min(98, score));

    const verdict: EvaluationResult['verdict'] =
      score >= 75 ? 'STRONG' : score >= 50 ? 'MODERATE' : 'HIGH_RISK';

    return {
      riskRewardRatio: rrRatio,
      verdict,
      score,
      feedback: isBn
        ? `${currentAsset.symbol} (${timeframe}) পেয়ারে আপনার ${side} সেটআপের রিস্ক-রিওয়ার্ড 1:${rrRatio} এবং কনফ্লুয়েন্স স্কোর ${score}/100।`
        : `Your ${side} setup on ${currentAsset.symbol} (${timeframe}) has a 1:${rrRatio} R:R ratio with an overall confluence score of ${score}/100.`,
      checklist: [
        {
          item: isBn ? `রিস্ক:রিওয়ার্ড অনুপাত (1:${rrRatio}) ≥ 1:1.5` : `Risk:Reward ratio (1:${rrRatio}) ≥ 1:1.5`,
          passed: rrRatio >= 1.5,
        },
        {
          item: isBn ? 'একাধিক টেকনিক্যাল কনফ্লুয়েন্স (≥ ২টি)' : 'Multiple technical confluences (≥ 2)',
          passed: selectedIndicators.length >= 2,
        },
        {
          item: isBn ? `স্টপ লস দূরত্ব (${riskPctNum.toFixed(2)}%) নিয়ন্ত্রিত` : `Stop Loss distance (${riskPctNum.toFixed(2)}%) controlled`,
          passed: riskPctNum <= 5,
        },
      ],
      riskAdvice: isBn
        ? `${currentAsset.symbol} ট্রেডে আপনার মোট একাউন্ট ব্যালেন্সের ১% থেকে ২% এর বেশি ঝুঁকি নেবেন না।`
        : `Never risk more than 1% to 2% of your total account capital on this ${currentAsset.symbol} setup.`,
      psychologyTip: isBn
        ? 'ক্যান্ডেল ক্লোজ হওয়ার আগে ফোমো (FOMO) বশত এন্ট্রি নেবেন না এবং স্টপ লস হিট করলে রিভেঞ্জ ট্রেডিং থেকে বিরত থাকুন।'
        : 'Wait for candle close confirmation before entry and avoid revenge trading if Stop Loss is hit.',
    };
  };

  const handleAnalyzeTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Map indicator IDs to readable names for AI prompt
    const indicatorsForAI = selectedIndicators.map((id) => t(id));

    try {
      const res = await fetch('/api/analyze-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: currentAsset.symbol,
          side,
          entryPrice: parseFloat(entryPrice),
          stopLoss: parseFloat(stopLoss),
          takeProfit: parseFloat(takeProfit),
          timeframe,
          indicators: indicatorsForAI,
          notes,
          language,
        }),
      });

      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      if (data.status === 'success' && data.evaluation) {
        setEvaluation(data.evaluation);
      } else {
        setEvaluation(evaluateClientFallback());
      }
    } catch {
      setEvaluation(evaluateClientFallback());
    } finally {
      setLoading(false);
    }
  };

  const handleAskMentor = async (questionText: string) => {
    if (!questionText.trim()) return;
    setChatLoading(true);
    setChatAnswer(null);

    try {
      const res = await fetch('/api/ask-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          language,
        }),
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      if (data.answer) {
        setChatAnswer(data.answer);
        return;
      }
      throw new Error('Empty answer');
    } catch {
      const q = questionText.toLowerCase();
      const isBn = language === 'bn';
      if (q.includes('stop loss') || q.includes('স্টপ লস')) {
        setChatAnswer(
          isBn
            ? '• স্টপ লস সবসময় সাম্প্রতিক সুইং লো (Long এর ক্ষেত্রে) বা সুইং হাই (Short এর ক্ষেত্রে) থেকে সামান্য দূরে বসান।\n• একাউন্টের মোট ব্যালেন্সের ১% থেকে ২% এর বেশি কোনো একক ট্রেডে ঝুঁকি নেবেন না।'
            : '• Place your Stop Loss just beyond the recent Swing Low (for Long) or Swing High (for Short) structure.\n• Never risk more than 1% to 2% of your total account equity on a single trade.'
        );
      } else if (q.includes('rsi') || q.includes('ডাইভারজেন্স')) {
        setChatAnswer(
          isBn
            ? '• প্রাইস যখন Lower Low তৈরি করে কিন্তু RSI তখন Higher Low তৈরি করে, তাকে Bullish Divergence বলে।\n• শুধুমাত্র RSI দেখে এন্ট্রি না নিয়ে সাপোর্ট লেভেল এবং বুলিশ ক্যান্ডেলস্টিক কনফার্মেশনের জন্য অপেক্ষা করুন।'
            : '• Bullish RSI Divergence occurs when price makes a Lower Low while RSI forms a Higher Low.\n• Always combine RSI divergence with a key Support/Resistance zone and candle close confirmation.'
        );
      } else {
        setChatAnswer(
          isBn
            ? '• ট্রেডিংয়ে মূলধন সুরক্ষা (Capital Preservation) সবচেয়ে গুরুত্বপূর্ণ—প্রতি ট্রেডে ১-২% রিস্ক এবং ন্যূনতম ১:২ রিস্ক-রিওয়ার্ড বজায় রাখুন।\n• ব্রেকআউট ট্রেডিংয়ে ফোমো (FOMO) এড়িয়ে রিটেস্ট ও ভলিউম কনফার্মেশনের পর এন্ট্রি নিন।'
            : '• Capital preservation is rule #1: cap risk at 1-2% per trade and maintain at least a 1:2 Risk:Reward ratio.\n• Wait for retest and volume confirmation on breakouts instead of chasing impulsive candles.'
        );
      }
    } finally {
      setChatLoading(false);
    }
  };

  // Recommended preset FAQ questions
  const presetQuestions: Record<string, string[]> = {
    en: [
      'How do I calculate the safest Stop Loss distance?',
      'What is regular vs hidden RSI divergence?',
      'How to confirm a breakout before entering?',
    ],
    bn: [
      'স্টপ লস কত পার্সেন্টেজে রাখা সবচেয়ে নিরাপদ?',
      'RSI ডাইভারজেন্স কীভাবে ট্রেড করতে হয়?',
      'সাপোর্ট ব্রেকআউট পরবর্তী রিটেস্ট কীভাবে চেনা যায়?',
    ],
    es: [
      '¿Cómo calculo la distancia más segura de Stop Loss?',
      '¿Cómo operar divergencias en el indicador RSI?',
      '¿Cómo confirmar una ruptura con retesteo seguro?',
    ],
    hi: [
      'स्टॉप लॉस की सबसे सुरक्षित दूरी कैसे तय करें?',
      'RSI डाइवर्जेंस को सही तरीके से कैसे ट्रेड करें?',
      'ब्रेकआउट के बाद रीटेस्ट की पुष्टि कैसे करें?',
    ],
    ar: [
      'كيف أحدد المسافة الآمنة لوقف الخسارة؟',
      'كيف أتداول الانفراج (Divergence) في مؤشر RSI؟',
      'كيف أتأكد من نجاح إعادة اختبار الكسر؟',
    ],
    fr: [
      'Comment calculer la distance idéale de Stop Loss ?',
      'Comment trader les divergences sur le RSI ?',
      'Comment confirmer une cassure avec un retest propre ?',
    ],
    de: [
      'Wie berechne ich den sichersten Stop-Loss-Abstand?',
      'Wie handele ich RSI-Divergenzen zuverlässig?',
      'Wie bestätige ich einen Ausbruch mit Retest?',
    ],
    ja: [
      '最も安全なストップロス幅の決め方は？',
      'RSIダイバージェンスの確実なエントリー方法は？',
      'ブレイクアウト後のリテストを確認するコツは？',
    ],
  };

  const activePresets = presetQuestions[language] || presetQuestions['en'];

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <span>{t('mentorTitle')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('mentorSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Setup Input Form (Left 6 cols) */}
          <div className="lg:col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('planSetupInput')}</span>
            </h3>

            <form onSubmit={handleAnalyzeTrade} className="space-y-4">
              {/* Asset and Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('marketPair')}</label>
                  <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-cyan-400">
                    {currentAsset.symbol}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('tradeDirection')}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSide('LONG');
                        const dist = currentAsset.category === 'forex' ? 0.005 : 0.015;
                        const base = parseFloat(entryPrice) || currentPrice;
                        setStopLoss((base * (1 - dist)).toFixed(currentAsset.precision));
                        setTakeProfit((base * (1 + dist * 2.2)).toFixed(currentAsset.precision));
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        side === 'LONG'
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSide('SHORT');
                        const dist = currentAsset.category === 'forex' ? 0.005 : 0.015;
                        const base = parseFloat(entryPrice) || currentPrice;
                        setStopLoss((base * (1 + dist)).toFixed(currentAsset.precision));
                        setTakeProfit((base * (1 - dist * 2.2)).toFixed(currentAsset.precision));
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        side === 'SHORT'
                          ? 'bg-rose-600 border-rose-500 text-white shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Levels (Entry, SL, TP) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">{t('entryPrice')}</label>
                  <input
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-rose-400">{t('stopLoss')}</label>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-rose-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-emerald-400">{t('takeProfit')}</label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Timeframe */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">{t('timeframe')}</label>
                <div className="flex gap-1.5">
                  {['15m', '1h', '4h', '1D'].map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-xs rounded-md border font-mono ${
                        timeframe === tf
                          ? 'bg-slate-700 border-slate-600 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confluences checkboxes */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  {t('confluences')}
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {confluenceOptions.map((conf) => {
                    const isChecked = selectedIndicators.includes(conf.id);
                    return (
                      <button
                        type="button"
                        key={conf.id}
                        onClick={() => toggleConfluence(conf.id)}
                        className={`text-left px-3 py-2 rounded-lg text-xs border flex items-center gap-2.5 transition-colors ${
                          isChecked
                            ? 'bg-cyan-950/60 border-cyan-800/80 text-cyan-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                              : 'border-slate-700'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[11px] leading-tight">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes input */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">{t('tradeNotes')}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('analyzingSetup')}</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>{t('analyzeSetupBtn')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Feedback & Interactive Mentor Column (Right 6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {evaluation ? (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4 animate-in fade-in">
                {/* Score & Verdict Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-lg border ${
                        evaluation.score >= 75
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                          : evaluation.score >= 50
                          ? 'bg-amber-950/80 border-amber-500 text-amber-400'
                          : 'bg-rose-950/80 border-rose-500 text-rose-400'
                      }`}
                    >
                      {evaluation.score}
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
                        {t('setupScore')}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {evaluation.verdict === 'STRONG' && t('verdictStrong')}
                        {evaluation.verdict === 'MODERATE' && t('verdictModerate')}
                        {evaluation.verdict === 'INVALID' && t('verdictInvalid')}
                        {evaluation.verdict === 'HIGH_RISK' && t('verdictHighRisk')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">{t('calcRR')}</span>
                    <span className="text-sm font-bold font-mono text-cyan-400">
                      1 : {evaluation.riskRewardRatio}
                    </span>
                  </div>
                </div>

                {/* Mentor Feedback Text */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>{t('mentorDetailedFeedback')}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Checklist Passed/Failed */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>{t('preflightChecklist')}</span>
                  </h4>
                  <div className="space-y-1">
                    {evaluation.checklist.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                          item.passed
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                        }`}
                      >
                        <span>{item.item}</span>
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Advice & Psychology Tip */}
                <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-rose-400 font-bold block">{t('riskAdviceTitle')}</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{evaluation.riskAdvice}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">{t('psychologyTitle')}</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{evaluation.psychologyTip}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-cyan-950/50 border border-cyan-800/60 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {t('setupReadyPlaceholder')}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {t('setupReadySub')}
                </p>
              </div>
            )}

            {/* Interactive Ask Mentor Section */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>{t('askMentorTitle')}</span>
              </h3>

              {/* Preset clickable quick questions */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'bn' ? 'সাধারণ প্রশ্নসমূহ:' : 'Suggested topics:'}
                </span>
                <div className="flex flex-col gap-1.5">
                  {activePresets.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatQuestion(q);
                        handleAskMentor(q);
                      }}
                      className="text-left text-xs text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800/80 p-2 rounded-lg border border-slate-800 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom question input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAskMentor(chatQuestion);
                    }
                  }}
                  placeholder={t('askPlaceholder')}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-hidden focus:border-cyan-500"
                />
                <button
                  onClick={() => handleAskMentor(chatQuestion)}
                  disabled={chatLoading || !chatQuestion.trim()}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {chatLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Mentor Chat Answer Output */}
              {chatLoading && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>{t('mentorGenerating')}</span>
                </div>
              )}

              {chatAnswer && (
                <div className="p-4 bg-cyan-950/20 border border-cyan-800/50 rounded-xl space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>{t('mentorAnswerTitle')}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line text-[11px]">
                    {chatAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
