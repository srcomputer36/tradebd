import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const htmlPath = path.join(distDir, 'index.html');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const PRERENDER_ROUTES = [
  {
    route: 'simulator',
    title: 'Virtual Paper Trading Simulator (Free Demo Account) – Tradebd',
    description:
      'Practice live Forex and Crypto paper trading with customizable virtual demo funds ($10 to $10,000,000), Stop-Loss, Take-Profit, and zero financial risk on the Tradebd Simulator.',
    h1: 'Virtual Paper Trading Simulator & Custom Demo Account – Tradebd',
    lead: 'Practice real-time Buy/Long and Sell/Short order execution on live Forex and Crypto candlestick charts with customizable virtual demo funds ($10 to $10,000,000) and zero financial risk.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Realistic Custom Demo Balance &amp; Risk-Free Order Execution</h2>
      <p>Unlike traditional demo accounts that force an unrealistic $100,000 balance, the Tradebd Paper Trading Simulator allows you to configure any starting balance from $10, $100, or $1,000 up to $10,000,000. Test real position sizing, leverage (1x to 20x), automated Stop-Loss (SL), and Take-Profit (TP) triggers across BTC/USDT, ETH/USDT, EUR/USD, GBP/USD, and Gold (XAU/USD).</p>
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Built-In Trade Journal &amp; Performance Analytics</h2>
      <p>Every simulated trade is logged automatically in your personal Trade History Journal, tracking win rate, unrealized and realized PnL, and Risk-to-Reward discipline before you ever commit live capital.</p>
    `,
  },
  {
    route: 'calendar',
    title: 'Forex Economic Calendar & Global Market Sessions (BST UTC+6) – Tradebd',
    description:
      'Track Sydney, Tokyo, London, and New York Forex trading sessions in Bangladesh Standard Time (BST UTC+6) alongside high-impact macroeconomic news (CPI, NFP, FOMC).',
    h1: 'Forex Economic Calendar & Global Market Sessions Tracker (BST UTC+6)',
    lead: 'Monitor live Sydney, Tokyo, London, and New York foreign exchange trading hours synchronized with Bangladesh Standard Time (BST UTC+6) and track high-impact macroeconomic news releases.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Bangladesh Standard Time (BST UTC+6) Forex Session Schedule</h2>
      <ul>
        <li><strong>Sydney Session:</strong> 4:00 AM – 1:00 PM BST (Moderate volatility on AUD/USD &amp; NZD/USD).</li>
        <li><strong>Tokyo (Asian) Session:</strong> 6:00 AM – 3:00 PM BST (Active liquidity on USD/JPY &amp; Asian currency pairs).</li>
        <li><strong>London Session:</strong> 2:00 PM – 11:00 PM BST (35% of global Forex volume; prime hours for EUR/USD &amp; GBP/USD).</li>
        <li><strong>New York Session:</strong> 7:00 PM – 4:00 AM BST (Peak volatility across USD pairs, Gold &amp; Crypto).</li>
      </ul>
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">High-Impact Economic News &amp; London–New York Overlap (7:00 PM – 11:00 PM BST)</h2>
      <p>Track US Core CPI inflation, Non-Farm Payrolls (NFP), FOMC interest rate decisions, and GDP releases with Forecast vs. Previous comparisons to protect open trades from news volatility spikes.</p>
    `,
  },
  {
    route: 'academy',
    title: 'Forex & Crypto Trading Academy Courses (Bengali & English) – Tradebd',
    description:
      'Learn Forex and Crypto trading from beginner to institutional level: market structure, candlestick price action, support and resistance, indicators, and 1% risk management.',
    h1: 'Tradebd Forex & Crypto Trading Academy – Free Structured Curriculum',
    lead: 'Master financial market structure, candlestick psychology, institutional supply and demand zones, technical indicators, and strict 1% capital preservation through our free bilingual Trading Academy.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Complete Beginner-to-Institutional Trading Curriculum</h2>
      <p>Our structured modules cover Forex currency pairs, pips, lots, leverage safety, multi-timeframe trend analysis, Support and Resistance role reversal, EMA 20/50/200 trend filters, RSI momentum divergence, and trading psychology.</p>
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Interactive Quizzes &amp; Practical Chart Application</h2>
      <p>Each module pairs theoretical concepts with live chart examples and immediate practice on the Tradebd Virtual Paper Trading Simulator.</p>
    `,
  },
  {
    route: 'blog',
    title: 'Educational Forex & Crypto Trading Blog & Articles – Tradebd',
    description:
      'In-depth educational articles and guides in Bengali and English on Forex trading, candlestick chart patterns, Bangladesh trading session hours (BST), and risk management.',
    h1: 'Tradebd Educational Trading Blog – Forex, Crypto & Technical Analysis Guides',
    lead: 'Read comprehensive, step-by-step guides on Forex trading fundamentals, candlestick chart patterns, Support and Resistance strategies, BST market session hours, and the 1% risk management formula.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Featured Financial Education Articles</h2>
      <ul>
        <li><a href="https://tradebd.online/blog/forex-trading-bangla-complete-guide" style="color: #38bdf8;">What is Forex Trading &amp; How Beginners Can Start Learning from Scratch</a></li>
        <li><a href="https://tradebd.online/blog/candlestick-chart-patterns-bangla-guide" style="color: #38bdf8;">Top 7 Bullish &amp; Bearish Candlestick Chart Patterns Every Trader Must Know</a></li>
        <li><a href="https://tradebd.online/blog/risk-management-lot-size-stop-loss-formula" style="color: #38bdf8;">Stop Loss, Position Sizing &amp; The 1% Risk Management Formula</a></li>
        <li><a href="https://tradebd.online/blog/best-forex-trading-sessions-bangladesh-time-bst" style="color: #38bdf8;">Forex Trading Sessions in Bangladesh Time (BST UTC+6) &amp; Best Hours to Trade</a></li>
        <li><a href="https://tradebd.online/blog/support-and-resistance-trading-strategy-bangla" style="color: #38bdf8;">How to Draw Support &amp; Resistance Zones Like Institutional Traders</a></li>
        <li><a href="https://tradebd.online/blog/rsi-ema-bollinger-bands-indicator-strategy-bangla" style="color: #38bdf8;">How to Combine RSI, EMA 20/50/200 &amp; Bollinger Bands for High-Probability Setups</a></li>
        <li><a href="https://tradebd.online/blog/crypto-paper-trading-simulator-beginner-guide" style="color: #38bdf8;">Crypto &amp; Bitcoin Paper Trading: Master Trading Without Financial Risk</a></li>
        <li><a href="https://tradebd.online/blog/trading-psychology-fomo-revenge-trading-control" style="color: #38bdf8;">Trading Psychology: 10 Golden Rules to Conquer FOMO &amp; Revenge Trading</a></li>
      </ul>
    `,
  },
  {
    route: 'patterns',
    title: 'Candlestick Chart Patterns Guide & Visual Cheatsheet – Tradebd',
    description:
      'Master bullish and bearish candlestick chart patterns (Hammer, Bullish Engulfing, Doji, Shooting Star, Morning Star, Pin Bar) with visual diagrams and entry-exit rules.',
    h1: 'Candlestick Chart Patterns Guide & Interactive Cheatsheet – Tradebd',
    lead: 'Explore high-probability bullish and bearish candlestick chart formations with visual SVG diagrams, market psychology explanations, confirmation triggers, and Stop-Loss placement rules.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Bullish &amp; Bearish Reversal Candlestick Patterns</h2>
      <p>Learn how to identify and trade the Hammer, Inverted Hammer, Bullish Engulfing, Bearish Engulfing, Shooting Star, Morning Star, Evening Star, Dragonfly Doji, and Three White Soldiers at key Support and Resistance zones.</p>
    `,
  },
  {
    route: 'calculator',
    title: 'Forex & Crypto Risk & Position Lot Size Calculator – Tradebd',
    description:
      'Calculate exact position size, standard/mini/micro lots, capital at risk, and Risk-to-Reward (R:R) ratio based on your account balance and stop-loss distance.',
    h1: 'Forex & Crypto Position Size, Lot Size & Risk-Reward Calculator',
    lead: 'Protect your trading capital with mathematical precision. Enter your account balance, risk percentage (1%–2%), entry price, stop-loss, and take-profit to compute exact position sizing and lot units.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">The 1% Capital Preservation Formula</h2>
      <p>Professional traders never risk more than 1% to 2% of total account equity on a single setup. Our calculator automatically outputs Standard Lots (1.00), Mini Lots (0.10), Micro Lots (0.01), and your exact Risk-to-Reward ratio so you never over-leverage.</p>
    `,
  },
  {
    route: 'mentor',
    title: 'Interactive Chart Quiz & Trade Setup Evaluator Mentor – Tradebd',
    description:
      'Evaluate your Buy/Long and Sell/Short trade setups objectively and test your technical analysis chart reading skills with the Tradebd Interactive Mentor.',
    h1: 'Interactive Chart Setup Evaluator & Technical Analysis Mentor – Tradebd',
    lead: 'Validate your trade setup before executing an order. Check your Entry, Stop-Loss, Take-Profit, Risk-to-Reward ratio, and indicator confluences against institutional risk standards.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Pre-Trade Checklist &amp; Confluence Scoring</h2>
      <p>Verify logical price level sequences, minimum 1:2 Risk-to-Reward thresholds, and multi-indicator confluence (EMA trend alignment, RSI momentum, and Support/Resistance structure) alongside interactive chart reading quizzes.</p>
    `,
  },
  {
    route: 'about',
    title: 'About Us – Tradebd Financial Education & Technical Analysis Academy',
    description:
      'Learn about Tradebd (tradebd.online) – a free financial literacy, technical analysis charting, and virtual paper trading education platform.',
    h1: 'About Tradebd – Financial Education & Technical Analysis Platform',
    lead: 'Tradebd (tradebd.online) is an independent financial literacy and technical analysis education platform dedicated to helping learners practice chart reading and risk management in a 100% risk-free environment.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Our Educational Mission</h2>
      <p>We provide free interactive candlestick charts, a customizable virtual paper trading simulator, a Bangladesh Standard Time (BST UTC+6) economic calendar, position size calculators, and bilingual courses in Bengali and English with zero registration barriers.</p>
    `,
  },
  {
    route: 'contact',
    title: 'Contact Us – Tradebd Editorial & Technical Support',
    description:
      'Contact the Tradebd editorial and technical support team at support@tradebd.online for questions, feedback, or educational inquiries.',
    h1: 'Contact Tradebd Support & Editorial Desk',
    lead: 'Have questions about our technical analysis tools, virtual paper trading simulator, or educational articles? Reach out to our team directly.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Official Contact Channels</h2>
      <p>Email: <a href="mailto:support@tradebd.online" style="color: #38bdf8;">support@tradebd.online</a> — Website: <a href="https://tradebd.online/" style="color: #38bdf8;">https://tradebd.online/</a>. We respond to all educational and technical feedback within 24–48 hours.</p>
    `,
  },
  {
    route: 'privacy',
    title: 'Privacy Policy – Tradebd (tradebd.online)',
    description:
      'Read the Tradebd Privacy Policy covering local storage usage, cookie consent disclosures, Google Analytics, Google AdSense compliance, and user data protection.',
    h1: 'Privacy Policy – Tradebd Financial Education Platform',
    lead: 'This Privacy Policy explains how Tradebd (tradebd.online) handles browser local storage, cookies, analytics, and third-party advertising compliance.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Data Protection, LocalStorage &amp; Cookie Disclosures</h2>
      <p>Tradebd does not require user registration or collect sensitive personal financial data. Virtual paper trading balances and preferences are stored locally in your browser via LocalStorage. Third-party vendors, including Google, use cookies to serve ads based on prior visits and analyze aggregate traffic.</p>
    `,
  },
  {
    route: 'terms',
    title: 'Terms of Use – Tradebd (tradebd.online)',
    description:
      'Terms and conditions for accessing and using the Tradebd website, educational trading academy, technical analysis charts, and virtual paper trading simulator.',
    h1: 'Terms of Use – Tradebd Trading Academy & Simulator',
    lead: 'By accessing Tradebd (tradebd.online), you agree to use our charting tools, virtual paper trading simulator, and academy articles strictly for educational and informational purposes.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Educational Use &amp; Platform Guidelines</h2>
      <p>Tradebd is not a broker, financial advisor, or real-money exchange. All simulated balances and trades on the platform are virtual and carry no monetary value.</p>
    `,
  },
  {
    route: 'disclaimer',
    title: 'Financial Risk Disclaimer – Tradebd (tradebd.online)',
    description:
      'Official educational and financial risk disclaimer for Tradebd. Trading foreign exchange and cryptocurrencies involves substantial risk; all content is strictly educational.',
    h1: 'Financial & Educational Risk Disclaimer – Tradebd',
    lead: 'All content, technical indicators, chart setups, and paper trading simulations on Tradebd (tradebd.online) are provided strictly for educational purposes and do not constitute financial or investment advice.',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">High-Risk Financial Market Warning</h2>
      <p>Foreign exchange (Forex) and cryptocurrency trading on margin carry a high level of risk and may not be suitable for all investors. Past performance of any trading strategy or indicator does not guarantee future results.</p>
    `,
  },
  {
    route: 'blog/forex-trading-bangla-complete-guide',
    title: 'What is Forex Trading & How Beginners Can Start Learning from Scratch – Tradebd',
    description:
      'Learn how the global foreign exchange market works, currency pairs (EUR/USD, GBP/USD), pips, lot sizes, and how to practice risk-free using virtual paper trading.',
    h1: 'What is Forex Trading & How Beginners Can Start Learning from Scratch (Complete Guide)',
    lead: 'ফরেক্স মার্কেট কীভাবে কাজ করে, কারেন্সি পেয়ার (EUR/USD, GBP/USD), পিপস, লট সাইজ এবং আসল টাকা ঝুঁকিতে না ফেলে ডেমো বা পেপার ট্রেডিং করার সঠিক নিয়ম বিস্তারিত জানুন।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">How Currency Pairs, Pips, Lot Size &amp; Leverage Work</h2>
      <p>Forex (Foreign Exchange) is the global decentralized market where currencies are traded in pairs such as EUR/USD and GBP/USD with over $7.5 trillion in daily volume. Beginners should master market structure, Support and Resistance zones, a minimum 1:2 Risk-to-Reward ratio, and practice at least 50 trades on the <a href="https://tradebd.online/simulator" style="color: #38bdf8;">Tradebd Virtual Paper Trading Simulator</a> before risking real capital.</p>
    `,
  },
  {
    route: 'blog/candlestick-chart-patterns-bangla-guide',
    title: 'Top 7 Bullish & Bearish Candlestick Chart Patterns Every Trader Must Know – Tradebd',
    description:
      'Master Hammer, Bullish Engulfing, Shooting Star, Doji, and Morning Star candlestick patterns to spot high-probability market reversals and entries.',
    h1: 'Top 7 Bullish & Bearish Candlestick Chart Patterns Every Trader Must Know',
    lead: 'হ্যামার (Hammer), বুলিশ এনগালফিং (Bullish Engulfing), শুটিং স্টার, ডোজি এবং মর্নিং স্টার ক্যান্ডেলস্টিক প্যাটার্ন দেখে মার্কেট রিভার্সাল ও সঠিক এন্ট্রি নেওয়ার কৌশল।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Hammer, Shooting Star, Engulfing &amp; Morning Star Rules</h2>
      <p>Every candlestick reveals Open, High, Low, and Close (OHLC) psychology. Combining reversal patterns at major Support or Resistance zones with RSI Oversold/Overbought confirmation dramatically improves trade accuracy. Explore interactive diagrams on our <a href="https://tradebd.online/patterns" style="color: #38bdf8;">Candlestick Pattern Library</a>.</p>
    `,
  },
  {
    route: 'blog/risk-management-lot-size-stop-loss-formula',
    title: 'Stop Loss, Position Sizing & The 1% Risk Management Formula for Traders – Tradebd',
    description:
      'Discover why 90% of beginners blow their accounts and how the 1% risk rule combined with a 1:2 Risk-to-Reward ratio keeps you profitable even with a 40% win rate.',
    h1: 'Stop Loss, Position Sizing & The 1% Risk Management Formula for Traders',
    lead: 'কেন ৯০% নতুন ট্রেডার একাউন্ট জিরো করে? কিভাবে ১% রিস্ক রুল ও ১:২ রিস্ক-রিওয়ার্ড রেশিও ব্যবহার করে মাত্র ৪০% উইন রেটেও প্রফিটেবল থাকা যায় তার গাণিতিক হিসাব।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Position Size Formula &amp; 1:2 Risk-to-Reward Math</h2>
      <p>Position Size = (Account Balance × Risk %) ÷ |Entry Price - Stop Loss Price|. By risking strictly 1% to 2% per trade and targeting a 1:2 Risk-to-Reward ratio, winning just 4 out of 10 trades yields net profitability. Compute your exact lot size instantly with the <a href="https://tradebd.online/calculator" style="color: #38bdf8;">Tradebd Risk &amp; Lot Size Calculator</a>.</p>
    `,
  },
  {
    route: 'blog/best-forex-trading-sessions-bangladesh-time-bst',
    title: 'Forex Trading Sessions in Bangladesh Time (BST UTC+6) & Best Hours to Trade – Tradebd',
    description:
      'Complete schedule of Sydney, Tokyo, London, and New York Forex sessions in Bangladesh Standard Time (BST UTC+6) and the high-liquidity overlap window.',
    h1: 'Forex Trading Sessions in Bangladesh Time (BST UTC+6) & Best Hours to Trade',
    lead: 'বাংলাদেশ সময় (UTC+6) অনুযায়ী সিডনি, টোকিও, লন্ডন এবং নিউ ইয়র্ক সেশন কখন শুরু ও শেষ হয় এবং কোন সময়ে মার্কেটে সবচেয়ে বেশি মুভমেন্ট থাকে জানুন।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Sydney, Tokyo, London &amp; New York Hours in BST (UTC+6)</h2>
      <p>In Bangladesh Standard Time (UTC+6), Sydney runs 4:00 AM – 1:00 PM, Tokyo 6:00 AM – 3:00 PM, London 2:00 PM – 11:00 PM, and New York 7:00 PM – 4:00 AM. Peak institutional liquidity and tightest spreads occur during the London–New York overlap between 7:00 PM and 11:00 PM BST. Track live sessions on the <a href="https://tradebd.online/calendar" style="color: #38bdf8;">Tradebd Economic Calendar</a>.</p>
    `,
  },
  {
    route: 'blog/support-and-resistance-trading-strategy-bangla',
    title: 'How to Draw Support & Resistance Zones Like Institutional Traders – Tradebd',
    description:
      'Learn how to identify institutional demand (support) and supply (resistance) zones, trade breakouts with retests, and avoid bull and bear traps.',
    h1: 'How to Draw Support & Resistance Zones Like Institutional Traders',
    lead: 'চার্টে সাপোর্ট ও রেজিস্ট্যান্স জোন কীভাবে চিহ্নিত করবেন? বাউন্স ট্রেডিং, ব্রেকআউট ও রিটেস্ট (Breakout & Retest) স্ট্র্যাটেজি এবং ফেক ব্রেকআউট চেনার উপায়।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Supply &amp; Demand Zones, Role Reversal &amp; Retest Confirmation</h2>
      <p>Treat Support and Resistance as multi-touch price zones on higher timeframes (1H and 4H) rather than thin lines. Wait for a decisive candle close and retest confirmation to avoid false breakout traps.</p>
    `,
  },
  {
    route: 'blog/rsi-ema-bollinger-bands-indicator-strategy-bangla',
    title: 'How to Combine RSI, EMA 20/50/200 & Bollinger Bands for High-Probability Setups – Tradebd',
    description:
      'Learn how to combine EMA trend filters, RSI momentum, and Bollinger Bands volatility squeeze for institutional-grade trading confluence.',
    h1: 'How to Combine RSI, EMA 20/50/200 & Bollinger Bands for High-Probability Setups',
    lead: 'চার্টে একগাদা ইন্ডিকেটর না বসিয়ে শুধুমাত্র মুভিং এভারেজ (EMA), আরএসআই (RSI 14) এবং বুলিঙ্গার ব্যান্ডস একসাথে মিলিয়ে কনফ্লুয়েন্স ট্রেডিং করার সহজ গাইড।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Multi-Indicator Confluence Without Chart Clutter</h2>
      <p>Use EMA 200 for macro trend direction, EMA 20/50 crossovers for dynamic pullback support, RSI (14) for Overbought (&gt;70) and Oversold (&lt;30) exhaustion, and Bollinger Band squeezes to anticipate volatility breakouts.</p>
    `,
  },
  {
    route: 'blog/crypto-paper-trading-simulator-beginner-guide',
    title: 'Crypto & Bitcoin Paper Trading: How to Master Trading Without Financial Risk – Tradebd',
    description:
      'What is paper trading and why practicing with a realistic custom demo balance prevents 90% of beginner cryptocurrency and Forex trading mistakes.',
    h1: 'Crypto & Bitcoin Paper Trading: How to Master Trading Without Financial Risk',
    lead: 'পেপার ট্রেডিং বা ডেমো ট্রেডিং কী? কেন সরাসরি রিয়েল মার্কেটে ট্রেড না করে কাস্টম ডেমো ফান্ড দিয়ে প্র্যাকটিস করলে ৯০% প্রাথমিক লস এড়ানো সম্ভব?',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">Build a Verified 30-Trade Journal Before Risking Capital</h2>
      <p>Practice executing Bitcoin (BTC/USDT), Ethereum (ETH/USDT), and Solana (SOL/USDT) setups on the <a href="https://tradebd.online/simulator" style="color: #38bdf8;">Tradebd Paper Trading Simulator</a> using a realistic custom balance until you achieve consistent positive expectancy.</p>
    `,
  },
  {
    route: 'blog/trading-psychology-fomo-revenge-trading-control',
    title: 'Trading Psychology: 10 Golden Rules to Conquer FOMO & Revenge Trading – Tradebd',
    description:
      'Master your trading mindset. Learn practical techniques to eliminate Fear of Missing Out (FOMO), overtrading, and emotional revenge trading.',
    h1: 'Trading Psychology: 10 Golden Rules to Conquer FOMO & Revenge Trading',
    lead: 'ভালো চার্ট অ্যানালাইসিস জানার পরেও কেন ট্রেডাররা লস করেন? ভয়, লোভ (Greed), FOMO এবং লস কভার করার জন্য ওভার-ট্রেডিং বন্ধ করার বাস্তবসম্মত মনস্তাত্ত্বিক কৌশল।',
    bodyHtml: `
      <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 24px 0 10px 0;">The 2-Strike Daily Loss Rule &amp; Pre-Trade Discipline</h2>
      <p>Trading success is 20% technical strategy and 80% risk management and emotional discipline. Enforce a strict 2-strike daily stop-loss limit, never chase impulsive candles out of FOMO, and validate every setup with the <a href="https://tradebd.online/mentor" style="color: #38bdf8;">Tradebd Setup Evaluator Mentor</a>.</p>
    `,
  },
];

function buildRouteHtml(baseHtml, item) {
  const canonicalUrl = `https://tradebd.online/${item.route}`;
  const safeTitle = escapeHtml(item.title);
  const safeDesc = escapeHtml(item.description);
  const safeH1 = escapeHtml(item.h1);
  const safeLead = escapeHtml(item.lead);

  let pageHtml = baseHtml;

  // 1. Replace <title>
  pageHtml = pageHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);

  // 2. Replace <meta name="description">
  pageHtml = pageHtml.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // 3. Replace canonical and hreflang links
  pageHtml = pageHtml.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );
  pageHtml = pageHtml.replace(
    /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/>/,
    `<link rel="alternate" hreflang="en" href="${canonicalUrl}" />`
  );
  pageHtml = pageHtml.replace(
    /<link\s+rel="alternate"\s+hreflang="bn"\s+href="[^"]*"\s*\/>/,
    `<link rel="alternate" hreflang="bn" href="${canonicalUrl}?lang=bn" />`
  );
  pageHtml = pageHtml.replace(
    /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/>/,
    `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`
  );

  // 4. Replace OpenGraph & Twitter meta tags
  if (item.route.startsWith('blog/')) {
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:type" content="article" />`
    );
  }
  pageHtml = pageHtml.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  pageHtml = pageHtml.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  pageHtml = pageHtml.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  pageHtml = pageHtml.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  pageHtml = pageHtml.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );

  // 5. Inject route-specific BreadcrumbList & BlogPosting Schema.org JSON-LD into <head>
  const isBlogArticle = item.route.startsWith('blog/');
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Tradebd Home',
      item: 'https://tradebd.online/',
    },
  ];
  if (isBlogArticle) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Trading Blog',
      item: 'https://tradebd.online/blog',
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: item.h1,
      item: canonicalUrl,
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: item.h1,
      item: canonicalUrl,
    });
  }

  const routeGraph = [
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
  ];

  if (isBlogArticle) {
    routeGraph.push({
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      headline: item.h1,
      description: item.description,
      image: item.coverImage || 'https://tradebd.online/og-banner.png',
      datePublished: item.publishedAt || '2025-02-20',
      dateModified: item.publishedAt || '2025-02-25',
      author: {
        '@type': 'Organization',
        name: item.author || 'Tradebd Editorial Team',
        url: 'https://tradebd.online/',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tradebd Financial Education Academy',
        logo: {
          '@type': 'ImageObject',
          url: 'https://tradebd.online/logo.svg',
        },
      },
      inLanguage: ['en', 'bn'],
    });
  }

  const routeJsonLdScript = `\n    <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': routeGraph,
  })}</script>\n  </head>`;

  pageHtml = pageHtml.replace('</head>', routeJsonLdScript);

  // 6. Replace <article>...</article> inside #seo-prerender with unique route-specific content
  const customArticle = `<article>
            <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0 0 14px 0;">
              ${safeH1}
            </h1>
            <p>${safeLead}</p>
            ${item.bodyHtml.trim()}
            <p style="margin-top: 20px;">
              Explore all interactive modules on <a href="https://tradebd.online/" style="color: #38bdf8;">Tradebd Live Chart Analysis</a>, <a href="https://tradebd.online/simulator" style="color: #38bdf8;">Paper Trading Simulator</a>, <a href="https://tradebd.online/calendar" style="color: #38bdf8;">Forex Economic Calendar (BST)</a>, <a href="https://tradebd.online/academy" style="color: #38bdf8;">Trading Academy</a>, <a href="https://tradebd.online/blog" style="color: #38bdf8;">Trading Blog</a>, <a href="https://tradebd.online/patterns" style="color: #38bdf8;">Candlestick Patterns</a>, <a href="https://tradebd.online/calculator" style="color: #38bdf8;">Lot Size Calculator</a>, and <a href="https://tradebd.online/mentor" style="color: #38bdf8;">AI Trade Mentor</a>. Official policies: <a href="https://tradebd.online/about" style="color: #38bdf8;">About Us</a>, <a href="https://tradebd.online/privacy" style="color: #38bdf8;">Privacy Policy</a>, <a href="https://tradebd.online/terms" style="color: #38bdf8;">Terms of Use</a>, <a href="https://tradebd.online/disclaimer" style="color: #38bdf8;">Risk Disclaimer</a>, and <a href="https://tradebd.online/contact" style="color: #38bdf8;">Contact Us</a>.
            </p>
          </article>`;

  pageHtml = pageHtml.replace(/<article>[\s\S]*?<\/article>/, customArticle);

  return pageHtml;
}

if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Inline external Vite stylesheet <link rel="stylesheet" crossorigin href="/assets/index-*.css">
  // to eliminate render-blocking CSS network requests on Mobile Slow 4G
  const cssLinkRegex = /<link\s+rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g;
  html = html.replace(cssLinkRegex, (fullMatch, href) => {
    const cssFilePath = path.join(distDir, href.replace(/^\//, ''));
    if (fs.existsSync(cssFilePath)) {
      const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
      return `<style id="inlined-bundle-css">${cssContent}</style>`;
    }
    return fullMatch;
  });

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✓ Inlined production CSS into dist/index.html (0 render-blocking CSS requests)');

  // Also load any custom published blogs from public/blogs-data.json so they get pre-rendered at build time
  const customBlogsPath = path.resolve('public/blogs-data.json');
  const allRoutes = [...PRERENDER_ROUTES];
  if (fs.existsSync(customBlogsPath)) {
    try {
      const customBlogs = JSON.parse(fs.readFileSync(customBlogsPath, 'utf-8'));
      if (Array.isArray(customBlogs)) {
        for (const cb of customBlogs) {
          if (cb && cb.slug) {
            const routeKey = `blog/${cb.slug}`;
            if (!allRoutes.some((r) => r.route === routeKey)) {
              const rawParagraphs = String(cb.contentEn || cb.contentBn || '')
                .split(/\n\n+/)
                .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
                .join('\n');
              allRoutes.push({
                route: routeKey,
                title: `${cb.titleEn || cb.titleBn} – Tradebd`,
                description: cb.excerptEn || cb.excerptBn || cb.titleEn || '',
                h1: cb.titleEn || cb.titleBn || 'Tradebd Blog Article',
                lead: cb.excerptBn || cb.excerptEn || '',
                bodyHtml: rawParagraphs,
                publishedAt: cb.publishedAt || '2025-02-25',
                author: cb.author || 'Tradebd Editorial Team',
                coverImage: cb.coverImage || 'https://tradebd.online/og-banner.png',
              });
            }
          }
        }
      }
    } catch {
      // ignore json parse error
    }
  }

  // Generate static pre-rendered HTML files for every route in sitemap.xml
  const prerenderDir = path.join(distDir, 'prerender');
  fs.mkdirSync(prerenderDir, { recursive: true });

  for (const item of allRoutes) {
    const routeHtml = buildRouteHtml(html, item);
    const outFile = path.join(prerenderDir, `${item.route}.html`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, routeHtml, 'utf-8');
  }

  console.log(
    `✓ Generated ${allRoutes.length} static pre-rendered route HTML files in dist/prerender/ with unique canonical & Schema.org tags`
  );
}
