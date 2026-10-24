import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security hardening: Disable x-powered-by header and allow up to 5mb JSON body for blog cover images
app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));

// Security headers middleware (preserving iframe compatibility for preview environment)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Lightweight in-memory rate limiter for API routes (30 requests / minute / IP)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

function apiRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      status: 'error',
      error: 'Too many requests. Please wait a moment and try again.',
    });
  }

  record.count += 1;
  return next();
}

// Periodically clean expired rate-limit entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

// Input sanitization helper to strip control chars and enforce length limits
function sanitizeString(input: unknown, maxLength: number, fallback = ''): string {
  if (typeof input !== 'string') return fallback;
  return input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

// Initialize Gemini Client server-side with required headers
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Rule-based fallback evaluator for trading setups
function evaluateSetupLocally(data: {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
  indicators: string[];
  notes?: string;
  language?: string;
}) {
  const { symbol, side, entryPrice, stopLoss, takeProfit, indicators = [] } = data;
  const isBn = data.language === 'bn';
  const precision = entryPrice > 0 && entryPrice < 10 ? 4 : 2;

  if (
    !Number.isFinite(entryPrice) ||
    !Number.isFinite(stopLoss) ||
    !Number.isFinite(takeProfit) ||
    entryPrice <= 0 ||
    stopLoss <= 0 ||
    takeProfit <= 0
  ) {
    return {
      riskRewardRatio: 0,
      verdict: 'INVALID' as const,
      score: 0,
      feedback: isBn
        ? 'এন্ট্রি প্রাইস, স্টপ লস এবং টেক প্রফিট সঠিকভাবে প্রদান করুন।'
        : 'Please provide valid positive Entry Price, Stop Loss, and Take Profit values.',
      checklist: [
        { item: isBn ? 'সঠিক এন্ট্রি ও স্টপ লস নির্ধারণ' : 'Valid Entry & Stop Loss', passed: false },
        { item: isBn ? 'ন্যূনতম ১:২ রিস্ক-রিওয়ার্ড' : 'Minimum 1:2 Risk to Reward', passed: false },
        { item: isBn ? 'টেকনিক্যাল কনফ্লুয়েন্স (ইন্ডিকেটর সাপোর্ট)' : 'Technical Confluence', passed: false },
      ],
      riskAdvice: isBn ? 'কখনও স্টপ লস ছাড়া ট্রেড করবেন না।' : 'Never enter a trade without an active Stop Loss.',
      psychologyTip: isBn ? 'প্ল্যান মেনে চলুন, আবেগের বশে ট্রেড করবেন না।' : 'Trade your plan, not your emotions.',
    };
  }

  // Math validation
  let riskPerUnit = 0;
  let rewardPerUnit = 0;
  let isValid = true;
  let logicError = '';

  if (side === 'LONG') {
    if (stopLoss >= entryPrice) {
      isValid = false;
      logicError = isBn
        ? 'লং (BUY) ট্রেডের জন্য স্টপ লস এন্ট্রি প্রাইসের নিচে হতে হবে।'
        : 'For a LONG trade, Stop Loss must be strictly below Entry Price.';
    }
    if (takeProfit <= entryPrice) {
      isValid = false;
      logicError = isBn
        ? 'লং (BUY) ট্রেডের জন্য টেক প্রফিট এন্ট্রি প্রাইসের উপরে হতে হবে।'
        : 'For a LONG trade, Take Profit must be strictly above Entry Price.';
    }
    riskPerUnit = entryPrice - stopLoss;
    rewardPerUnit = takeProfit - entryPrice;
  } else {
    // SHORT
    if (stopLoss <= entryPrice) {
      isValid = false;
      logicError = isBn
        ? 'শর্ট (SELL) ট্রেডের জন্য স্টপ লস এন্ট্রি প্রাইসের উপরে হতে হবে।'
        : 'For a SHORT trade, Stop Loss must be strictly above Entry Price.';
    }
    if (takeProfit >= entryPrice) {
      isValid = false;
      logicError = isBn
        ? 'শর্ট (SELL) ট্রেডের জন্য টেক প্রফিট এন্ট্রি প্রাইসের নিচে হতে হবে।'
        : 'For a SHORT trade, Take Profit must be strictly below Entry Price.';
    }
    riskPerUnit = stopLoss - entryPrice;
    rewardPerUnit = entryPrice - takeProfit;
  }

  if (!isValid || riskPerUnit <= 0) {
    return {
      riskRewardRatio: 0,
      verdict: 'INVALID' as const,
      score: 25,
      feedback: logicError || (isBn ? 'প্রাইস লেভেল লজিক সঠিক নয়।' : 'Invalid price level hierarchy.'),
      checklist: [
        { item: isBn ? 'লজিক্যাল প্রাইস সিকোয়েন্স' : 'Logical Price Sequence', passed: false },
        { item: isBn ? 'ন্যূনতম ১:২ রিস্ক-রিওয়ার্ড' : 'Min 1:2 Risk to Reward', passed: false },
        { item: isBn ? 'মাল্টিপল কনফ্লুয়েন্স' : 'Multiple Confluences', passed: indicators.length >= 2 },
      ],
      riskAdvice: isBn
        ? 'লং ট্রেডে SL সবসময় এন্ট্রির নিচে এবং শর্ট ট্রেডে SL সবসময় এন্ট্রির উপরে থাকবে।'
        : 'For Long, SL is below Entry; for Short, SL is above Entry.',
      psychologyTip: isBn
        ? 'ভুল সেটআপে প্রবেশের চেয়ে সুযোগ মিস হওয়া ভালো।'
        : 'Missing an opportunity is far better than entering a flawed setup.',
    };
  }

  const rrRatio = Number((rewardPerUnit / riskPerUnit).toFixed(2));
  let score = 50;
  const checklist = [
    {
      item: isBn ? 'লজিক্যাল স্টপ লস ও টেক প্রফিট সেট' : 'Logical SL and TP Configuration',
      passed: true,
    },
    {
      item: isBn ? 'রিস্ক-রিওয়ার্ড রেশিও ন্যূনতম ১:২' : 'Risk:Reward Ratio >= 1:2',
      passed: rrRatio >= 2.0,
    },
    {
      item: isBn ? 'ন্যূনতম ২টি টেকনিক্যাল ইন্ডিকেটর কনফ্লুয়েন্স' : 'At least 2 technical confluences',
      passed: indicators.length >= 2,
    },
    {
      item: isBn ? 'স্টপ লস ডিসিপ্লিন (Tight but not suffocated)' : 'Stop Loss Discipline',
      passed: riskPerUnit / entryPrice <= 0.08,
    },
  ];

  if (rrRatio >= 2.0) score += 25;
  else if (rrRatio >= 1.5) score += 15;
  else score -= 10;

  if (indicators.length >= 3) score += 20;
  else if (indicators.length >= 1) score += 10;

  score = Math.min(95, Math.max(30, score));

  let verdict: 'STRONG' | 'MODERATE' | 'HIGH_RISK' = 'MODERATE';
  if (score >= 75) verdict = 'STRONG';
  else if (score < 55) verdict = 'HIGH_RISK';

  let feedback = '';
  if (isBn) {
    feedback = `${symbol} পেয়ারে আপনার ${side} সেটআপটি বিশ্লেষণ করা হয়েছে। আপনার রিস্ক-রিওয়ার্ড রেশিও ১:${rrRatio}। `;
    if (rrRatio >= 2) {
      feedback += `এই R:R রেশিও চমৎকার, যা দীর্ঘমেয়াদে লাভজনক ট্রেডিংয়ের জন্য আদর্শ। `;
    } else {
      feedback += `আপনার টার্গেট প্রফিট স্টপ লসের তুলনায় কম। টেক প্রফিট একটু বাড়িয়ে অন্তত ১:২ রেশিও নিশ্চিত করার চেষ্টা করুন। `;
    }
    if (indicators.length >= 2) {
      feedback += `আপনি ${indicators.length}টি কনফ্লুয়েন্স যুক্ত করেছেন (${indicators.join(', ')}), যা ট্রেডের সম্ভাব্য সফলতার হার বাড়ায়।`;
    } else {
      feedback += `কমপক্ষে ২টি পৃথক কনফ্লুয়েন্স (যেমন সাপোর্ট বাউন্স + RSI ওভারসোল্ড) নিশ্চিত করে ট্রেডে এন্ট্রি নিন।`;
    }
  } else {
    feedback = `Analysis for ${symbol} ${side}: Risk:Reward is 1:${rrRatio}. `;
    if (rrRatio >= 2) {
      feedback += `Excellent R:R ratio, aligning with professional risk management standards. `;
    } else {
      feedback += `R:R ratio is below the recommended 1:2 threshold. Consider adjusting Take Profit or tightening Stop Loss. `;
    }
    feedback += `Confluences tracked: ${indicators.length > 0 ? indicators.join(', ') : 'None specified'}.`;
  }

  const riskAdvice = isBn
    ? `আপনার মোট ক্যাপিটালের ১% বা সর্বোচ্চ ২% এর বেশি রিস্ক নেবেন না। আপনার বর্তমান রিস্ক প্রতি ইউনিটে $${riskPerUnit.toFixed(precision)}।`
    : `Risk strictly 1% to 2% of your total balance. Your current risk per unit is $${riskPerUnit.toFixed(precision)}.`;

  const psychologyTip = isBn
    ? 'ট্রেড ওপেন করার পর বারবার চার্ট দেখে অধৈর্য হবেন না। স্টপ লস বা টেক প্রফিট হিট হওয়া পর্যন্ত ট্রেডকে তার গতিতে চলতে দিন।'
    : 'Once entered, avoid micromanaging the trade. Let the market hit your TP or SL without emotional intervention.';

  return {
    riskRewardRatio: rrRatio,
    verdict,
    score,
    feedback,
    checklist,
    riskAdvice,
    psychologyTip,
  };
}

// API endpoint to analyze trade setup
app.post('/api/analyze-trade', apiRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const symbol = sanitizeString(body.symbol, 20, 'BTC/USDT');
    const side: 'LONG' | 'SHORT' = body.side === 'SHORT' ? 'SHORT' : 'LONG';
    const entryPrice = Number(body.entryPrice) || 0;
    const stopLoss = Number(body.stopLoss) || 0;
    const takeProfit = Number(body.takeProfit) || 0;
    const timeframe = sanitizeString(body.timeframe, 10, '1h');
    const notes = sanitizeString(body.notes, 500, '');
    const language = sanitizeString(body.language, 10, 'en');
    const indicators: string[] = Array.isArray(body.indicators)
      ? body.indicators
          .slice(0, 10)
          .map((item: unknown) => sanitizeString(item, 100))
          .filter(Boolean)
      : [];

    const baseLocalEval = evaluateSetupLocally({
      symbol,
      side,
      entryPrice,
      stopLoss,
      takeProfit,
      timeframe,
      indicators,
      notes,
      language,
    });

    const languageMap: Record<string, string> = {
      en: 'English',
      bn: 'Bengali (বাংলা)',
      hi: 'Hindi (हिन्दी)',
      ur: 'Urdu (اردو)',
      ar: 'Arabic (العربية)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      pt: 'Portuguese (Português)',
      id: 'Indonesian (Bahasa Indonesia)',
      ms: 'Malay (Bahasa Melayu)',
      ru: 'Russian (Русский)',
      tr: 'Turkish (Türkçe)',
      'zh-CN': 'Simplified Chinese (简体中文)',
      ja: 'Japanese (日本語)',
      ko: 'Korean (한국어)',
      vi: 'Vietnamese (Tiếng Việt)',
    };
    const targetLangName = languageMap[language] || 'English';

    // If Gemini client is available and setup is valid math, use Gemini 3.8 Flash for deep mentor review
    if (aiClient && baseLocalEval.verdict !== 'INVALID') {
      let timer: NodeJS.Timeout | undefined;
      try {
        const prompt = `You are a world-class institutional trading mentor and technical analyst at Tradebd.
Analyze this user trade setup and provide structured, actionable advice.

Trade Setup Details:
- Symbol: ${symbol}
- Direction: ${side}
- Timeframe: ${timeframe}
- Entry Price: $${entryPrice}
- Stop Loss: $${stopLoss}
- Take Profit: $${takeProfit}
- Calculated Risk:Reward: 1:${baseLocalEval.riskRewardRatio}
- Technical Indicators & Confluences: ${indicators.join(', ') || 'None provided'}
- User Notes/Strategy: ${notes || 'None'}

Target Language: ${targetLangName} (Keep standard trading terms like Stop Loss, Support, Resistance, RSI, Breakout where natural).

Provide a JSON response with the following schema:
{
  "score": number between 30 and 95,
  "verdict": "STRONG" | "MODERATE" | "HIGH_RISK",
  "feedback": "2-3 comprehensive sentences explaining the setup strength, validity of SL/TP, and confluence",
  "riskAdvice": "Clear advice on position sizing and stop loss discipline for this specific trade",
  "psychologyTip": "An actionable mindset/psychology reminder to prevent FOMO or revenge trading"
}`;

        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('AI timeout')), 4500);
        });

        const response = (await Promise.race([
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
          timeoutPromise,
        ])) as any;

        const text = response?.text;
        if (text) {
          const parsed = JSON.parse(text);
          const validVerdicts = ['STRONG', 'MODERATE', 'HIGH_RISK'];
          return res.json({
            status: 'success',
            evaluation: {
              ...baseLocalEval,
              score:
                typeof parsed.score === 'number' && Number.isFinite(parsed.score)
                  ? Math.min(95, Math.max(30, Math.round(parsed.score)))
                  : baseLocalEval.score,
              verdict: validVerdicts.includes(parsed.verdict)
                ? parsed.verdict
                : baseLocalEval.verdict,
              feedback:
                typeof parsed.feedback === 'string' && parsed.feedback.trim()
                  ? parsed.feedback.trim()
                  : baseLocalEval.feedback,
              riskAdvice:
                typeof parsed.riskAdvice === 'string' && parsed.riskAdvice.trim()
                  ? parsed.riskAdvice.trim()
                  : baseLocalEval.riskAdvice,
              psychologyTip:
                typeof parsed.psychologyTip === 'string' && parsed.psychologyTip.trim()
                  ? parsed.psychologyTip.trim()
                  : baseLocalEval.psychologyTip,
            },
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local evaluator');
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    // Return the robust local evaluation
    return res.json({
      status: 'success',
      evaluation: baseLocalEval,
    });
  } catch (error) {
    console.error('Error analyzing trade setup:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while analyzing trade setup',
    });
  }
});

// Quick FAQ or Ask Mentor chat route
app.post('/api/ask-mentor', apiRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const question = sanitizeString(body.question, 500, '');
    const language = sanitizeString(body.language, 10, 'en');

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const isBn = language === 'bn';

    const languageMap: Record<string, string> = {
      en: 'English',
      bn: 'Bengali (বাংলা)',
      hi: 'Hindi (हिन्दी)',
      ur: 'Urdu (اردو)',
      ar: 'Arabic (العربية)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      pt: 'Portuguese (Português)',
      id: 'Indonesian (Bahasa Indonesia)',
      ms: 'Malay (Bahasa Melayu)',
      ru: 'Russian (Русский)',
      tr: 'Turkish (Türkçe)',
      'zh-CN': 'Simplified Chinese (简体中文)',
      ja: 'Japanese (日本語)',
      ko: 'Korean (한국어)',
      vi: 'Vietnamese (Tiếng Việt)',
    };
    const targetLangName = languageMap[language] || 'English';

    if (aiClient) {
      let timer: NodeJS.Timeout | undefined;
      try {
        const prompt = `You are a senior institutional trading coach at Tradebd.
Answer this trader's question directly, clearly, and practically.
Question: "${question}"
Language: ${targetLangName} (with standard trading terminology e.g. Risk:Reward, Stop Loss, RSI, Breakout).
Keep the answer under 120 words, structured with 2-3 bullet points if helpful.`;

        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('AI timeout')), 4500);
        });

        const response = (await Promise.race([
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          }),
          timeoutPromise,
        ])) as any;

        const answer = response?.text;
        if (typeof answer === 'string' && answer.trim()) {
          return res.json({ answer: answer.trim() });
        }
      } catch (err) {
        console.warn('Gemini chat failed, fallback response used');
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    // Default answers for common trading queries
    const fallbackAnswers: Record<string, string> = {
      default: isBn
        ? 'ট্রেডিংয়ে সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো ক্যাপিটাল প্রিজার্ভেশন বা মূলধন সুরক্ষা। প্রতিটি ট্রেডে একাউন্টের ১-২% এর বেশি ঝুঁকি নেবেন না এবং সর্বদা ১:২ বা তার বেশি রিস্ক-রিওয়ার্ড মেনে চলুন।'
        : 'The core of trading is capital preservation. Never risk more than 1-2% per trade and always maintain at least a 1:2 Risk:Reward ratio.',
    };

    return res.json({ answer: fallbackAnswers.default });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server-side Blog Articles storage & Admin Authentication for user-published SEO articles
const blogsDataFile = path.resolve(__dirname, 'public', 'blogs-data.json');
function loadStoredBlogs(): any[] {
  try {
    if (fs.existsSync(blogsDataFile)) {
      const raw = fs.readFileSync(blogsDataFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore read error
  }
  return [];
}
function saveStoredBlogs(articles: any[]) {
  try {
    fs.writeFileSync(blogsDataFile, JSON.stringify(articles, null, 2), 'utf-8');
  } catch {
    // ignore write error in read-only environments
  }
}

const serverCustomBlogs: any[] = loadStoredBlogs();
let serverAdminPassword = process.env.BLOG_ADMIN_PASSWORD || 'Tradebd@2026';

app.get(['/api/blogs', '/api-blogs.php'], (_req, res) => {
  res.json({
    status: 'success',
    articles: serverCustomBlogs,
  });
});

app.post(['/api/blogs', '/api-blogs.php'], apiRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const action = body.action;
    const adminKey = typeof body.adminKey === 'string' ? body.adminKey : '';

    if (action === 'translate') {
      const text = typeof body.text === 'string' ? body.text : '';
      const sourceLang = typeof body.sourceLang === 'string' ? body.sourceLang : 'auto';
      const targetLang = typeof body.targetLang === 'string' ? body.targetLang : 'en';
      if (!text.trim()) {
        return res.json({ status: 'success', translatedText: text });
      }
      try {
        const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
          sourceLang
        )}&tl=${encodeURIComponent(targetLang)}&dt=t`;
        const gtxRes = await fetch(gtxUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0',
          },
          body: `q=${encodeURIComponent(text)}`,
        });
        if (gtxRes.ok) {
          const gtxJson = (await gtxRes.json()) as any;
          if (Array.isArray(gtxJson) && Array.isArray(gtxJson[0])) {
            const out = gtxJson[0]
              .map((seg: any) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
              .join('');
            if (out.trim()) {
              return res.json({ status: 'success', translatedText: out });
            }
          }
        }
      } catch {
        // fallback below
      }
      return res.json({ status: 'success', translatedText: text });
    }

    if (action === 'verify') {
      if (adminKey && adminKey === serverAdminPassword) {
        return res.json({ status: 'success', authenticated: true });
      }
      return res.status(401).json({
        status: 'error',
        authenticated: false,
        message: 'Invalid Admin Password',
      });
    }

    if (!adminKey || adminKey !== serverAdminPassword) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Valid Admin Password is required.',
      });
    }

    if (action === 'change_password') {
      const nextPass = sanitizeString(body.newPassword, 100, '');
      if (nextPass.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters.',
        });
      }
      serverAdminPassword = nextPass;
      return res.json({ status: 'success', message: 'Password updated successfully' });
    }

    if (action === 'save' && body.article && typeof body.article === 'object') {
      const art = body.article;
      const id = sanitizeString(art.id, 80, `custom-${Date.now()}`);
      const existingIdx = serverCustomBlogs.findIndex((b) => b.id === id);
      if (existingIdx !== -1) {
        serverCustomBlogs.splice(existingIdx, 1);
      }
      serverCustomBlogs.unshift({ ...art, id });
      saveStoredBlogs(serverCustomBlogs);
      return res.json({
        status: 'success',
        articles: serverCustomBlogs,
      });
    }

    if (action === 'delete' && body.id) {
      const delId = String(body.id);
      const idx = serverCustomBlogs.findIndex((b) => b.id === delId);
      if (idx !== -1) {
        serverCustomBlogs.splice(idx, 1);
      }
      saveStoredBlogs(serverCustomBlogs);
      return res.json({
        status: 'success',
        articles: serverCustomBlogs,
      });
    }

    return res.status(400).json({ status: 'error', message: 'Invalid blog action' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to process blog request' });
  }
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tradebd server running on http://0.0.0.0:${PORT}`);
  });
}

start();
