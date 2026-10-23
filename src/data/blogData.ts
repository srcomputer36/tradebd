export type BlogCategory =
  | 'ALL'
  | 'FOREX'
  | 'CRYPTO'
  | 'PATTERNS'
  | 'RISK'
  | 'SESSIONS'
  | 'PSYCHOLOGY';

export interface BlogFaqItem {
  question: string;
  answer: string;
  questionEn?: string;
  answerEn?: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  excerptBn: string;
  excerptEn: string;
  contentBn: string;
  contentEn: string;
  category: Exclude<BlogCategory, 'ALL'>;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  keywords: string[];
  keyTakeawaysBn: string[];
  keyTakeawaysEn: string[];
  faqs?: BlogFaqItem[];
  featured?: boolean;
  isCustom?: boolean;
  ctaTab?: 'CHART' | 'SIMULATOR' | 'CALENDAR' | 'CALCULATOR' | 'PATTERNS' | 'ACADEMY' | 'MENTOR';
}

export const BLOG_CATEGORIES: {
  id: BlogCategory;
  labelBn: string;
  labelEn: string;
  badgeColor: string;
}[] = [
  {
    id: 'ALL',
    labelBn: 'সব আর্টিকেল (All)',
    labelEn: 'All Articles',
    badgeColor: 'bg-slate-800 text-slate-200 border-slate-700',
  },
  {
    id: 'FOREX',
    labelBn: 'ফরেক্স গাইড (Forex)',
    labelEn: 'Forex Trading',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'CRYPTO',
    labelBn: 'ক্রিপ্টো ও বিটকয়েন (Crypto)',
    labelEn: 'Crypto & Bitcoin',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'PATTERNS',
    labelBn: 'ক্যান্ডেলস্টিক ও চার্ট (Chart)',
    labelEn: 'Candlestick & Price Action',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'RISK',
    labelBn: 'রিস্ক ও মানি ম্যানেজমেন্ট',
    labelEn: 'Risk Management',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  {
    id: 'SESSIONS',
    labelBn: 'মার্কেট সেশন ও নিউজ (BST)',
    labelEn: 'Sessions & Economic News',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    id: 'PSYCHOLOGY',
    labelBn: 'ট্রেডিং সাইকোলজি',
    labelEn: 'Trading Psychology',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
];

export const INITIAL_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-1',
    slug: 'forex-trading-bangla-complete-guide',
    titleBn: 'ফরেক্স ট্রেডিং কি এবং নতুনরা শূন্য থেকে কিভাবে ট্রেডিং শেখা শুরু করবেন? (পূর্ণাঙ্গ বাংলা গাইড)',
    titleEn: 'What is Forex Trading & How Beginners Can Start Learning from Scratch (Complete Guide)',
    excerptBn:
      'ফরেক্স মার্কেট কীভাবে কাজ করে, কারেন্সি পেয়ার (EUR/USD, GBP/USD), পিপস, লট সাইজ এবং আসল টাকা ঝুঁকিতে না ফেলে ডেমো বা পেপার ট্রেডিং করার সঠিক নিয়ম বিস্তারিত জানুন।',
    excerptEn:
      'Learn how the global foreign exchange market works, currency pairs (EUR/USD, GBP/USD), pips, lot sizes, and how to practice risk-free using virtual paper trading.',
    category: 'FOREX',
    author: 'Tradebd Editorial Team',
    publishedAt: '2026-10-18',
    readTimeMinutes: 7,
    featured: true,
    ctaTab: 'SIMULATOR',
    keywords: [
      'ফরেক্স ট্রেডিং বাংলা',
      'ফরেক্স ট্রেডিং কি',
      'ট্রেডিং শেখার নিয়ম',
      'ডেমো ট্রেডিং একাউন্ট',
      'Forex Trading Bangla Guide',
      'Learn Forex Bangladesh',
    ],
    keyTakeawaysBn: [
      'ফরেক্স (Forex) হলো বিশ্বের সবচেয়ে বড় বৈদেশিক মুদ্রা বিনিময় বাজার যেখানে প্রতিদিন প্রায় ৭.৫ ট্রিলিয়ন ডলার লেনদেন হয়।',
      'নতুনদের সর্বদা কমপক্ষে ৩ থেকে ৬ মাস ভার্চুয়াল ডেমো বা পেপার ট্রেডিং সিমুলেটরে প্র্যাকটিস করা উচিত।',
      'প্রতিটি ট্রেডে স্টপ লস (Stop Loss) ব্যবহার করা এবং মোট ব্যালেন্সের ১%-২% এর বেশি ঝুঁকি না নেওয়া সফল ট্রেডারদের প্রধান নিয়ম।',
    ],
    keyTakeawaysEn: [
      'Forex (Foreign Exchange) is the world’s largest financial market with over $7.5 trillion in daily trading volume.',
      'Beginners should always practice for at least 3 to 6 months on a virtual paper trading simulator before risking real capital.',
      'Using a Stop Loss on every trade and risking no more than 1%–2% of total balance is the golden rule of professional traders.',
    ],
    contentBn: `## ফরেক্স ট্রেডিং (Forex Trading) আসলে কী?
ফরেক্স (Forex বা FX) শব্দটি এসেছে **Foreign Exchange** থেকে। সহজ ভাষায়, একটি দেশের মুদ্রার বিপরীতে অন্য একটি দেশের মুদ্রা ক্রয়-বিক্রয় করার আন্তর্জাতিক বাজারকে ফরেক্স মার্কেট বলা হয়। যেমন—ইউরো এবং মার্কিন ডলারের পেয়ার **EUR/USD**, অথবা ব্রিটিশ পাউন্ড ও ডলারের পেয়ার **GBP/USD**।

বিশ্বের কেন্দ্রীয় ব্যাংক, প্রাতিষ্ঠানিক ফান্ড, বহুজাতিক কর্পোরেশন এবং খুচরা ট্রেডাররা এই মার্কেটে অংশ নেন। সপ্তাহে ৫ দিন (সোমবার ভোর থেকে শুক্রবার রাত পর্যন্ত) ২৪ ঘণ্টা ফরেক্স মার্কেট খোলা থাকে।

## কারেন্সি পেয়ার (Currency Pair) কীভাবে কাজ করে?
ফরেক্স মার্কেটে সবসময় দুটি মুদ্রা জোড়ায় বা পেয়ারে লেনদেন হয়। উদাহরণস্বরূপ **EUR/USD = 1.0850**।
• **Base Currency (প্রথম মুদ্রা):** এখানে EUR হলো বেস কারেন্সি।
• **Quote Currency (দ্বিতীয় মুদ্রা):** এখানে USD হলো কোট কারেন্সি।
• **Buy / Long কখন করবেন?** যখন আপনার টেকনিক্যাল অ্যানালাইসিস অনুযায়ী প্রথম মুদ্রাটি (EUR) শক্তিশালী হওয়ার সম্ভাবনা থাকে।
• **Sell / Short কখন করবেন?** যখন প্রথম মুদ্রাটি দুর্বল হওয়ার বা দাম কমার সম্ভাবনা থাকে।

💡 **প্রো টিপ:** নতুন অবস্থায় একসাথে ১০-১৫টি পেয়ার ট্র্যাক না করে শুধুমাত্র ১ বা ২টি মেজর পেয়ার (যেমন **EUR/USD** অথবা **BTC/USDT**) নিয়ে প্র্যাকটিস শুরু করুন। এতে মার্কেটের আচরণ দ্রুত বুঝতে পারবেন।

## পিপস (Pips), স্প্রেড (Spread) এবং লট সাইজ (Lot Size) কী?
ট্রেডিং শুরু করার আগে এই ৩টি মৌলিক শব্দ অবশ্যই পরিষ্কারভাবে বুঝতে হবে:
• **পিপ (Pip - Percentage in Point):** কারেন্সি পেয়ারের দশমিকের পর ৪র্থ ঘরের পরিবর্তনকে ১ পিপ বলা হয়। যেমন EUR/USD যদি 1.0850 থেকে বেড়ে 1.0865 হয়, তবে দাম **১৫ পিপস** বেড়েছে।
• **লট সাইজ (Lot Size):** আপনি কী পরিমাণ ইউনিট ক্রয় বা বিক্রয় করছেন তার পরিমাপ। স্ট্যান্ডার্ড লট (1.00), মিনি লট (0.10) এবং মাইক্রো লট (0.01)। ছোট ব্যালেন্সে সবসময় 0.01 মাইক্রো লট বা ছোট পজিশন সাইজ ব্যবহার করা নিরাপদ।
• **লিভারেজ (Leverage):** কম মার্জিন দিয়ে বড় পজিশন নেওয়ার সুবিধা। তবে মনে রাখবেন, অতিরিক্ত লিভারেজ (যেমন 50x বা 100x) ব্যবহার করলে সামান্য বিপরীত মুভমেন্টেই একাউন্ট লিকুইডেট হতে পারে। নতুনদের জন্য **1x থেকে 5x** লিভারেজ সবচেয়ে আদর্শ।

## নতুনরা কীভাবে ধাপে ধাপে ট্রেডিং শিখবেন?
১. **মার্কেট স্ট্রাকচার ও ক্যান্ডেলস্টিক চেনা:** প্রথমে চার্ট দেখে আপট্রেন্ড (Higher Highs), ডাউনট্রেন্ড (Lower Lows) এবং সাইডওয়েজ বা রেঞ্জিং মার্কেট চিনতে শিখুন।
২. **সাপোর্ট ও রেজিস্ট্যান্স চিহ্নিত করা:** চার্টের যে লেভেল থেকে দাম বারবার উপরে বাউন্স করে তা হলো সাপোর্ট (Support), আর যেখান থেকে বাধা পেয়ে নিচে নামে তা হলো রেজিস্ট্যান্স (Resistance)।
৩. **রিস্ক-রিওয়ার্ড রেশিও (Risk:Reward Ratio):** এমন ট্রেড সেটআপ খুঁজুন যেখানে আপনার ঝুঁকি যদি হয় ১০ ডলার, সম্ভাব্য লাভের লক্ষ্যমাত্রা অন্তত ২০ ডলার (অর্থাৎ **১:২ রেশিও**)।
৪. **ভার্চুয়াল পেপার ট্রেডিংয়ে অনুশীলন:** কোনো রেজিস্ট্রেশন বা ডিপোজিট ছাড়াই **Tradebd Paper Trading Simulator**-এ আপনার বাস্তব লক্ষ্যমাত্রার সমান ডেমো ব্যালেন্স (যেমন $100 বা $1,000) সেট করে অন্তত ৫০টি ট্রেড প্র্যাকটিস করুন।

⚠️ **সতর্কবার্তা:** ট্রেডিং কোনো রাতারাতি ধনী হওয়ার স্কিম নয়। এটি একটি প্রফেশনাল স্কিল যা ধৈর্য, চার্ট রিডিং এবং কঠোর মানি ম্যানেজমেন্টের মাধ্যমে অর্জন করতে হয়।`,
    contentEn: `## What is Forex Trading?
The term **Forex (FX)** stands for **Foreign Exchange**. Simply put, it is the global decentralized market where one country's currency is exchanged for another. Common examples include the Euro against the US Dollar (**EUR/USD**) or the British Pound against the US Dollar (**GBP/USD**).

Central banks, institutional hedge funds, multinational corporations, and retail traders participate in this market 24 hours a day, 5 days a week (Monday morning through Friday night).

## How Do Currency Pairs Work?
In the Forex market, currencies are always quoted in pairs—for example, **EUR/USD = 1.0850**.
• **Base Currency (First Currency):** Here, EUR is the base currency.
• **Quote Currency (Second Currency):** Here, USD is the quote currency.
• **When to Buy / Go Long?** When your technical analysis indicates the base currency (EUR) is likely to strengthen against the quote currency.
• **When to Sell / Go Short?** When your analysis shows the base currency is likely to weaken or drop in value.

💡 **Pro Tip:** As a beginner, avoid tracking 15 pairs at once. Focus on just 1 or 2 major pairs (such as **EUR/USD** or **BTC/USDT**) to master their price action and volatility patterns.

## Understanding Pips, Spread, Lot Size & Leverage
Before placing any order, you must understand these core concepts:
• **Pip (Percentage in Point):** The fourth decimal place in most currency pairs. If EUR/USD moves from 1.0850 to 1.0865, it has moved **15 pips**.
• **Lot Size:** Measures your trade volume—Standard Lot (1.00), Mini Lot (0.10), and Micro Lot (0.01). On smaller accounts, always stick to micro lots or conservative position sizing.
• **Leverage:** Allows you to control a larger position with smaller margin. However, high leverage (50x or 100x) can liquidate your account on a minor price fluctuation. Beginners should stick to **1x to 5x** leverage.

## Step-by-Step Roadmap for Beginners
1. **Read Market Structure & Candlesticks:** Learn to spot Uptrends (Higher Highs & Higher Lows), Downtrends (Lower Highs & Lower Lows), and sideways consolidation.
2. **Identify Support & Resistance Zones:** Support is a price floor where buyers step in; Resistance is a price ceiling where sellers take profit.
3. **Follow a 1:2 Risk-to-Reward Ratio:** Only take setups where your potential profit is at least double your stop-loss risk (e.g., risking $10 to make $20).
4. **Practice in Virtual Paper Trading:** Use the **Tradebd Paper Trading Simulator** with a custom realistic demo balance ($100 or $1,000) to execute at least 50 practice trades without financial risk.

⚠️ **Risk Warning:** Trading is not a get-rich-quick scheme. It is a professional analytical skill built through patience, chart reading, and strict risk management.`,
    faqs: [
      {
        question: 'ট্রেডিং শেখার জন্য কত টাকা ডিপোজিট করা দরকার?',
        answer:
          'ট্রেডিং শেখার জন্য ১ টাকাও ডিপোজিট করার প্রয়োজন নেই। আপনি Tradebd এর ফ্রি ভার্চুয়াল পেপার ট্রেডিং সিমুলেটরে ইচ্ছেমতো ডেমো ব্যালেন্স নিয়ে সম্পূর্ণ বিনামূল্যে প্র্যাকটিস করতে পারেন।',
        questionEn: 'How much money do I need to deposit to learn trading?',
        answerEn:
          'You do not need to deposit a single dollar to learn trading. You can practice 100% free on the Tradebd Virtual Paper Trading Simulator using any custom demo balance you choose.',
      },
      {
        question: 'নতুনদের জন্য কোন টাইমফ্রেম (Timeframe) সবচেয়ে ভালো?',
        answer:
          'নতুনদের জন্য 15m (১৫ মিনিট), 1h (১ ঘণ্টা) এবং 4h (৪ ঘণ্টা) টাইমফ্রেম সবচেয়ে ভালো, কারণ এতে ফেক আউট বা মার্কেট নয়েজ কম থাকে।',
        questionEn: 'Which chart timeframe is best for beginners?',
        answerEn:
          'The 15m (15-minute), 1h (1-hour), and 4h (4-hour) timeframes are ideal for beginners because they filter out random market noise and false breakouts.',
      },
    ],
  },
  {
    id: 'blog-2',
    slug: 'candlestick-chart-patterns-bangla-guide',
    titleBn: 'সেরা ৭টি বুলিশ ও বেয়ারিশ ক্যান্ডেলস্টিক চার্ট প্যাটার্ন চেনার সহজ নিয়ম',
    titleEn: 'Top 7 Bullish & Bearish Candlestick Chart Patterns Every Trader Must Know',
    excerptBn:
      'হ্যামার (Hammer), বুলিশ এনগালফিং (Bullish Engulfing), শুটিং স্টার, ডোজি এবং মর্নিং স্টার ক্যান্ডেলস্টিক প্যাটার্ন দেখে মার্কেট রিভার্সাল ও সঠিক এন্ট্রি নেওয়ার কৌশল।',
    excerptEn:
      'Master Hammer, Bullish Engulfing, Shooting Star, Doji, and Morning Star candlestick patterns to spot high-probability market reversals and entries.',
    category: 'PATTERNS',
    author: 'Tradebd Technical Desk',
    publishedAt: '2026-10-19',
    readTimeMinutes: 6,
    featured: true,
    ctaTab: 'PATTERNS',
    keywords: [
      'ক্যান্ডেলস্টিক চার্ট প্যাটার্ন বাংলা',
      'হ্যামার ক্যান্ডেল',
      'বুলিশ এনগালফিং',
      'Candlestick Pattern Bangla',
      'Price Action Trading Bangla',
    ],
    keyTakeawaysBn: [
      'প্রতিটি ক্যান্ডেল ৪টি গুরুত্বপূর্ণ তথ্য দেয়: Open (শুরু), High (সর্বোচ্চ), Low (সর্বনিম্ন) এবং Close (শেষ দাম)।',
      'শুধুমাত্র ক্যান্ডেল দেখেই ট্রেড নেওয়া উচিত নয়—সাপোর্ট বা রেজিস্ট্যান্স লেভেলে প্যাটার্ন তৈরি হলে তবেই তা কার্যকর হয়।',
      'পরবর্তী ক্যান্ডেল ক্লোজ হওয়া (Confirmation) পর্যন্ত অপেক্ষা করলে ফেক ব্রেকআউট থেকে বাঁচা যায়।',
    ],
    keyTakeawaysEn: [
      'Every candlestick reveals 4 key data points: Open, High, Low, and Close (OHLC).',
      'Never trade a candlestick pattern in isolation—it is only high-probability when formed at major Support or Resistance zones.',
      'Waiting for the next candle close confirmation helps you avoid fakeouts.',
    ],
    contentBn: `## ক্যান্ডেলস্টিক চার্ট কেন এত গুরুত্বপূর্ণ?
জাপানি চাল ব্যবসায়ী মুনহিসা হোম্মা অষ্টাদশ শতাব্দীতে ক্যান্ডেলস্টিক চার্ট উদ্ভাবন করেন। একটি সাধারণ লাইন চার্টে শুধু ক্লোজিং প্রাইস দেখা যায়, কিন্তু একটি ক্যান্ডেলস্টিক নির্দিষ্ট সময়ের মধ্যে ক্রেতা (Buyers/Bulls) এবং বিক্রেতাদের (Sellers/Bears) মধ্যকার যুদ্ধের পুরো ছবি তুলে ধরে।

## ১. হ্যামার (Hammer) — শক্তিশালী বুলিশ রিভার্সাল
• **দেখতে কেমন:** ছোট বডি উপরের দিকে থাকে এবং নিচে বডির তুলনায় অন্তত দ্বিগুণ লম্বা শ্যাডো বা উইক (Lower Wick) থাকে।
• **কোথায় খুঁজবেন:** ডাউনট্রেন্ডের শেষে বা শক্তিশালী **সাপোর্ট জোনে (Support Zone)**।
• **মনস্তত্ত্ব:** বিক্রেতারা দাম অনেক নিচে নামিয়েছিল, কিন্তু ক্রেতারা প্রবল শক্তিতে দাম আবার উপরে তুলে ক্লোজ করেছে।
• **এন্ট্রি নিয়ম:** হ্যামার ক্যান্ডেলের হাই (High) ব্রেক করে পরের সবুজ ক্যান্ডেল ক্লোজ হলে Buy/Long এন্ট্রি এবং স্টপ লস হবে হ্যামারের একদম লো (Low)-এর নিচে।

## ২. শুটিং স্টার (Shooting Star) — বেয়ারিশ রিভার্সাল
• **দেখতে কেমন:** হ্যামারের ঠিক উল্টো। নিচে ছোট বডি এবং উপরে লম্বা আপার শ্যাডো (Upper Wick)।
• **কোথায় খুঁজবেন:** আপট্রেন্ডের চূড়ায় বা **রেজিস্ট্যান্স লেভেলে (Resistance Level)**।
• **এন্ট্রি নিয়ম:** শুটিং স্টারের লো ব্রেক করলে Sell/Short এন্ট্রি এবং স্টপ লস হবে লম্বা উইকের উপরে।

## ৩. বুলিশ ও বেয়ারিশ এনগালফিং (Bullish & Bearish Engulfing)
• **বুলিশ এনগালফিং:** ডাউনট্রেন্ডে একটি ছোট লাল ক্যান্ডেলের পর এমন একটি বড় সবুজ ক্যান্ডেল তৈরি হয় যা আগের লাল ক্যান্ডেলের পুরো বডিকে ঢেকে (Engulf) ফেলে। এটি ক্রেতাদের শক্তিশালী দখলের ইঙ্গিত দেয়।
• **বেয়ারিশ এনগালফিং:** আপট্রেন্ডের শেষে একটি ছোট সবুজ ক্যান্ডেলকে পরবর্তী বড় লাল ক্যান্ডেল সম্পূর্ণ ঢেকে ফেলে।

## ৪. মর্নিং স্টার এবং ইভিনিং স্টার (Morning Star & Evening Star)
এটি ৩টি ক্যান্ডেলের সমন্বয়ে গঠিত অত্যন্ত নির্ভরযোগ্য একটি রিভার্সাল প্যাটার্ন:
• **১ম ক্যান্ডেল:** ট্রেন্ডের দিকে বড় ক্যান্ডেল।
• **২য় ক্যান্ডেল:** ছোট বডির ক্যান্ডেল বা ডোজি (মার্কেটে সিদ্ধান্তহীনতা)।
• **৩য় ক্যান্ডেল:** বিপরীত দিকে শক্তিশালী ক্যান্ডেল যা ১ম ক্যান্ডেলের অর্ধেকের বেশি রিকভার করে।

💡 **প্রো টিপ:** ক্যান্ডেলস্টিক প্যাটার্নের সাথে যদি **RSI ওভারসোল্ড (<30)** অথবা **RSI ওভারবট (>70)** মিলে যায়, তবে সেই ট্রেড সেটআপের সফলতার সম্ভাবনা বহুগুণ বেড়ে যায়! আমাদের **Pattern Gallery** ট্যাবে গিয়ে প্রতিটি প্যাটার্নের ভিজ্যুয়াল চিত্র ও এন্ট্রি নিয়ম দেখে নিন।`,
    contentEn: `## Why Candlestick Charts Matter So Much
Invented by Japanese rice merchant Munehisa Homma in the 18th century, candlesticks go far beyond simple line charts. Each candle captures the complete psychological battle between Buyers (Bulls) and Sellers (Bears) during a specific timeframe.

## 1. Hammer — Powerful Bullish Reversal
• **Visual Appearance:** Small body near the top with a lower wick (shadow) at least twice as long as the body.
• **Where to Look:** At the bottom of a downtrend or inside a major **Support Zone**.
• **Market Psychology:** Sellers pushed price aggressively lower, but buyers stepped in with strong demand and pushed the close back near the high.
• **Entry Rule:** Enter Buy/Long when the next candle breaks and closes above the Hammer’s high, placing your Stop Loss just below the Hammer’s low wick.

## 2. Shooting Star — Bearish Reversal
• **Visual Appearance:** The exact opposite of a Hammer—a small lower body with a long upper shadow (Upper Wick).
• **Where to Look:** At the peak of an uptrend or at a key **Resistance Level**.
• **Entry Rule:** Enter Sell/Short when price breaks below the Shooting Star’s low, with your Stop Loss placed safely above the upper wick.

## 3. Bullish & Bearish Engulfing
• **Bullish Engulfing:** Forms at support when a strong green candle completely engulfs the body of the previous red candle, signaling decisive buyer takeover.
• **Bearish Engulfing:** Forms at resistance when a large red candle completely engulfs the prior green candle body.

## 4. Morning Star & Evening Star
A highly reliable 3-candle reversal formation:
• **1st Candle:** Strong continuation candle in the prior trend.
• **2nd Candle:** Small-bodied indecision candle or Doji at a key level.
• **3rd Candle:** Strong reversal impulse candle closing past the midpoint of the first candle.

💡 **Pro Tip:** Combining a candlestick pattern at Support/Resistance with **RSI Oversold (<30)** or **RSI Overbought (>70)** dramatically boosts your win rate! Visit our **Pattern Gallery** tab to inspect interactive diagrams of every pattern.`,
  },
  {
    id: 'blog-3',
    slug: 'risk-management-lot-size-stop-loss-formula',
    titleBn: 'ট্রেডিংয়ে স্টপ লস (Stop Loss), লট সাইজ এবং ১% মানি ম্যানেজমেন্টের গোপন সূত্র',
    titleEn: 'Stop Loss, Position Sizing & The 1% Risk Management Formula for Traders',
    excerptBn:
      'কেন ৯০% নতুন ট্রেডার একাউন্ট জিরো করে? কিভাবে ১% রিস্ক রুল ও ১:২ রিস্ক-রিওয়ার্ড রেশিও ব্যবহার করে মাত্র ৪০% উইন রেটেও প্রফিটেবল থাকা যায় তার গাণিতিক হিসাব।',
    excerptEn:
      'Discover why 90% of beginners blow their accounts and how the 1% risk rule combined with a 1:2 Risk-to-Reward ratio keeps you profitable even with a 40% win rate.',
    category: 'RISK',
    author: 'Tradebd Risk Management Team',
    publishedAt: '2026-10-20',
    readTimeMinutes: 6,
    featured: false,
    ctaTab: 'CALCULATOR',
    keywords: [
      'লট সাইজ ক্যালকুলেটর',
      'মানি ম্যানেজমেন্ট ট্রেডিং',
      'স্টপ লস দেওয়ার নিয়ম',
      'Risk Reward Ratio Bangla',
      'Position Size Calculator Forex',
    ],
    keyTakeawaysBn: [
      'একটি একক ট্রেডে কখনোই আপনার মোট একাউন্ট ব্যালেন্সের ১% থেকে ২%-এর বেশি ঝুঁকি (Risk) নেবেন না।',
      '১:২ রিস্ক-রিওয়ার্ড রেশিও মেনে চললে ১০টি ট্রেডের মধ্যে ৬টিতে লস এবং মাত্র ৪টিতে লাভ করলেও আপনি দিনশেষে লাভে থাকবেন!',
      'ট্রেড নেওয়ার আগেই Tradebd Risk Calculator দিয়ে সঠিক পজিশন সাইজ ও লট সাইজ বের করে নিন।',
    ],
    keyTakeawaysEn: [
      'Never risk more than 1% to 2% of your total account equity on any single trade.',
      'With a 1:2 Risk:Reward ratio, losing 6 out of 10 trades and winning only 4 still leaves you in net profit!',
      'Always calculate your exact lot size using the Tradebd Risk Calculator before placing an order.',
    ],
    contentBn: `## কেন বেশিরভাগ নতুন ট্রেডার লস করেন?
নতুন ট্রেডারদের প্রধান ভুল চার্ট অ্যানালাইসিসে নয়, বরং **মানি ম্যানেজমেন্টে (Money Management)**। অনেকেই $100 ব্যালেন্স নিয়ে এক ট্রেডেই $30 বা $50 ঝুঁকি নিয়ে ফেলেন। ফলে পরপর ২-৩টি ট্রেড স্টপ লস হিট করলেই পুরো মূলধন শেষ হয়ে যায় এবং মানসিক চাপে ভুল ট্রেড (Revenge Trading) শুরু হয়।

## ১% রিস্ক রুল (The 1% Golden Rule) কী?
প্রাতিষ্ঠানিক ও প্রফেশনাল ট্রেডাররা একটি সহজ নিয়ম মেনে চলেন: **একটি ট্রেডে স্টপ লস হিট করলে যেন মোট ব্যালেন্সের ১% বা সর্বোচ্চ ২%-এর বেশি লস না হয়।**
• আপনার ব্যালেন্স যদি হয় **$1,000**, তবে প্রতি ট্রেডে সর্বোচ্চ ঝুঁকি হবে **$10 থেকে $20**।
• আপনার ব্যালেন্স যদি হয় **$100**, তবে প্রতি ট্রেডে সর্বোচ্চ ঝুঁকি হবে **$1 থেকে $2**।
এর সবচেয়ে বড় সুবিধা হলো—টানা ১০টি ট্রেডে লস হলেও আপনার একাউন্টের ৯০% ব্যালেন্স সুরক্ষিত থাকবে!

## ১:২ রিস্ক-রিওয়ার্ড রেশিওর (1:2 R:R) জাদুকরী গণিত
ধরুন আপনি মোট ১০টি ট্রেড নিলেন। প্রতিটি ট্রেডে আপনার ঝুঁকি (Stop Loss) **$10** এবং টার্গেট প্রফিট (Take Profit) **$20** (অর্থাৎ ১:২ রেশিও)।
• **৬টি ট্রেডে লস:** 6 × $10 = **-$60 লস**
• **৪টি ট্রেডে লাভ:** 4 × $20 = **+$80 লাভ**
• **নিট ফলাফল:** $80 - $60 = **+$20 নিট প্রফিট!**

লক্ষ্য করুন—আপনি ১০টির মধ্যে ৬টি ট্রেডে ভুল হওয়ার পরেও (মাত্র ৪০% উইন রেট) শুধুমাত্র সঠিক রিস্ক-রিওয়ার্ড রেশিওর কারণে লাভজনক অবস্থানে আছেন!

## সঠিক পজিশন ও লট সাইজ বের করার সূত্র
সঠিক পজিশন সাইজ বের করার সূত্রটি হলো:
**Position Size = (Account Balance × Risk %) ÷ |Entry Price - Stop Loss Price|**

💡 **প্রো টিপ:** হাতে হিসাব করার ঝামেলা এড়াতে আমাদের সাইটের **Risk & Lot Calculator** ট্যাবে যান। সেখানে আপনার ব্যালেন্স, এন্ট্রি প্রাইস ও স্টপ লস বসালে ১ সেকেন্ডেই সঠিক লট সাইজ ও পজিশন ভ্যালু পেয়ে যাবেন।`,
    contentEn: `## Why Do Most Beginner Traders Lose Money?
The #1 reason beginners fail is not poor chart analysis, but poor **Money Management**. Many traders with a $100 balance risk $30 or $50 on a single trade. Just two or three consecutive losses wipe out their capital and trigger emotional revenge trading.

## What is the 1% Golden Rule?
Institutional and professional traders follow one non-negotiable rule: **Never lose more than 1% to 2% of your total account balance if a Stop Loss is hit.**
• On a **$1,000** account, your maximum risk per trade is **$10 to $20**.
• On a **$100** account, your maximum risk per trade is **$1 to $2**.
Even if you suffer 10 consecutive losing trades, 90% of your capital remains intact!

## The Mathematical Power of a 1:2 Risk-to-Reward Ratio
Imagine taking 10 trades where each trade risks **$10** (Stop Loss) to target **$20** (Take Profit)—a 1:2 R:R ratio:
• **6 Losing Trades:** 6 × $10 = **-$60 Loss**
• **4 Winning Trades:** 4 × $20 = **+$80 Profit**
• **Net Outcome:** $80 - $60 = **+$20 Net Profit!**

Notice that even when you are wrong 60% of the time (only a 40% win rate), disciplined 1:2 Risk-to-Reward math keeps your account growing!

## Formula for Exact Position & Lot Sizing
**Position Size = (Account Balance × Risk %) ÷ |Entry Price - Stop Loss Price|**

💡 **Pro Tip:** Skip manual math—open our **Risk & Lot Calculator** tab, enter your balance, entry price, and stop loss, and get your exact lot size and position value in one second.`,
  },
  {
    id: 'blog-4',
    slug: 'best-forex-trading-sessions-bangladesh-time-bst',
    titleBn: 'বাংলাদেশ সময় (BST) অনুযায়ী ফরেক্স মার্কেট সেশন ও ট্রেডিংয়ের সেরা সময় কোনটি?',
    titleEn: 'Forex Trading Sessions in Bangladesh Time (BST UTC+6) & Best Hours to Trade',
    excerptBn:
      'বাংলাদেশ সময় (UTC+6) অনুযায়ী সিডনি, টোকিও, লন্ডন এবং নিউ ইয়র্ক সেশন কখন শুরু ও শেষ হয়? কোন সময়ে মার্কেটে সবচেয়ে বেশি মুভমেন্ট ও ভলিউম থাকে জানুন।',
    excerptEn:
      'Complete schedule of Sydney, Tokyo, London, and New York Forex sessions in Bangladesh Standard Time (BST UTC+6) and the high-liquidity overlap window.',
    category: 'SESSIONS',
    author: 'Tradebd Market Intel Desk',
    publishedAt: '2026-10-21',
    readTimeMinutes: 5,
    featured: false,
    ctaTab: 'CALENDAR',
    keywords: [
      'ফরেক্স ক্যালেন্ডার বাংলাদেশ সময়',
      'ফরেক্স মার্কেট সেশন বাংলাদেশ টাইম',
      'লন্ডন ও নিউ ইয়র্ক সেশন সময়',
      'Forex Trading Time in Bangladesh',
      'Best Time to Trade Forex BST',
    ],
    keyTakeawaysBn: [
      'ফরেক্স মার্কেট ২৪ ঘণ্টা খোলা থাকলেও সব সময় সমান মুভমেন্ট বা ভলিউম থাকে না।',
      'বাংলাদেশ সময় দুপুর ২:০০টা (লন্ডন ওপেন) থেকে রাত ১১:০০টা পর্যন্ত মার্কেটে সবচেয়ে ভালো প্রাইস অ্যাকশন দেখা যায়।',
      'সন্ধ্যা ৭:০০টা থেকে রাত ১১:০০টা পর্যন্ত লন্ডন-নিউ ইয়র্ক ওভারল্যাপ (Overlap) হলো ট্রেডিংয়ের সবচেয়ে শক্তিশালী সময়।',
    ],
    keyTakeawaysEn: [
      'Although Forex is open 24 hours a day, market volume and volatility vary drastically by session.',
      'From 2:00 PM BST (London Open) to 11:00 PM BST offers the cleanest price action and trend moves.',
      'The London–New York Overlap (7:00 PM – 11:00 PM BST) is the highest-liquidity trading window worldwide.',
    ],
    contentBn: `## ফরেক্স মার্কেটের ৪টি প্রধান সেশন (বাংলাদেশ সময় BST অনুযায়ী)
আন্তর্জাতিক ফরেক্স মার্কেট ভৌগোলিক সময় অনুযায়ী ৪টি প্রধান সেশনে বিভক্ত। বাংলাদেশের ট্রেডারদের সুবিধার্থে **বাংলাদেশ মান সময় (BST / UTC+6)** অনুযায়ী নিচে সময়সূচি দেওয়া হলো:

• **১. সিডনি সেশন (Sydney Session):** ভোর ৪:০০টা থেকে দুপুর ১:০০টা পর্যন্ত। (AUD/USD ও NZD/USD পেয়ারে মাঝারি মুভমেন্ট থাকে)।
• **২. টোকিও বা এশিয়ান সেশন (Tokyo Session):** সকাল ৬:০০টা থেকে দুপুর ৩:০০টা পর্যন্ত। (USD/JPY এবং এশিয়ান পেয়ারে মুভমেন্ট থাকে, তবে ইউরো বা পাউন্ড পেয়ার শান্ত থাকে)।
• **৩. লন্ডন সেশন (London Session):** দুপুর ২:০০টা থেকে রাত ১১:০০টা পর্যন্ত। (বিশ্বের মোট ফরেক্স ভলিউমের প্রায় ৩৫% এই সেশনে লেনদেন হয়; EUR/USD, GBP/USD পেয়ারের জন্য সেরা)।
• **৪. নিউ ইয়র্ক সেশন (New York Session):** সন্ধ্যা ৭:০০টা থেকে ভোর ৪:০০টা পর্যন্ত। (মার্কিন ডলার USD পেয়ার, গোল্ড ও ক্রিপ্টো মার্কেটে তীব্র ভোলাটিলিটি থাকে)।

## গোল্ডেন আওয়ার: লন্ডন ও নিউ ইয়র্ক ওভারল্যাপ (সন্ধ্যা ৭টা – রাত ১১টা)
বাংলাদেশ সময় **সন্ধ্যা ৭:০০টা থেকে রাত ১১:০০টা** পর্যন্ত লন্ডন এবং নিউ ইয়র্ক—বিশ্বের সবচেয়ে বড় দুটি ফিন্যান্সিয়াল সেন্টার একসাথে খোলা থাকে।
• এই ৪ ঘণ্টায় মার্কেটে সবচেয়ে বেশি লিকুইডিটি (Liquidity) থাকে।
• মেজর কারেন্সি পেয়ারগুলোতে স্প্রেড (Spread) সবচেয়ে কম থাকে।
• যুক্তরাষ্ট্রের গুরুত্বপূর্ণ অর্থনৈতিক নিউজ যেমন **CPI (Inflation), Non-Farm Payrolls (NFP), GDP, এবং Unemployment Claims** বাংলাদেশ সময় সন্ধ্যা ৬:৩০ বা ৭:৩০ মিনিটে প্রকাশিত হয়।

⚠️ **সতর্কবার্তা:** হাই-ইমপ্যাক্ট লাল রঙের (High Impact) নিউজ প্রকাশের ঠিক ৫ মিনিট আগে ও পরে মার্কেটে প্রচণ্ড স্পাইক হয়। তাই ট্রেড নেওয়ার আগে অবশ্যই **Tradebd Economic Calendar** দেখে আজকের নিউজের সময় জেনে নিন।`,
    contentEn: `## The 4 Major Forex Sessions in Bangladesh Standard Time (BST / UTC+6)
The global foreign exchange market is divided into four major geographical sessions. Here is the exact schedule converted to **Bangladesh Standard Time (BST UTC+6)**:

• **1. Sydney Session:** 4:00 AM – 1:00 PM BST (Moderate movement on AUD/USD and NZD/USD).
• **2. Tokyo (Asian) Session:** 6:00 AM – 3:00 PM BST (Active for USD/JPY and Asian crosses, while European pairs remain quiet).
• **3. London Session:** 2:00 PM – 11:00 PM BST (Accounts for ~35% of global Forex volume; ideal for EUR/USD and GBP/USD).
• **4. New York Session:** 7:00 PM – 4:00 AM BST (High volatility across all USD pairs, Gold, and Crypto).

## The Golden Window: London & New York Overlap (7:00 PM – 11:00 PM BST)
Between **7:00 PM and 11:00 PM BST**, both London and New York financial centers are open simultaneously:
• Peak institutional liquidity and volume enter the market.
• Bid-ask spreads on major pairs are at their tightest.
• Major US macroeconomic releases—such as **CPI Inflation, Non-Farm Payrolls (NFP), FOMC, and GDP**—are released around 6:30 PM or 7:30 PM BST.

⚠️ **Risk Warning:** High-impact economic releases can trigger sudden volatility spikes within seconds. Always check the **Tradebd Economic Calendar** before opening trades during news hours.`,
  },
  {
    id: 'blog-5',
    slug: 'support-and-resistance-trading-strategy-bangla',
    titleBn: 'সাপোর্ট এবং রেজিস্ট্যান্স (Support & Resistance) লেভেল আঁকার ও ট্রেড নেওয়ার প্রফেশনাল কৌশল',
    titleEn: 'How to Draw Support & Resistance Zones Like Institutional Traders',
    excerptBn:
      'চার্টে সাপোর্ট ও রেজিস্ট্যান্স জোন কীভাবে চিহ্নিত করবেন? বাউন্স ট্রেডিং, ব্রেকআউট ও রিটেস্ট (Breakout & Retest) স্ট্র্যাটেজি এবং ফেক ব্রেকআউট চেনার উপায়।',
    excerptEn:
      'Learn how to identify institutional demand (support) and supply (resistance) zones, trade breakouts with retests, and avoid bull/bear traps.',
    category: 'PATTERNS',
    author: 'Tradebd Technical Desk',
    publishedAt: '2026-10-21',
    readTimeMinutes: 6,
    featured: false,
    ctaTab: 'CHART',
    keywords: [
      'সাপোর্ট ও রেজিস্ট্যান্স কি',
      'সাপোর্ট রেজিস্ট্যান্স আঁকার নিয়ম',
      'ব্রেকআউট ট্রেডিং স্ট্র্যাটেজি',
      'Support and Resistance Bangla',
      'Breakout and Retest Strategy',
    ],
    keyTakeawaysBn: [
      'সাপোর্ট ও রেজিস্ট্যান্স কোনো একক চিকন লাইন নয়, বরং এটি একটি প্রাইস জোন বা এরিয়া (Zone/Area)।',
      'সাপোর্ট ব্রেক করে নিচে নামলে সেই পুরনো সাপোর্ট লেভেলটিই পরবর্তীতে নতুন রেজিস্ট্যান্স হিসেবে কাজ করে (Role Reversal)।',
      'ব্রেকআউট হওয়ার সাথে সাথেই তাড়াহুড়ো করে এন্ট্রি না নিয়ে "Retest" বা পুনরায় স্পর্শ করার জন্য অপেক্ষা করা সবচেয়ে নিরাপদ।',
    ],
    keyTakeawaysEn: [
      'Support and Resistance should always be treated as price zones or areas rather than thin single lines.',
      'When a Support level breaks decisively downward, that old Support flips into new Resistance (Role Reversal).',
      'Waiting for a Breakout + Retest confirmation protects you from false breakout traps.',
    ],
    contentBn: `## সাপোর্ট (Support) এবং রেজিস্ট্যান্স (Resistance) কী?
টেকনিক্যাল অ্যানালাইসিসের সবচেয়ে মৌলিক ও কার্যকরী ভিত্তি হলো সাপোর্ট এবং রেজিস্ট্যান্স।
• **সাপোর্ট (Demand Zone):** চার্টের নিচের এমন একটি প্রাইস জোন যেখানে দাম নেমে আসার পর ক্রেতাদের (Buyers) প্রবল চাহিদার কারণে দাম আর নিচে নামতে পারে না এবং বারবার উপরে বাউন্স করে। একে ঘরের মেঝের (Floor) সাথে তুলনা করা যায়।
• **রেজিস্ট্যান্স (Supply Zone):** চার্টের উপরের এমন একটি প্রাইস জোন যেখানে দাম ওঠার পর বিক্রেতাদের (Sellers) প্রফিট বুকিং ও সেলিং প্রেসারের কারণে দাম বাধা পেয়ে নিচে নেমে আসে। একে ঘরের ছাদের (Ceiling) সাথে তুলনা করা যায়।

## চার্টে সঠিক সাপোর্ট ও রেজিস্ট্যান্স আঁকার ৩টি নিয়ম
১. **উচ্চ টাইমফ্রেম থেকে শুরু করুন:** প্রথমে 4h বা 1h চার্টে যান এবং যেখানে দাম অন্তত ২ থেকে ৩ বার স্পষ্টভাবে বাধা পেয়ে ঘুরে গেছে সেই সুইং হাই (Swing High) এবং সুইং লো (Swing Low) গুলো চিহ্নিত করুন।
২. **লাইন নয়, জোন (Zone) হিসেবে ধরুন:** মার্কেট সবসময় পিপ-টু-পিপ একই দামে থামে না। তাই ক্যান্ডেলের বডি এবং উইক (Wick) মিলিয়ে একটি ছোট অঞ্চল বা জোন হিসেবে বিবেচনা করুন।
3. **রোল রিভার্সাল (Support Becomes Resistance):** যখন একটি শক্তিশালী রেজিস্ট্যান্স জোন বড় ক্যান্ডেল দিয়ে ব্রেকআউট হয়ে উপরে চলে যায়, তখন দাম আবার নিচে ফিরে আসলে সেই পুরনো রেজিস্ট্যান্স লেভেলটিই **নতুন সাপোর্ট** হিসেবে কাজ করে!

## ব্রেকআউট ও রিটেস্ট (Breakout & Retest) ট্রেডিং কৌশল
অনেক নতুন ট্রেডার রেজিস্ট্যান্স ব্রেক করতে দেখলেই সাথে সাথে Buy নিয়ে নেন এবং ফেক ব্রেকআউটের (Bull Trap) শিকার হন। প্রফেশনাল নিয়ম হলো:
• **ধাপ ১:** ক্যান্ডেলকে রেজিস্ট্যান্সের উপরে স্পষ্টভাবে ক্লোজ হতে দিন।
• **ধাপ ২:** দাম আবার ধীরে ধীরে নিচে নেমে ব্রেক করা লেভেলটি **রিটেস্ট (Retest)** করার জন্য অপেক্ষা করুন।
• **ধাপ ৩:** রিটেস্ট লেভেলে হ্যামার বা বুলিশ এনগালফিং ক্যান্ডেল তৈরি হলে তবেই এন্ট্রি নিন এবং জোনটির ঠিক নিচে স্টপ লস বসান।

💡 **প্রো টিপ:** আমাদের **Live Chart Analysis** পেজে গেলে আপনি স্বয়ংক্রিয়ভাবে চার্টের ওপর সবুজ ড্যাশড লাইনে **Support** এবং লাল ড্যাশড লাইনে **Resistance** লেভেল দেখতে পাবেন!`,
    contentEn: `## What Are Support and Resistance?
Support and Resistance form the foundation of price action technical analysis:
• **Support (Demand Zone):** A price area below current market price where institutional buying interest is strong enough to halt a decline and bounce price upward—acting like a floor.
• **Resistance (Supply Zone):** A price area above current market price where selling pressure and profit-taking overpower buyers and push price downward—acting like a ceiling.

## 3 Rules for Drawing Accurate Support & Resistance
1. **Start on Higher Timeframes:** Begin on the 4h or 1h chart and mark obvious Swing Highs and Swing Lows where price reversed at least 2 to 3 times.
2. **Draw Zones, Not Thin Lines:** Markets rarely reverse at the exact pip. Include both candle bodies and wicks to form a supply/demand zone.
3. **Role Reversal (Support Flips to Resistance):** Once a major Resistance zone is broken with strong momentum, a pullback to that same level turns it into **New Support**.

## The Breakout & Retest Trading Strategy
Retail traders often chase impulsive breakout candles and get caught in Bull Traps. Instead, follow the institutional 3-step sequence:
• **Step 1:** Wait for a full candle body to close decisively beyond the level.
• **Step 2:** Patiently wait for price to pull back and **Retest** the broken structure.
• **Step 3:** Enter when a rejection candle (such as a Hammer or Engulfing) forms on the retest, placing your Stop Loss just behind the zone.

💡 **Pro Tip:** On our **Live Chart Analysis** workspace, dynamic **Support** (green dashed) and **Resistance** (red dashed) levels are plotted automatically to assist your analysis!`,
  },
  {
    id: 'blog-6',
    slug: 'rsi-ema-bollinger-bands-indicator-strategy-bangla',
    titleBn: 'RSI, EMA 20/50 এবং Bollinger Bands দিয়ে নিখুঁত ট্রেডিং সেটআপ খোঁজার নিয়ম',
    titleEn: 'How to Combine RSI, EMA 20/50/200 & Bollinger Bands for High-Probability Setups',
    excerptBn:
      'চার্টে একগাদা ইন্ডিকেটর না বসিয়ে শুধুমাত্র মুভিং এভারেজ (EMA), আরএসআই (RSI 14) এবং বুলিঙ্গার ব্যান্ডস একসাথে মিলিয়ে কনফ্লুয়েন্স ট্রেডিং করার সহজ গাইড।',
    excerptEn:
      'Stop cluttering your chart. Learn how to combine EMA trend filters, RSI momentum, and Bollinger Bands volatility for institutional-grade confluence.',
    category: 'CRYPTO',
    author: 'Tradebd Quantitative Team',
    publishedAt: '2026-10-21',
    readTimeMinutes: 6,
    featured: false,
    ctaTab: 'CHART',
    keywords: [
      'RSI ইন্ডিকেটর কি',
      'EMA ট্রেডিং স্ট্র্যাটেজি',
      'বুলিঙ্গার ব্যান্ডস ব্যবহারের নিয়ম',
      'Technical Indicators Bangla',
      'EMA 20 50 200 Crossover Strategy',
    ],
    keyTakeawaysBn: [
      'EMA 200 লাইনের উপরে দাম থাকলে মার্কেট দীর্ঘমেয়াদী আপট্রেন্ডে (Bullish) আছে বলে ধরা হয়।',
      'RSI (14) যদি ৭০-এর উপরে যায় তবে মার্কেট Overbought এবং ৩০-এর নিচে নামলে Oversold অঞ্চলে থাকে।',
      'কমপক্ষে ২ বা ৩টি পৃথক সিগন্যাল একসাথে মিলে যাওয়াকে ট্রেডিংয়ের ভাষায় "Confluence" বলা হয়।',
    ],
    keyTakeawaysEn: [
      'Price trading above the EMA 200 indicates a macro Bullish trend; below EMA 200 indicates a Bearish trend.',
      'RSI (14) above 70 signals Overbought exhaustion, while RSI below 30 signals Oversold rebound potential.',
      'Combining 2 or 3 independent technical signals at the same price zone is called "Confluence".',
    ],
    contentBn: `## টেকনিক্যাল ইন্ডিকেটর (Technical Indicators) কীভাবে ব্যবহার করবেন?
অনেক নতুন ট্রেডার চার্টে ৭-৮টি ইন্ডিকেটর একসাথে ওপেন করে ফেলেন, যার ফলে চার্টের আসল ক্যান্ডেল বা প্রাইস অ্যাকশনই দেখা যায় না। মনে রাখবেন—ইন্ডিকেটরগুলো তৈরি হয় অতীতের দামের হিসাব থেকে। তাই প্রাইস অ্যাকশনের সহায়ক (Confirmation) হিসেবে মাত্র ২ থেকে ৩টি সেরা ইন্ডিকেটর ব্যবহার করাই যথেষ্ট।

## ১. এক্সপোনেনশিয়াল মুভিং এভারেজ (EMA 20, EMA 50 ও EMA 200)
মুভিং এভারেজ আমাদের মার্কেটের মূল ট্রেন্ড (Trend Direction) কোন দিকে তা পরিষ্কারভাবে দেখায়:
• **EMA 200 (দীর্ঘমেয়াদী ট্রেন্ড ফিল্টার):** ক্যান্ডেল যদি EMA 200 লাইনের উপরে থাকে, তবে শুধুমাত্র **Buy / Long** সেটআপ খুঁজুন। আর নিচে থাকলে **Sell / Short** সেটআপ খুঁজুন।
• **গোল্ডেন ক্রসওভার (EMA 20 > EMA 50):** যখন দ্রুতগতির EMA 20 লাইনটি নিচ থেকে উপরে EMA 50 লাইনকে ক্রস করে, তখন মার্কেটে শক্তিশালী বুলিশ মোমেন্টাম শুরু হয়।
• **ডাইনামিক সাপোর্ট:** আপট্রেন্ডে থাকা অবস্থায় দাম বারবার EMA 20 বা EMA 50 লাইন স্পর্শ করে আবার উপরে বাউন্স করে।

## ২. রিলেটিভ স্ট্রেংথ ইনডেক্স — RSI (14)
RSI হলো ০ থেকে ১০০ স্কেলের একটি মোমেন্টাম অসিলেটর যা মার্কেটের গতি এবং অতিরিক্ত কেনা-বেচার অবস্থা নির্দেশ করে:
• **Overbought (RSI > 70):** যখন RSI ৭০ পার হয়ে যায়, তখন বুঝতে হবে মার্কেটে অতিরিক্ত কেনা হয়েছে এবং যেকোনো সময় কারেকশন বা দাম নিচে নামতে পারে। এই অবস্থায় নতুন করে Buy নেওয়া ঝুঁকিপূর্ণ।
• **Oversold (RSI < 30):** যখন RSI ৩০-এর নিচে চলে আসে, তখন মার্কেটে বিক্রির চাপ শেষের দিকে এবং সাপোর্ট লেভেল থেকে দাম ঘুরে দাঁড়াতে পারে।

## ৩. বুলিঙ্গার ব্যান্ডস (Bollinger Bands)
বুলিঙ্গার ব্যান্ডস মার্কেটের ভোলাটিলিটি বা অস্থিরতা পরিমাপ করে। যখন উপরের ও নিচের ব্যান্ড দুটি একদম সংকুচিত হয়ে চিকন হয়ে আসে, তাকে **Bollinger Squeeze** বলে—যার অর্থ মার্কেটে খুব শীঘ্রই বড় একটি ব্রেকআউট হতে যাচ্ছে!`,
    contentEn: `## How to Use Technical Indicators Correctly
Many beginners clutter their screen with 7 or 8 indicators until the candlesticks themselves are barely visible. Remember that indicators are derived from historical price data—they should serve as secondary confirmation alongside clean Price Action.

## 1. Exponential Moving Averages (EMA 20, EMA 50 & EMA 200)
Moving averages reveal the dominant trend direction at a glance:
• **EMA 200 (Macro Trend Filter):** When price is above the EMA 200, focus on **Buy / Long** setups. When below, focus on **Sell / Short** setups.
• **Bullish Crossover (EMA 20 > EMA 50):** When the faster EMA 20 crosses above the EMA 50, strong upward momentum is underway.
• **Dynamic Support:** During healthy uptrends, pullbacks frequently bounce right off the EMA 20 or EMA 50 line.

## 2. Relative Strength Index — RSI (14)
RSI is a 0–100 momentum oscillator that measures speed and overextension:
• **Overbought (RSI > 70):** Buying momentum is overextended and a pullback or profit-taking correction is likely. Avoid chasing new longs here.
• **Oversold (RSI < 30):** Selling pressure is exhausted; watch for bullish reversal candles if price is sitting inside a Support zone.

## 3. Bollinger Bands
Bollinger Bands measure market volatility. When the upper and lower bands contract tightly together, it is called a **Bollinger Squeeze**—signaling that an explosive volatility breakout is imminent!`,
  },
  {
    id: 'blog-7',
    slug: 'crypto-paper-trading-simulator-beginner-guide',
    titleBn: 'ক্রিপ্টো ও বিটকয়েন পেপার ট্রেডিং (Demo Trading): আসল টাকা ঝুঁকিতে না ফেলে দক্ষ ট্রেডার হওয়ার উপায়',
    titleEn: 'Crypto & Bitcoin Paper Trading: How to Master Trading Without Financial Risk',
    excerptBn:
      'পেপার ট্রেডিং বা ডেমো ট্রেডিং কী? কেন সরাসরি রিয়েল মার্কেটে ট্রেড না করে কাস্টম ডেমো ফান্ড দিয়ে প্র্যাকটিস করলে ৯০% প্রাথমিক লস এড়ানো সম্ভব?',
    excerptEn:
      'What is paper trading and why practicing with a realistic custom demo balance prevents 90% of beginner trading mistakes.',
    category: 'CRYPTO',
    author: 'Tradebd Academy Desk',
    publishedAt: '2026-10-22',
    readTimeMinutes: 5,
    featured: false,
    ctaTab: 'SIMULATOR',
    keywords: [
      'পেপার ট্রেডিং সিমুলেটর',
      'ক্রিপ্টো ট্রেডিং বাংলাদেশ',
      'বিটকয়েন ডেমো ট্রেডিং',
      'Crypto Paper Trading Simulator',
      'Free Demo Trading Account Bangla',
    ],
    keyTakeawaysBn: [
      'পেপার ট্রেডিং হলো লাইভ মার্কেট প্রাইসে ভার্চুয়াল বা কাল্পনিক অর্থ দিয়ে রিয়েল ট্রেডিংয়ের হুবহু অনুশীলন।',
      'অধিকাংশ ডেমো একাউন্টে $100,000 দেওয়ায় বাস্তব মানসিকতা তৈরি হয় না—তাই Tradebd-তে আপনি $50 বা $500-এর মতো বাস্তবসম্মত ফান্ড সেট করতে পারেন।',
      'ডেমোতে টানা ৩০টি ট্রেডের জার্নাল ও অন্তত ৫০%+ উইন রেট না আসা পর্যন্ত রিয়েল মার্কেটে যাওয়া উচিত নয়।',
    ],
    keyTakeawaysEn: [
      'Paper trading lets you practice real-time trade execution using virtual funds with zero financial risk.',
      'Unlike generic $100,000 demo accounts, Tradebd lets you set realistic custom funds like $50, $100, or $500.',
      'Complete at least 30 logged virtual trades with positive expectancy before considering live capital.',
    ],
    contentBn: `## পেপার ট্রেডিং (Paper Trading) কী?
অতীতে যখন কম্পিউটার বা অনলাইন চার্ট ছিল না, তখন নতুন ট্রেডাররা মার্কেটের দাম দেখে কাগজে-কলমে (On Paper) নিজেদের এন্ট্রি, স্টপ লস ও টেক প্রফিট লিখে রাখতেন এবং পরে মিলিয়ে দেখতেন তাদের কৌশল কাজ করছে কি না। সেখান থেকেই **Paper Trading** নামটির উৎপত্তি।

বর্তমানে **Tradebd Virtual Simulator**-এর মাধ্যমে আপনি লাইভ ক্যান্ডেলস্টিক চার্টে এক ক্লিকেই ভার্চুয়াল ডলার দিয়ে Buy/Long বা Sell/Short অর্ডার ওপেন করতে পারেন এবং পজিশনের লাইভ লাভ-ক্ষতি (Unrealized PnL) ট্র্যাক করতে পারেন।

## কেন সাধারণ ডেমো একাউন্টের চেয়ে কাস্টম ফান্ড জরুরি?
অনেক প্ল্যাটফর্মে ডেমো একাউন্ট খুললে শুরুতেই **$100,000** ভার্চুয়াল ব্যালেন্স দেওয়া হয়। কিন্তু একজন নতুন ট্রেডার যখন বাস্তবে $100 বা $200 নিয়ে ট্রেড করতে চান, তখন ১ লাখ ডলারের ডেমো প্র্যাকটিস তার কোনো কাজে আসে না।

এই সমস্যার সমাধানে **Tradebd**-তে যুক্ত করা হয়েছে **Custom Demo Fund Manager**:
• আপনি চাইলে **$50, $100, $500 বা $1,000**—ঠিক যে পরিমাণ ব্যালেন্স নিয়ে ভবিষ্যতে কাজ করতে চান, সেই পরিমাণ ডেমো ফান্ড সেট করে প্র্যাকটিস করতে পারবেন।
• এতে আপনার লট সাইজ হিসাব এবং রিস্ক ম্যানেজমেন্টের অভ্যাস ১০০% বাস্তবসম্মত হবে।

## পেপার ট্রেডিং থেকে সর্বোচ্চ সুফল পাওয়ার ৪টি নিয়ম
১. ডেমো ব্যালেন্সকে আসল টাকার মতোই গুরুত্ব দিন—ইচ্ছেমতো বড় লিভারেজ নেবেন না।
২. প্রতিটি ট্রেডে অবশ্যই **Stop Loss (SL)** এবং **Take Profit (TP)** ব্যবহার করুন।
৩. **Trade Journal** ট্যাবে গিয়ে দেখুন আপনার কোন ট্রেডগুলো স্টপ লস হিট করেছে এবং কেন করেছে।
৪. অন্তত ৩০ থেকে ৫০টি ভার্চুয়াল ট্রেড সম্পন্ন করে নিজের স্ট্র্যাটেজির উইন রেট (Win Rate) যাচাই করুন।`,
    contentEn: `## What is Paper Trading?
Before online trading terminals existed, aspiring traders wrote down their hypothetical entries, stop losses, and exits on paper while watching market quotes to test their strategies—giving birth to the term **Paper Trading**.

Today, the **Tradebd Virtual Simulator** lets you execute real-time Buy/Long and Sell/Short positions on live candlestick charts with automatic Stop Loss, Take Profit, and unrealized PnL tracking.

## Why Custom Demo Funds Beat Generic $100,000 Demo Accounts
Most platforms hand beginners a default **$100,000** virtual balance. However, if a trader plans to eventually trade with $100 or $500, practicing with $100k builds reckless position-sizing habits.

That is why **Tradebd** features a **Custom Demo Fund Manager**:
• Set your virtual balance to **$50, $100, $500, or $1,000**—matching your true goals.
• Build realistic 1%–2% risk management habits from day one.

## 4 Rules to Get the Most Out of Paper Trading
1. Treat your virtual fund like real capital—avoid reckless high leverage.
2. Always attach both a **Stop Loss (SL)** and **Take Profit (TP)** to every order.
3. Review your closed trades in the **Trade Journal** tab to spot recurring mistakes.
4. Log at least 30 to 50 trades to verify a consistent win rate and positive expectancy.`,
  },
  {
    id: 'blog-8',
    slug: 'trading-psychology-fomo-revenge-trading-control',
    titleBn: 'ট্রেডিং সাইকোলজি: অতিরিক্ত লোভ (FOMO) ও রিভেঞ্জ ট্রেডিং নিয়ন্ত্রণের ১০টি গোল্ডেন রুল',
    titleEn: 'Trading Psychology: 10 Golden Rules to Conquer FOMO & Revenge Trading',
    excerptBn:
      'ভালো চার্ট অ্যানালাইসিস জানার পরেও কেন ট্রেডাররা লস করেন? ভয়, লোভ (Greed), FOMO এবং লস কভার করার জন্য ওভার-ট্রেডিং বন্ধ করার বাস্তবসম্মত মনস্তাত্ত্বিক কৌশল।',
    excerptEn:
      'Master your trading mindset. Learn practical techniques to eliminate Fear of Missing Out (FOMO), overtrading, and emotional revenge trading.',
    category: 'PSYCHOLOGY',
    author: 'Tradebd Mentor Desk',
    publishedAt: '2026-10-22',
    readTimeMinutes: 5,
    featured: false,
    ctaTab: 'MENTOR',
    keywords: [
      'ট্রেডিং সাইকোলজি',
      'ট্রেডিং করার নিয়ম',
      'ওভার ট্রেডিং বন্ধ করার উপায়',
      'Trading Psychology Bangla',
      'How to Stop Revenge Trading',
    ],
    keyTakeawaysBn: [
      'ট্রেডিং সফলতার ২০% হলো টেকনিক্যাল স্ট্র্যাটেজি এবং বাকি ৮০% হলো মানি ম্যানেজমেন্ট ও সাইকোলজি (মনস্তত্ত্ব)।',
      'বড় ক্যান্ডেল দেখলেই লাফিয়ে ট্রেডে ঢোকা (FOMO) নতুনদের সবচেয়ে বড় শত্রু—সবসময় পুলব্যাক বা রিটেস্টের জন্য অপেক্ষা করুন।',
      'দিনে পরপর ২টি ট্রেডে স্টপ লস হিট করলে ওই দিনের জন্য চার্ট বন্ধ করে বিরতি নিন।',
    ],
    keyTakeawaysEn: [
      'Trading success is 20% technical strategy and 80% risk management and emotional discipline.',
      'Chasing impulsive candles out of FOMO is a trader’s worst enemy—always wait for a pullback or retest.',
      'If you hit 2 consecutive Stop Losses in a single day, close the chart and take a break.',
    ],
    contentBn: `## ট্রেডিং সাইকোলজি কেন সবচেয়ে গুরুত্বপূর্ণ?
বিখ্যাত ট্রেডিং মনোবিদ মার্ক ডগলাস তাঁর *"Trading in the Zone"* বইয়ে দেখিয়েছেন যে—একই ট্রেডিং স্ট্র্যাটেজি দুইজন মানুষকে দিলে একজন প্রফিট করেন এবং অন্যজন একাউন্ট জিরো করেন। পার্থক্যটি তৈরি হয় **আবেগ নিয়ন্ত্রণ ও ডিসিপ্লিনে**।

## ১. FOMO (Fear Of Missing Out) থেকে বাঁচার উপায়
চার্টে হঠাৎ একটি বিশাল সবুজ ক্যান্ডেল উপরে উঠতে দেখলে মনে হয়—"এখনই Buy না নিলে বুঝি বিশাল প্রফিট মিস হয়ে গেল!" আর ঠিক তখনই তাড়াহুড়ো করে টপে Buy নেওয়ার পর মার্কেট নিচে নামতে শুরু করে।
• **সমাধান:** মনে রাখবেন, মার্কেটে প্রতিদিন নতুন সুযোগ আসে। ট্রেন স্টেশন ছেড়ে চলে গেলে তার পেছনে না দৌড়ে পরের স্টেশনের (Retest / Support Zone) জন্য অপেক্ষা করুন।

## ২. রিভেঞ্জ ট্রেডিং (Revenge Trading) কীভাবে থামাবেন?
একটি ট্রেডে $10 লস হওয়ার পর রাগের মাথায় "এখনই লস তুলে আনব" ভেবে দ্বিগুণ লট সাইজ নিয়ে সাথে সাথে আরেকটি ট্রেড ওপেন করাকে **Revenge Trading** বলে। এটি একাউন্ট জিরো হওয়ার ১ নম্বর কারণ।
• **সমাধান (Daily Loss Limit):** নিজের জন্য একটি কঠোর নিয়ম তৈরি করুন—এক দিনে পরপর **২টি ট্রেডে স্টপ লস হিট করলে** ওই দিনের মতো আর কোনো ট্রেড নেবেন না।

## ৩. সফল ট্রেডারদের চেকলিস্ট (Pre-Trade Checklist)
যেকোনো অর্ডার দেওয়ার আগে নিজেকে এই ৪টি প্রশ্ন করুন:
• ১. মার্কেট ট্রেন্ড কি আমার ট্রেডের অনুকূলে আছে?
• ২. দাম কি সাপোর্ট বা রেজিস্ট্যান্স লেভেলে আছে?
• ৩. আমার স্টপ লস এবং টেক প্রফিট কি ন্যূনতম ১:২ রেশিওতে সেট করা?
• ৪. আমি কি শান্ত মস্তিষ্কে ট্রেডটি নিচ্ছি?

💡 **প্রো টিপ:** ট্রেড নেওয়ার আগে আমাদের **AI Trade Mentor** ট্যাবে গিয়ে আপনার এন্ট্রি, স্টপ লস ও টেক প্রফিট বসিয়ে ফ্রিতে সেটআপ স্কোর যাচাই করে নিন!`,
    contentEn: `## Why Trading Psychology Matters Most
In his classic book *"Trading in the Zone"*, Mark Douglas demonstrated that two traders given the exact same profitable strategy can produce opposite results—one compounds wealth while the other blows their account. The difference lies in **emotional discipline**.

## 1. How to Overcome FOMO (Fear Of Missing Out)
Seeing a massive green candle shoot up often triggers the urge to buy immediately at the top—right before the market pulls back and hits your stop loss.
• **Solution:** The market offers new setups every single day. If a train has already left the station, do not chase it—wait calmly for a pullback to Support.

## 2. How to Stop Revenge Trading
Doubling your lot size immediately after a $10 loss out of anger to "win your money back" is called **Revenge Trading**—the fastest way to blow an account.
• **Solution (2-Strike Daily Rule):** Enforce a strict daily loss limit. If you hit **2 consecutive Stop Losses** in a day, close your trading platform until tomorrow.

## 3. Pre-Trade Discipline Checklist
Before clicking Buy or Sell, ask yourself these 4 questions:
• 1. Is the dominant trend aligned with my trade direction?
• 2. Is price at a tested Support or Resistance zone?
• 3. Is my Risk:Reward ratio at least 1:2?
• 4. Am I calm and following my written plan?

💡 **Pro Tip:** Before executing any trade, open our **AI Trade Mentor** tab to score your Entry, Stop Loss, and Take Profit setup objectively!`,
  },
];
