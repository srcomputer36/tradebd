import { Asset, Candle } from '../types/trading';

export const CRYPTO_ASSETS: Asset[] = [
  {
    id: 'btc-usdt',
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    nameBn: 'বিটকয়েন',
    category: 'crypto',
    basePrice: 67450.0,
    precision: 2,
    minQty: 0.001,
    leverageMax: 20,
    localizedNames: {
      en: 'Bitcoin',
      bn: 'বিটকয়েন',
      es: 'Bitcoin',
      hi: 'बिटकॉइन',
      ar: 'بيتكوين',
      fr: 'Bitcoin',
      de: 'Bitcoin',
      ja: 'ビットコイン',
    },
  },
  {
    id: 'eth-usdt',
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    nameBn: 'ইথেরিয়াম',
    category: 'crypto',
    basePrice: 3480.0,
    precision: 2,
    minQty: 0.01,
    leverageMax: 20,
    localizedNames: {
      en: 'Ethereum',
      bn: 'ইথেরিয়াম',
      es: 'Ethereum',
      hi: 'इथेरियम',
      ar: 'إيثيريوم',
      fr: 'Ethereum',
      de: 'Ethereum',
      ja: 'イーサリアム',
    },
  },
  {
    id: 'sol-usdt',
    symbol: 'SOL/USDT',
    name: 'Solana',
    nameBn: 'সোলানা',
    category: 'crypto',
    basePrice: 178.5,
    precision: 2,
    minQty: 0.1,
    leverageMax: 20,
    localizedNames: {
      en: 'Solana',
      bn: 'সোলানা',
      es: 'Solana',
      hi: 'सोलाना',
      ar: 'سولانا',
      fr: 'Solana',
      de: 'Solana',
      ja: 'ソラナ',
    },
  },
  {
    id: 'bnb-usdt',
    symbol: 'BNB/USDT',
    name: 'BNB Coin',
    nameBn: 'বিএনবি কয়েন',
    category: 'crypto',
    basePrice: 595.2,
    precision: 2,
    minQty: 0.05,
    leverageMax: 20,
    localizedNames: {
      en: 'BNB Coin',
      bn: 'বিএনবি কয়েন',
      es: 'BNB Coin',
      hi: 'बीएनबी कॉइन',
      ar: 'عملة BNB',
      fr: 'BNB Coin',
      de: 'BNB Coin',
      ja: 'バイナンスコイン',
    },
  },
  {
    id: 'xrp-usdt',
    symbol: 'XRP/USDT',
    name: 'Ripple',
    nameBn: 'রিপল (XRP)',
    category: 'crypto',
    basePrice: 0.624,
    precision: 4,
    minQty: 10,
    leverageMax: 20,
    localizedNames: {
      en: 'Ripple',
      bn: 'রিপল (XRP)',
      es: 'Ripple',
      hi: 'रिपल (XRP)',
      ar: 'ريبل (XRP)',
      fr: 'Ripple',
      de: 'Ripple',
      ja: 'リップル (XRP)',
    },
  },
  {
    id: 'ada-usdt',
    symbol: 'ADA/USDT',
    name: 'Cardano',
    nameBn: 'কার্ডানো (ADA)',
    category: 'crypto',
    basePrice: 0.458,
    precision: 4,
    minQty: 10,
    leverageMax: 20,
    localizedNames: {
      en: 'Cardano',
      bn: 'কার্ডানো (ADA)',
      es: 'Cardano',
      hi: 'कार्डानो (ADA)',
      ar: 'كاردانو (ADA)',
      fr: 'Cardano',
      de: 'Cardano',
      ja: 'カルダノ (ADA)',
    },
  },
];

export const FOREX_ASSETS: Asset[] = [
  {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    nameBn: 'ইউরো / মার্কিন ডলার',
    category: 'forex',
    basePrice: 1.0845,
    precision: 4,
    minQty: 100,
    leverageMax: 30,
    localizedNames: {
      en: 'Euro / US Dollar',
      bn: 'ইউরো / মার্কিন ডলার',
      es: 'Euro / Dólar EE.UU.',
      hi: 'यूरो / अमेरिकी डॉलर',
      ar: 'اليورو / الدولار الأمريكي',
      fr: 'Euro / Dollar US',
      de: 'Euro / US-Dollar',
      ja: 'ユーロ / 米ドル',
    },
  },
  {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'British Pound / USD',
    nameBn: 'ব্রিটিশ পাউন্ড / ডলার',
    category: 'forex',
    basePrice: 1.296,
    precision: 4,
    minQty: 100,
    leverageMax: 30,
    localizedNames: {
      en: 'British Pound / USD',
      bn: 'ব্রিটিশ পাউন্ড / ডলার',
      es: 'Libra Esterlina / USD',
      hi: 'ब्रिटिश पाउंड / डॉलर',
      ar: 'الجنيه الإسترليني / الدولار',
      fr: 'Livre Sterling / USD',
      de: 'Britisches Pfund / USD',
      ja: '英ポンド / 米ドル',
    },
  },
  {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    nameBn: 'মার্কিন ডলার / জাপানি ইয়েন',
    category: 'forex',
    basePrice: 153.4,
    precision: 2,
    minQty: 100,
    leverageMax: 30,
    localizedNames: {
      en: 'US Dollar / Japanese Yen',
      bn: 'মার্কিন ডলার / জাপানি ইয়েন',
      es: 'Dólar EE.UU. / Yen Japonés',
      hi: 'अमेरिकी डॉलर / जापानी येन',
      ar: 'الدولار الأمريكي / الين الياباني',
      fr: 'Dollar US / Yen Japonais',
      de: 'US-Dollar / Japanischer Yen',
      ja: '米ドル / 日本円',
    },
  },
  {
    id: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot / USD',
    nameBn: 'স্বর্ণ (Gold / USD)',
    category: 'forex',
    basePrice: 2420.5,
    precision: 2,
    minQty: 0.1,
    leverageMax: 20,
    localizedNames: {
      en: 'Gold Spot / USD',
      bn: 'স্বর্ণ (Gold / USD)',
      es: 'Oro Spot / USD',
      hi: 'सोना (Gold / USD)',
      ar: 'الذهب الفوري / الدولار',
      fr: 'Or Spot / USD',
      de: 'Gold Spot / USD',
      ja: 'スポット金 / 米ドル',
    },
  },
  {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'Australian Dollar / USD',
    nameBn: 'অস্ট্রেলিয়ান ডলার / USD',
    category: 'forex',
    basePrice: 0.6685,
    precision: 4,
    minQty: 100,
    leverageMax: 30,
    localizedNames: {
      en: 'Australian Dollar / USD',
      bn: 'অস্ট্রেলিয়ান ডলার / USD',
      es: 'Dólar Australiano / USD',
      hi: 'ऑस्ट्रेलियाई डॉलर / USD',
      ar: 'الدولار الأسترالي / الدولار',
      fr: 'Dollar Australien / USD',
      de: 'Australischer Dollar / USD',
      ja: '豪ドル / 米ドル',
    },
  },
  {
    id: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    nameBn: 'মার্কিন ডলার / কানাডিয়ান ডলার',
    category: 'forex',
    basePrice: 1.382,
    precision: 4,
    minQty: 100,
    leverageMax: 30,
    localizedNames: {
      en: 'US Dollar / Canadian Dollar',
      bn: 'মার্কিন ডলার / কানাডিয়ান ডলার',
      es: 'Dólar EE.UU. / Dólar Canadiense',
      hi: 'अमेरिकी डॉलर / कैनेडियन डॉलर',
      ar: 'الدولار الأمريكي / الدولار الكندي',
      fr: 'Dollar US / Dollar Canadien',
      de: 'US-Dollar / Kanadischer Dollar',
      ja: '米ドル / カナダドル',
    },
  },
];

export const TRADING_ASSETS: Asset[] = [...CRYPTO_ASSETS, ...FOREX_ASSETS];

/**
 * Generate a realistic historical candlestick series
 */
export function generateCandles(asset: Asset, count: number = 80): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const intervalMs = 60 * 1000 * 15; // 15 minute interval standard

  let currentPrice = asset.basePrice * 0.94; // start slightly below base
  const volatility = asset.category === 'forex' ? 0.0012 : 0.0065;

  let trendDirection = 1;
  let trendSteps = 0;

  for (let i = count; i >= 0; i--) {
    const time = now - i * intervalMs;

    // Trend simulation with mean-reversion
    trendSteps++;
    if (trendSteps > 8 + Math.floor(Math.random() * 8)) {
      trendDirection = Math.random() > 0.45 ? 1 : -1;
      trendSteps = 0;
    }

    const drift = trendDirection * volatility * 0.35;
    const shock = (Math.random() - 0.49) * volatility * 1.8;
    const delta = drift + shock;

    const open = currentPrice;
    let close = open * (1 + delta);
    if (close <= 0.0001) close = open;

    const highExtra = Math.random() * volatility * open * 1.2;
    const lowExtra = Math.random() * volatility * open * 1.2;

    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;

    // Realistic volume
    const baseVol = asset.category === 'crypto' ? 45 : 120;
    const volMultiplier = 0.5 + Math.random() * 1.8 + Math.abs(delta) * 120;
    const volume = Math.round(baseVol * volMultiplier);

    candles.push({
      time,
      open: Number(open.toFixed(asset.precision)),
      high: Number(high.toFixed(asset.precision)),
      low: Number(low.toFixed(asset.precision)),
      close: Number(close.toFixed(asset.precision)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Create a live simulated tick to update the latest candle or create a new candle
 */
export function simulateTick(
  lastCandle: Candle,
  asset: Asset,
  isNewCandle: boolean
): { updatedCandle: Candle; newCandle?: Candle } {
  const volatility = asset.category === 'forex' ? 0.0003 : 0.0015;
  const changePercent = (Math.random() - 0.495) * volatility;
  const newPrice = Number((lastCandle.close * (1 + changePercent)).toFixed(asset.precision));

  if (isNewCandle) {
    const newCandle: Candle = {
      time: Date.now(),
      open: lastCandle.close,
      high: Math.max(lastCandle.close, newPrice),
      low: Math.min(lastCandle.close, newPrice),
      close: newPrice,
      volume: Math.round(Math.random() * 25 + 5),
    };
    return { updatedCandle: lastCandle, newCandle };
  }

  const updatedCandle: Candle = {
    ...lastCandle,
    high: Number(Math.max(lastCandle.high, newPrice).toFixed(asset.precision)),
    low: Number(Math.min(lastCandle.low, newPrice).toFixed(asset.precision)),
    close: newPrice,
    volume: lastCandle.volume + Math.round(Math.random() * 6 + 1),
  };

  return { updatedCandle };
}
