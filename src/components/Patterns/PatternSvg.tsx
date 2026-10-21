import React from 'react';

interface PatternSvgProps {
  type: string;
  className?: string;
}

export const PatternSvg: React.FC<PatternSvgProps> = ({ type, className = 'w-full h-36' }) => {
  switch (type) {
    case 'hammer':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* Support Line */}
          <line x1="10" y1="95" x2="190" y2="95" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <text x="15" y="112" fill="#64748b" fontSize="9" fontFamily="sans-serif">Support Zone (ডিমান্ড লেভেল)</text>
          {/* Prior Red Candle */}
          <line x1="50" y1="25" x2="50" y2="75" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="42" y="35" width="16" height="30" fill="#ef4444" rx="1" />
          {/* Red Candle 2 */}
          <line x1="85" y1="45" x2="85" y2="85" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="77" y="55" width="16" height="25" fill="#ef4444" rx="1" />
          {/* Hammer Candle (Green) */}
          <line x1="120" y1="52" x2="120" y2="98" stroke="#10b981" strokeWidth="2" />
          <rect x="112" y="52" width="16" height="14" fill="#10b981" rx="1" />
          {/* Next confirmation candle */}
          <line x1="155" y1="30" x2="155" y2="70" stroke="#10b981" strokeWidth="1.5" />
          <rect x="147" y="35" width="16" height="28" fill="#10b981" rx="1" />
          {/* Annotation markers */}
          <text x="132" y="54" fill="#34d399" fontSize="8" fontWeight="600">Entry</text>
          <text x="130" y="102" fill="#f87171" fontSize="8">SL</text>
        </svg>
      );

    case 'bullish-engulfing':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          <line x1="10" y1="95" x2="190" y2="95" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          {/* Red candle */}
          <line x1="75" y1="45" x2="75" y2="80" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="67" y="52" width="16" height="20" fill="#ef4444" rx="1" />
          {/* Huge Green Engulfing candle */}
          <line x1="120" y1="30" x2="120" y2="92" stroke="#10b981" strokeWidth="2" />
          <rect x="110" y="38" width="20" height="48" fill="#10b981" rx="1" />
          {/* Reversal Arrow */}
          <path d="M145 65 L175 40" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
          <polygon points="178,38 174,44 171,39" fill="#10b981" />
          <text x="112" y="24" fill="#10b981" fontSize="9" fontWeight="600">Engulfs</text>
          <text x="135" y="96" fill="#f87171" fontSize="8">SL Below</text>
        </svg>
      );

    case 'morning-star':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* Candle 1 (Big Red) */}
          <line x1="55" y1="20" x2="55" y2="80" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="46" y="28" width="18" height="42" fill="#ef4444" rx="1" />
          {/* Candle 2 (Star / Small Doji at bottom) */}
          <line x1="95" y1="75" x2="95" y2="105" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="88" y="86" width="14" height="6" fill="#f59e0b" rx="1" />
          {/* Candle 3 (Big Green) */}
          <line x1="135" y1="25" x2="135" y2="88" stroke="#10b981" strokeWidth="2" />
          <rect x="126" y="32" width="18" height="48" fill="#10b981" rx="1" />
          {/* 50% line */}
          <line x1="46" y1="49" x2="144" y2="49" stroke="#64748b" strokeDasharray="2 2" strokeWidth="1" />
          <text x="150" y="52" fill="#94a3b8" fontSize="8">&gt;50% Close</text>
        </svg>
      );

    case 'shooting-star':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* Resistance Line */}
          <line x1="10" y1="25" x2="190" y2="25" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <text x="15" y="18" fill="#64748b" fontSize="9" fontFamily="sans-serif">Resistance Zone (সাপ্লাই লেভেল)</text>
          {/* Uptrend candle */}
          <line x1="50" y1="45" x2="50" y2="95" stroke="#10b981" strokeWidth="1.5" />
          <rect x="42" y="55" width="16" height="30" fill="#10b981" rx="1" />
          {/* Shooting Star with long upper wick */}
          <line x1="95" y1="22" x2="95" y2="68" stroke="#ef4444" strokeWidth="2" />
          <rect x="87" y="54" width="16" height="12" fill="#ef4444" rx="1" />
          {/* Downward reversal confirmation */}
          <line x1="140" y1="58" x2="140" y2="100" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="132" y="65" width="16" height="28" fill="#ef4444" rx="1" />
          <text x="105" y="24" fill="#f87171" fontSize="8">SL Above</text>
          <text x="107" y="70" fill="#f87171" fontSize="8">Sell Entry</text>
        </svg>
      );

    case 'bearish-engulfing':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          <line x1="10" y1="25" x2="190" y2="25" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          {/* Small green */}
          <line x1="75" y1="40" x2="75" y2="75" stroke="#10b981" strokeWidth="1.5" />
          <rect x="67" y="48" width="16" height="20" fill="#10b981" rx="1" />
          {/* Huge Red Engulfing */}
          <line x1="120" y1="28" x2="120" y2="90" stroke="#ef4444" strokeWidth="2" />
          <rect x="110" y="34" width="20" height="48" fill="#ef4444" rx="1" />
          <text x="112" y="102" fill="#f87171" fontSize="8">Bearish Dominance</text>
        </svg>
      );

    case 'evening-star':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* 1 Big Green */}
          <line x1="55" y1="35" x2="55" y2="95" stroke="#10b981" strokeWidth="1.5" />
          <rect x="46" y="42" width="18" height="44" fill="#10b981" rx="1" />
          {/* Star at top */}
          <line x1="95" y1="15" x2="95" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="88" y="22" width="14" height="6" fill="#f59e0b" rx="1" />
          {/* 3 Big Red */}
          <line x1="135" y1="30" x2="135" y2="95" stroke="#ef4444" strokeWidth="2" />
          <rect x="126" y="38" width="18" height="46" fill="#ef4444" rx="1" />
          <path d="M150 50 L180 80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );

    case 'doji':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          <line x1="100" y1="20" x2="100" y2="100" stroke="#94a3b8" strokeWidth="2" />
          <line x1="82" y1="60" x2="118" y2="60" stroke="#94a3b8" strokeWidth="3" />
          <text x="40" y="45" fill="#64748b" fontSize="8">Upper Wick (Rejection)</text>
          <text x="40" y="80" fill="#64748b" fontSize="8">Lower Wick (Support)</text>
          <text x="125" y="63" fill="#f59e0b" fontSize="9" fontWeight="600">Open = Close</text>
        </svg>
      );

    case 'double-bottom':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* Neckline */}
          <line x1="20" y1="50" x2="180" y2="50" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x="25" y="44" fill="#f59e0b" fontSize="9" fontWeight="600">Neckline (নেকলাইন)</text>
          {/* Support Line */}
          <line x1="20" y1="95" x2="180" y2="95" stroke="#334155" strokeWidth="1" />
          {/* W Shape Path */}
          <path
            d="M 30 35 L 65 95 L 100 50 L 135 95 L 170 30"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Points */}
          <circle cx="65" cy="95" r="3.5" fill="#10b981" />
          <circle cx="135" cy="95" r="3.5" fill="#10b981" />
          <text x="52" y="110" fill="#94a3b8" fontSize="8">Bottom 1</text>
          <text x="122" y="110" fill="#94a3b8" fontSize="8">Bottom 2</text>
          <text x="145" y="32" fill="#34d399" fontSize="8" fontWeight="600">Breakout & Target</text>
        </svg>
      );

    case 'double-top':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* Resistance Line */}
          <line x1="20" y1="30" x2="180" y2="30" stroke="#334155" strokeWidth="1" />
          {/* Neckline */}
          <line x1="20" y1="75" x2="180" y2="75" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x="25" y="70" fill="#f59e0b" fontSize="9" fontWeight="600">Neckline (নেকলাইন)</text>
          {/* M Shape Path */}
          <path
            d="M 30 90 L 65 30 L 100 75 L 135 30 L 170 100"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="65" cy="30" r="3.5" fill="#ef4444" />
          <circle cx="135" cy="30" r="3.5" fill="#ef4444" />
          <text x="54" y="22" fill="#94a3b8" fontSize="8">Top 1</text>
          <text x="124" y="22" fill="#94a3b8" fontSize="8">Top 2</text>
          <text x="145" y="112" fill="#f87171" fontSize="8" fontWeight="600">Breakdown</text>
        </svg>
      );

    case 'head-shoulders':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none">
          {/* Neckline */}
          <line x1="20" y1="80" x2="180" y2="80" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x="25" y="75" fill="#f59e0b" fontSize="8" fontWeight="600">Neckline</text>
          {/* Head and shoulders path */}
          <path
            d="M 25 80 L 50 45 L 75 80 L 100 20 L 125 80 L 150 45 L 175 95"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="40" y="38" fill="#94a3b8" fontSize="8">Left Sh.</text>
          <text x="92" y="14" fill="#f87171" fontSize="9" fontWeight="bold">Head</text>
          <text x="140" y="38" fill="#94a3b8" fontSize="8">Right Sh.</text>
        </svg>
      );

    default:
      return (
        <div className="w-full h-28 flex items-center justify-center text-xs text-slate-500">
          Diagram preview
        </div>
      );
  }
};
