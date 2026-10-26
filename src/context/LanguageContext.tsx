import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

export type Language =
  | 'en'
  | 'bn'
  | 'hi'
  | 'ur'
  | 'ar'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'id'
  | 'ms'
  | 'ru'
  | 'tr'
  | 'zh-CN'
  | 'ja'
  | 'ko'
  | 'vi';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
  nativeSupport?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (Default)', nativeName: 'English', flag: '🇺🇸', dir: 'ltr', nativeSupport: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr', nativeSupport: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
];

const LANG_STORAGE_KEY = 'tradebd_lang_v2';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: {
          new (
            options: {
              pageLanguage: string;
              autoDisplay?: boolean;
              includedLanguages?: string;
            },
            elementId: string
          ): unknown;
        };
      };
    };
  }
}

function triggerGoogleTranslate(targetLang: Language) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // English and Bengali are 100% natively translated across the entire app
  if (targetLang === 'en' || targetLang === 'bn') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo && combo.value) {
      combo.value = 'en';
      combo.dispatchEvent(new Event('change'));
    }
    return;
  }

  document.cookie = `googtrans=/en/${targetLang}; path=/;`;

  const applyComboChange = () => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  };

  if (applyComboChange()) return;

  // Load Google Website Translator script on demand if not yet loaded
  if (!document.getElementById('google-translate-script')) {
    let container = document.getElementById('google_translate_element');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google_translate_element';
      container.className = 'hidden';
      document.body.appendChild(container);
    }

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setTimeout(applyComboChange, 400);
        setTimeout(applyComboChange, 1200);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  } else {
    setTimeout(applyComboChange, 400);
  }
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
  currentLangOption: LanguageOption;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const urlLang = new URLSearchParams(window.location.search).get('lang') as Language | null;
        if (urlLang && SUPPORTED_LANGUAGES.some((l) => l.code === urlLang)) {
          return urlLang;
        }
      }
      // Remove legacy storage key so site defaults to English ('en')
      localStorage.removeItem('app_language');
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      // fallback
    }
    return 'en'; // Global default is English
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
      if (typeof window !== 'undefined' && window.location.search.includes('lang=')) {
        const url = new URL(window.location.href);
        if (newLang === 'en') {
          url.searchParams.delete('lang');
        } else {
          url.searchParams.set('lang', newLang);
        }
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    } catch (e) {
      // ignore
    }
    triggerGoogleTranslate(newLang);
  };

  const currentLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isRtl = currentLangOption.dir === 'rtl';

  const [extraDicts, setExtraDicts] = useState<Partial<Record<Language, Record<string, string>>>>({});

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (language !== 'en' && language !== 'bn') {
      import('../i18n/extraTranslations')
        .then((mod) => {
          setExtraDicts(mod.EXTRA_TRANSLATIONS);
        })
        .catch(() => {
          // ignore
        });
      triggerGoogleTranslate(language);
    }
  }, [language, isRtl]);

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || extraDicts[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    return TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRtl,
        currentLangOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
