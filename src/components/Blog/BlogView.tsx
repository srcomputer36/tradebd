import React, { useState, useEffect, useMemo } from 'react';
import {
  BLOG_CATEGORIES,
  BlogArticle,
  BlogCategory,
  INITIAL_BLOG_ARTICLES,
} from '../../data/blogData';
import { useLanguage } from '../../context/LanguageContext';
import {
  BookOpen,
  PenTool,
  Search,
  Clock,
  Calendar,
  Tag,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trash2,
  Edit3,
  Copy,
  Check,
  TrendingUp,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Globe,
  Eye,
  Plus,
  X,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  Languages,
  RefreshCw,
} from 'lucide-react';
import { NavTab } from '../Navbar';

interface BlogViewProps {
  initialSlug?: string | null;
  onSelectSlug?: (slug: string | null) => void;
  onNavigateTab?: (tab: NavTab) => void;
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

const STORAGE_KEY = 'tradebd_custom_blogs_v1';
const ADMIN_SESSION_KEY = 'tradebd_blog_admin_key';

function hasBengaliChars(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

function createSlug(text: string): string {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `article-${Date.now()}`;
}

// Translate a single chunk (<= 1200 chars) via browser GTX or server fallback
async function translateSingleChunk(
  chunk: string,
  sourceLang: 'bn' | 'en',
  targetLang: 'bn' | 'en'
): Promise<string> {
  const trimmed = chunk.trim();
  if (!trimmed || sourceLang === targetLang) return chunk;

  // 1. Try direct browser Google Translate GTX API first (fast, zero-key)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const combined = data[0]
          .map((seg: unknown) =>
            Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''
          )
          .join('');
        if (combined.trim()) {
          return cleanupMarkdownAfterTranslation(combined);
        }
      }
    }
  } catch {
    // Fallback to server proxy below
  }

  // 2. Fallback to cPanel PHP endpoint or Express server proxy
  const endpoints = ['/api-blogs.php', '/api/blogs'];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          text: trimmed,
          sourceLang,
          targetLang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.translatedText === 'string' && data.translatedText.trim()) {
          return cleanupMarkdownAfterTranslation(data.translatedText);
        }
      }
    } catch {
      // try next
    }
  }

  return chunk;
}

// Smart markdown-preserving bidirectional translator (BN <-> EN) with safe chunking for long articles
async function translateTextSmart(
  text: string,
  sourceLang: 'bn' | 'en',
  targetLang: 'bn' | 'en'
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return text;

  // 1 Bengali UTF-8 character is 9 URL-encoded bytes (%E0%A6%..), so 450 chars keeps GET URLs safely under 4KB
  const MAX_CHUNK_LEN = 450;
  if (trimmed.length <= MAX_CHUNK_LEN) {
    const single = await translateSingleChunk(trimmed, sourceLang, targetLang);
    return cleanupMarkdownAfterTranslation(single);
  }

  // Split long articles by paragraph boundaries (\n\n), and further split oversized paragraphs by sentence
  const paragraphs = trimmed.split(/\n\n+/);
  const translatedParagraphs: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_LEN) {
      const tPara = await translateSingleChunk(para, sourceLang, targetLang);
      translatedParagraphs.push(tPara);
    } else {
      const sentences = para.split(/(?<=[।.!?\n])\s+/);
      const subChunks: string[] = [];
      let current = '';
      for (const sent of sentences) {
        if (!current) {
          current = sent;
        } else if (current.length + 1 + sent.length <= MAX_CHUNK_LEN) {
          current += ' ' + sent;
        } else {
          subChunks.push(current);
          current = sent;
        }
      }
      if (current) subChunks.push(current);

      const translatedSub: string[] = [];
      for (const sc of subChunks) {
        translatedSub.push(await translateSingleChunk(sc, sourceLang, targetLang));
      }
      translatedParagraphs.push(translatedSub.join(' '));
    }
  }

  return cleanupMarkdownAfterTranslation(translatedParagraphs.join('\n\n'));
}

function cleanupMarkdownAfterTranslation(raw: string): string {
  return raw
    .replace(/^#\s*#\s*/gm, '## ')
    .replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**')
    .replace(/💡\s*/g, '💡 ')
    .replace(/⚠️\s*/g, '⚠️ ');
}

export const BlogView: React.FC<BlogViewProps> = ({
  initialSlug,
  onSelectSlug,
  onNavigateTab,
  onShowToast,
}) => {
  const { language, setLanguage } = useLanguage();
  const isBn = language === 'bn';

  // Admin Authentication State (only Admin can write, edit, or delete articles)
  const [adminKey, setAdminKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem(ADMIN_SESSION_KEY));
    } catch {
      return false;
    }
  });

  // Admin Login & Change Password Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isVerifyingLogin, setIsVerifyingLogin] = useState<boolean>(false);

  const [showChangePassModal, setShowChangePassModal] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [isUpdatingPass, setIsUpdatingPass] = useState<boolean>(false);

  // Custom / user-published articles state
  const [customArticles, setCustomArticles] = useState<BlogArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(
    initialSlug || null
  );
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSavingServer, setIsSavingServer] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Active editor tab language ('bn' or 'en') so Admin can write in either language & see both
  const [editorLangTab, setEditorLangTab] = useState<'bn' | 'en'>('bn');

  // Bilingual Editor Form Fields (Bengali & English)
  const [titleBnInput, setTitleBnInput] = useState<string>('');
  const [titleEnInput, setTitleEnInput] = useState<string>('');
  const [slugInput, setSlugInput] = useState<string>('');
  const [excerptBnInput, setExcerptBnInput] = useState<string>('');
  const [excerptEnInput, setExcerptEnInput] = useState<string>('');
  const [categoryInput, setCategoryInput] =
    useState<Exclude<BlogCategory, 'ALL'>>('FOREX');
  const [authorInput, setAuthorInput] = useState<string>('Tradebd Editorial Team');
  const [keywordsInput, setKeywordsInput] = useState<string>(
    'ফরেক্স ট্রেডিং বাংলা, ট্রেডিং শেখার নিয়ম, ক্যান্ডেলস্টিক চার্ট, ডেমো ট্রেডিং, Forex Trading Guide'
  );
  const [takeawaysBnInput, setTakeawaysBnInput] = useState<string>(
    'প্রতিটি ট্রেডে অবশ্যই স্টপ লস (Stop Loss) ব্যবহার করুন।\nমোট একাউন্ট ব্যালেন্সের ১% থেকে ২%-এর বেশি ঝুঁকি নেবেন না।\nরিয়েল মার্কেটে যাওয়ার আগে ভার্চুয়াল পেপার ট্রেডিং সিমুলেটরে অনুশীলন করুন।'
  );
  const [takeawaysEnInput, setTakeawaysEnInput] = useState<string>(
    'Always use a Stop Loss on every single trade.\nNever risk more than 1% to 2% of your total account balance.\nPractice on the virtual paper trading simulator before risking real capital.'
  );
  const [contentBnInput, setContentBnInput] = useState<string>('');
  const [contentEnInput, setContentEnInput] = useState<string>('');
  const [ctaTabInput, setCtaTabInput] = useState<
    'CHART' | 'SIMULATOR' | 'CALENDAR' | 'CALCULATOR' | 'PATTERNS' | 'ACADEMY' | 'MENTOR'
  >('SIMULATOR');

  // Sync with prop initialSlug
  useEffect(() => {
    if (initialSlug !== undefined) {
      setActiveArticleSlug(initialSlug);
    }
  }, [initialSlug]);

  // Fetch server-saved articles on mount (supports both cPanel api-blogs.php and Express /api/blogs)
  useEffect(() => {
    let isMounted = true;
    async function loadServerBlogs() {
      const endpoints = ['/api-blogs.php', '/api/blogs'];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) continue;
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) continue;
          const data = await res.json();
          if (data && Array.isArray(data.articles) && isMounted) {
            setCustomArticles((prev) => {
              const map = new Map<string, BlogArticle>();
              for (const item of prev) map.set(item.id, item);
              for (const item of data.articles) {
                if (item && item.id && (item.titleBn || item.titleEn)) {
                  map.set(item.id, item);
                }
              }
              const merged = Array.from(map.values());
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {
                // ignore
              }
              return merged;
            });
            break;
          }
        } catch {
          // continue to fallback
        }
      }
    }
    loadServerBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Combine custom articles + default built-in articles (custom overrides if same id)
  const allArticles = useMemo(() => {
    const customIds = new Set(customArticles.map((a) => a.id));
    const defaults = INITIAL_BLOG_ARTICLES.filter((a) => !customIds.has(a.id));
    return [...customArticles, ...defaults];
  }, [customArticles]);

  const activeArticle = useMemo(() => {
    if (!activeArticleSlug) return null;
    return (
      allArticles.find(
        (a) =>
          a.slug.toLowerCase() === activeArticleSlug.toLowerCase() ||
          a.id.toLowerCase() === activeArticleSlug.toLowerCase()
      ) || null
    );
  }, [allArticles, activeArticleSlug]);

  // Runtime Auto-Translation for older custom articles if one language was identical to the other
  useEffect(() => {
    if (!activeArticle || !activeArticle.isCustom) return;
    const sameContent =
      activeArticle.contentBn.trim() === activeArticle.contentEn.trim();
    if (!sameContent) return;

    const isSourceBn = hasBengaliChars(activeArticle.contentBn);
    // If user is viewing in English and article is only in Bengali, or vice versa:
    if ((isBn && !isSourceBn) || (!isBn && isSourceBn)) {
      let cancelled = false;
      const fromLang: 'bn' | 'en' = isSourceBn ? 'bn' : 'en';
      const toLang: 'bn' | 'en' = isSourceBn ? 'en' : 'bn';

      (async () => {
        const [tTitle, tExcerpt, tContent, tTakeaways] = await Promise.all([
          translateTextSmart(
            isSourceBn ? activeArticle.titleBn : activeArticle.titleEn,
            fromLang,
            toLang
          ),
          translateTextSmart(
            isSourceBn ? activeArticle.excerptBn : activeArticle.excerptEn,
            fromLang,
            toLang
          ),
          translateTextSmart(
            isSourceBn ? activeArticle.contentBn : activeArticle.contentEn,
            fromLang,
            toLang
          ),
          translateTextSmart(
            (isSourceBn
              ? activeArticle.keyTakeawaysBn
              : activeArticle.keyTakeawaysEn
            ).join('\n'),
            fromLang,
            toLang
          ),
        ]);

        if (cancelled) return;

        const patched: BlogArticle = {
          ...activeArticle,
          titleBn: toLang === 'bn' ? tTitle : activeArticle.titleBn,
          titleEn: toLang === 'en' ? tTitle : activeArticle.titleEn,
          excerptBn: toLang === 'bn' ? tExcerpt : activeArticle.excerptBn,
          excerptEn: toLang === 'en' ? tExcerpt : activeArticle.excerptEn,
          contentBn: toLang === 'bn' ? tContent : activeArticle.contentBn,
          contentEn: toLang === 'en' ? tContent : activeArticle.contentEn,
          keyTakeawaysBn:
            toLang === 'bn'
              ? tTakeaways.split('\n').map((s) => s.trim()).filter(Boolean)
              : activeArticle.keyTakeawaysBn,
          keyTakeawaysEn:
            toLang === 'en'
              ? tTakeaways.split('\n').map((s) => s.trim()).filter(Boolean)
              : activeArticle.keyTakeawaysEn,
        };

        setCustomArticles((prev) => {
          const next = prev.map((a) => (a.id === patched.id ? patched : a));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      })();

      return () => {
        cancelled = true;
      };
    }
  }, [activeArticle, isBn]);

  // Dynamic SEO Title, Meta Description & BlogPosting JSON-LD when viewing an article
  useEffect(() => {
    if (!activeArticle) return;

    const articleTitle = `${isBn ? activeArticle.titleBn : activeArticle.titleEn} – Tradebd Blog`;
    const articleDesc = isBn ? activeArticle.excerptBn : activeArticle.excerptEn;
    const articleUrl = `https://tradebd.online/blog/${encodeURIComponent(activeArticle.slug)}`;

    document.title = articleTitle;

    const setMetaTag = (selector: string, attr: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, content);
    };

    setMetaTag('meta[name="description"]', 'content', articleDesc);
    setMetaTag('meta[property="og:title"]', 'content', articleTitle);
    setMetaTag('meta[property="og:description"]', 'content', articleDesc);
    setMetaTag('meta[property="og:url"]', 'content', articleUrl);
    setMetaTag('link[rel="canonical"]', 'href', articleUrl);

    // Inject dynamic BlogPosting JSON-LD for Google Rich Snippets
    const scriptId = 'tradebd-blogposting-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: activeArticle.titleBn,
      alternativeHeadline: activeArticle.titleEn,
      description: activeArticle.excerptBn,
      author: {
        '@type': 'Organization',
        name: activeArticle.author || 'Tradebd Editorial Team',
        url: 'https://tradebd.online/',
      },
      publisher: {
        '@type': 'EducationalOrganization',
        name: 'Tradebd Financial Education Academy',
        url: 'https://tradebd.online/',
      },
      datePublished: activeArticle.publishedAt,
      dateModified: activeArticle.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      keywords: activeArticle.keywords.join(', '),
      inLanguage: ['bn-BD', 'en-US'],
    });

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [activeArticle, isBn]);

  // Filtered articles for Blog Hub
  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const matchesCat =
        selectedCategory === 'ALL' || article.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        article.titleBn.toLowerCase().includes(q) ||
        article.titleEn.toLowerCase().includes(q) ||
        article.excerptBn.toLowerCase().includes(q) ||
        article.excerptEn.toLowerCase().includes(q) ||
        article.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [allArticles, selectedCategory, searchQuery]);

  // Active editor fields for SEO score evaluation
  const activeTitleForSeo =
    editorLangTab === 'bn'
      ? titleBnInput || titleEnInput
      : titleEnInput || titleBnInput;
  const activeExcerptForSeo =
    editorLangTab === 'bn'
      ? excerptBnInput || excerptEnInput
      : excerptEnInput || excerptBnInput;
  const activeContentForSeo =
    editorLangTab === 'bn'
      ? contentBnInput || contentEnInput
      : contentEnInput || contentBnInput;

  // Live SEO Score Calculator in Editor
  const seoEvaluation = useMemo(() => {
    const checks = [
      {
        label: isBn
          ? 'আকর্ষণীয় শিরোনাম (২০+ অক্ষর)'
          : 'Compelling Title (20+ chars)',
        passed: activeTitleForSeo.trim().length >= 20,
      },
      {
        label: isBn
          ? 'এসইও মেটা বিবরণ / সারসংক্ষেপ (৫০+ অক্ষর)'
          : 'SEO Meta Description (50+ chars)',
        passed: activeExcerptForSeo.trim().length >= 50,
      },
      {
        label: isBn
          ? 'সাব-হেডিং (##) ব্যবহার করা হয়েছে'
          : 'Contains Subheadings (##)',
        passed: activeContentForSeo.includes('## '),
      },
      {
        label: isBn
          ? 'বিস্তারিত আর্টিকেল বডি (৩০০+ অক্ষর)'
          : 'Detailed Content Body (300+ chars)',
        passed: activeContentForSeo.trim().length >= 300,
      },
      {
        label: isBn
          ? 'কমপক্ষে ৩টি ফোকাস কিওয়ার্ড যুক্ত'
          : 'At least 3 Focus Keywords',
        passed:
          keywordsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean).length >= 3,
      },
    ];
    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);
    return { score, checks };
  }, [activeTitleForSeo, activeExcerptForSeo, activeContentForSeo, keywordsInput, isBn]);

  // Manual 1-Click Auto-Translate in Editor (BN -> EN or EN -> BN)
  const handleManualAutoTranslate = async (
    direction?: 'BN_TO_EN' | 'EN_TO_BN'
  ) => {
    const dir =
      direction ||
      (editorLangTab === 'bn' || hasBengaliChars(titleBnInput || contentBnInput)
        ? 'BN_TO_EN'
        : 'EN_TO_BN');

    setIsTranslating(true);
    try {
      if (dir === 'BN_TO_EN') {
        const srcTitle = titleBnInput.trim();
        const srcExcerpt = excerptBnInput.trim();
        const srcContent = contentBnInput.trim();
        const srcTakeaways = takeawaysBnInput.trim();

        if (!srcTitle && !srcContent) {
          onShowToast?.(
            isBn
              ? 'অনুবাদ করার জন্য প্রথমে বাংলায় শিরোনাম বা মূল লেখা লিখুন।'
              : 'Please enter Bengali title or content first to translate to English.',
            'info'
          );
          setIsTranslating(false);
          return;
        }

        const [trTitle, trExcerpt, trContent, trTakeaways] = await Promise.all([
          srcTitle ? translateTextSmart(srcTitle, 'bn', 'en') : Promise.resolve(''),
          srcExcerpt ? translateTextSmart(srcExcerpt, 'bn', 'en') : Promise.resolve(''),
          srcContent ? translateTextSmart(srcContent, 'bn', 'en') : Promise.resolve(''),
          srcTakeaways
            ? translateTextSmart(srcTakeaways, 'bn', 'en')
            : Promise.resolve(''),
        ]);

        if (trTitle) {
          setTitleEnInput(trTitle);
          if (!slugInput || hasBengaliChars(slugInput)) {
            setSlugInput(createSlug(trTitle));
          }
        }
        if (trExcerpt) setExcerptEnInput(trExcerpt);
        if (trContent) setContentEnInput(trContent);
        if (trTakeaways) setTakeawaysEnInput(trTakeaways);

        setEditorLangTab('en');
        onShowToast?.(
          isBn
            ? '✅ বাংলা থেকে ইংরেজিতে সম্পূর্ণ আর্টিকেল স্বয়ংক্রিয়ভাবে অনুবাদ করা হয়েছে!'
            : '✅ Entire article automatically translated from Bengali to English!',
          'success'
        );
      } else {
        // EN_TO_BN
        const srcTitle = titleEnInput.trim() || titleBnInput.trim();
        const srcExcerpt = excerptEnInput.trim() || excerptBnInput.trim();
        const srcContent = contentEnInput.trim() || contentBnInput.trim();
        const srcTakeaways = takeawaysEnInput.trim() || takeawaysBnInput.trim();

        if (!srcTitle && !srcContent) {
          onShowToast?.(
            isBn
              ? 'অনুবাদ করার জন্য প্রথমে ইংরেজিতে শিরোনাম বা মূল লেখা লিখুন।'
              : 'Please enter English title or content first to translate to Bengali.',
            'info'
          );
          setIsTranslating(false);
          return;
        }

        const [trTitle, trExcerpt, trContent, trTakeaways] = await Promise.all([
          srcTitle ? translateTextSmart(srcTitle, 'en', 'bn') : Promise.resolve(''),
          srcExcerpt ? translateTextSmart(srcExcerpt, 'en', 'bn') : Promise.resolve(''),
          srcContent ? translateTextSmart(srcContent, 'en', 'bn') : Promise.resolve(''),
          srcTakeaways
            ? translateTextSmart(srcTakeaways, 'en', 'bn')
            : Promise.resolve(''),
        ]);

        if (trTitle) setTitleBnInput(trTitle);
        if (trExcerpt) setExcerptBnInput(trExcerpt);
        if (trContent) setContentBnInput(trContent);
        if (trTakeaways) setTakeawaysBnInput(trTakeaways);

        // Ensure English fields also keep the English source if user typed English into the BN tab
        if (!titleEnInput.trim() && !hasBengaliChars(titleBnInput)) {
          setTitleEnInput(titleBnInput.trim());
        }
        if (!excerptEnInput.trim() && !hasBengaliChars(excerptBnInput)) {
          setExcerptEnInput(excerptBnInput.trim());
        }
        if (!contentEnInput.trim() && !hasBengaliChars(contentBnInput)) {
          setContentEnInput(contentBnInput.trim());
        }

        setEditorLangTab('bn');
        onShowToast?.(
          isBn
            ? '✅ ইংরেজি থেকে বাংলায় সম্পূর্ণ আর্টিকেল স্বয়ংক্রিয়ভাবে অনুবাদ করা হয়েছে!'
            : '✅ Entire article automatically translated from English to Bengali!',
          'success'
        );
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Verify Admin Login with Server
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = passwordInput.trim();
    if (!trimmedKey) return;

    setIsVerifyingLogin(true);
    setLoginError('');

    let verifiedOnServer = false;
    let serverResponded = false;

    const endpoints = ['/api-blogs.php', '/api/blogs'];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', adminKey: trimmedKey }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) continue;

        serverResponded = true;
        const data = await res.json();
        if (res.ok && data && data.authenticated === true) {
          verifiedOnServer = true;
        }
        break;
      } catch {
        // try next endpoint
      }
    }

    setIsVerifyingLogin(false);

    if (verifiedOnServer || (!serverResponded && trimmedKey === 'Tradebd@2026')) {
      setAdminKey(trimmedKey);
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput('');
      setLoginError('');
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, trimmedKey);
      } catch {
        // ignore
      }
      onShowToast?.(
        isBn
          ? '🔓 অ্যাডমিন প্যানেল আনলক হয়েছে! এখন আপনি নতুন আর্টিকেল লিখতে বা সম্পাদনা করতে পারবেন।'
          : '🔓 Admin Panel Unlocked! You can now publish and manage articles.',
        'success'
      );
    } else {
      setLoginError(
        isBn
          ? 'ভুল অ্যাডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।'
          : 'Incorrect Admin Password! Please try again.'
      );
    }
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminKey('');
    setIsEditorOpen(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    onShowToast?.(
      isBn
        ? '🔒 অ্যাডমিন মোড থেকে লগআউট সম্পন্ন হয়েছে।'
        : '🔒 Logged out of Admin Mode.',
      'info'
    );
  };

  // Change Admin Password on Server
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextPass = newPasswordInput.trim();
    if (nextPass.length < 6) {
      onShowToast?.(
        isBn
          ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'New password must be at least 6 characters.',
        'danger'
      );
      return;
    }
    if (nextPass !== confirmPasswordInput.trim()) {
      onShowToast?.(
        isBn
          ? 'দুটি পাসওয়ার্ড মেলেনি! একই পাসওয়ার্ড দুবার লিখুন।'
          : 'Passwords do not match!',
        'danger'
      );
      return;
    }

    setIsUpdatingPass(true);
    let updatedOk = false;

    const endpoints = ['/api-blogs.php', '/api/blogs'];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'change_password',
            adminKey,
            newPassword: nextPass,
          }),
        });
        if (res.ok) {
          updatedOk = true;
          break;
        }
      } catch {
        // ignore
      }
    }

    setIsUpdatingPass(false);

    if (updatedOk) {
      setAdminKey(nextPass);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, nextPass);
      } catch {
        // ignore
      }
      setShowChangePassModal(false);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      onShowToast?.(
        isBn
          ? '✅ আপনার নতুন অ্যাডমিন পাসওয়ার্ড সার্ভারে সফলভাবে সেভ হয়েছে!'
          : '✅ Your new Admin Password has been saved securely on the server!',
        'success'
      );
    } else {
      onShowToast?.(
        isBn
          ? 'পাসওয়ার্ড আপডেট করা যায়নি। আপনার বর্তমান সেশনটি আবার লগইন করে চেষ্টা করুন।'
          : 'Failed to update password. Please re-login and try again.',
        'danger'
      );
    }
  };

  const handleOpenArticle = (slug: string) => {
    setActiveArticleSlug(slug);
    onSelectSlug?.(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveArticleSlug(null);
    onSelectSlug?.(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Editor for New Article (Admin Only)
  const handleStartNewArticle = () => {
    if (!isAdmin) {
      setShowLoginModal(true);
      return;
    }
    setEditingId(null);
    setEditorLangTab(isBn ? 'bn' : 'en');
    setTitleBnInput('');
    setTitleEnInput('');
    setSlugInput('');
    setExcerptBnInput('');
    setExcerptEnInput('');
    setCategoryInput('FOREX');
    setAuthorInput('Tradebd Editorial Team');
    setKeywordsInput(
      'ফরেক্স ট্রেডিং বাংলা, ট্রেডিং শেখার নিয়ম, ক্যান্ডেলস্টিক চার্ট প্যাটার্ন, ডেমো ট্রেডিং, Forex Trading Guide'
    );
    setTakeawaysBnInput(
      'প্রতিটি ট্রেডে অবশ্যই স্টপ লস (Stop Loss) এবং টেক প্রফিট (Take Profit) ব্যবহার করুন।\nমোট একাউন্ট ব্যালেন্সের ১% থেকে ২%-এর বেশি ঝুঁকি নেবেন না।\nরিয়েল মার্কেটে যাওয়ার আগে ভার্চুয়াল পেপার ট্রেডিং সিমুলেটরে অনুশীলন করুন।'
    );
    setTakeawaysEnInput(
      'Always use a Stop Loss (SL) and Take Profit (TP) on every trade.\nNever risk more than 1% to 2% of your total account balance.\nPractice on the virtual paper trading simulator before risking real capital.'
    );
    setContentBnInput('');
    setContentEnInput('');
    setCtaTabInput('SIMULATOR');
    setPreviewMode(false);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Editor for Existing Article (Admin Only)
  const handleStartEditArticle = (article: BlogArticle) => {
    if (!isAdmin) {
      setShowLoginModal(true);
      return;
    }
    setEditingId(article.id);
    setEditorLangTab(isBn ? 'bn' : 'en');
    setTitleBnInput(article.titleBn);
    setTitleEnInput(article.titleEn);
    setSlugInput(article.slug);
    setExcerptBnInput(article.excerptBn);
    setExcerptEnInput(article.excerptEn);
    setCategoryInput(article.category);
    setAuthorInput(article.author);
    setKeywordsInput(article.keywords.join(', '));
    setTakeawaysBnInput(article.keyTakeawaysBn.join('\n'));
    setTakeawaysEnInput(article.keyTakeawaysEn.join('\n'));
    setContentBnInput(article.contentBn);
    setContentEnInput(article.contentEn);
    setCtaTabInput(article.ctaTab || 'SIMULATOR');
    setPreviewMode(false);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load 1-Click Ready SEO Template (populates BOTH Bengali & English versions automatically!)
  const handleLoadSeoTemplate = (
    templateType: 'FOREX' | 'PATTERNS' | 'RISK'
  ) => {
    if (templateType === 'FOREX') {
      setTitleBnInput(
        'নতুনদের জন্য ফরেক্স ও গোল্ড (XAU/USD) ট্রেডিং করার সহজ স্ট্র্যাটেজি ও নিয়মাবলী'
      );
      setTitleEnInput(
        'Simple Forex & Gold (XAU/USD) Trading Strategy and Rules for Beginners'
      );
      setSlugInput('forex-gold-trading-strategy-bangla');
      setCategoryInput('FOREX');
      setExcerptBnInput(
        'ফরেক্স ও গোল্ড মার্কেটে কীভাবে সঠিক টাইমফ্রেম নির্বাচন করবেন, সাপোর্ট ও রেজিস্ট্যান্স দেখে এন্ট্রি নেবেন এবং স্টপ লস সেট করবেন তার সম্পূর্ণ বাংলা গাইড।'
      );
      setExcerptEnInput(
        'Complete guide on how to choose the right timeframe, enter at Support and Resistance zones, and set Stop Loss in Forex and Gold trading.'
      );
      setKeywordsInput(
        'ফরেক্স ট্রেডিং বাংলা, গোল্ড ট্রেডিং স্ট্র্যাটেজি, XAUUSD অ্যানালাইসিস, ট্রেডিং শেখার নিয়ম, Forex Gold Strategy'
      );
      setTakeawaysBnInput(
        'লন্ডন ও নিউ ইয়র্ক সেশনে (দুপুর ২টা থেকে রাত ১১টা BST) ফরেক্স পেয়ারে সবচেয়ে ভালো মুভমেন্ট পাওয়া যায়।\nসবসময় EMA 50 এবং EMA 200 দিয়ে মার্কেটের মূল ট্রেন্ড নিশ্চিত করে ট্রেড নিন।\nপ্রথমে ভার্চুয়াল ডেমো ব্যালেন্স দিয়ে নিজের স্ট্র্যাটেজি কমপক্ষে ৩০ বার টেস্ট করুন।'
      );
      setTakeawaysEnInput(
        'The London and New York sessions (2:00 PM – 11:00 PM BST) offer the cleanest price movement on Forex pairs.\nAlways confirm the main market trend using EMA 50 and EMA 200 before entering.\nTest your strategy at least 30 times using a virtual demo balance first.'
      );
      setContentBnInput(`## ভূমিকা: সঠিক নিয়মে ট্রেডিং কেন জরুরি?
ফরেক্স এবং ক্রিপ্টো মার্কেটে সফল হওয়ার মূল চাবিকাঠি হলো একটি সুশৃঙ্খল ট্রেডিং প্ল্যান মেনে চলা। আবেগের বশে বা অনুমানের ওপর নির্ভর করে ট্রেড নিলে দীর্ঘমেয়াদে টিকে থাকা সম্ভব নয়।

## ধাপ ১: মার্কেটের ট্রেন্ড (Market Trend) চিহ্নিত করা
যেকোনো ট্রেড ওপেন করার আগে চার্টের **1h** অথবা **4h** টাইমফ্রেমে গিয়ে দেখুন মার্কেট কোন দিকে যাচ্ছে:
• **আপট্রেন্ড (Bullish Trend):** দাম যখন ক্রমাগত Higher High এবং Higher Low তৈরি করে এবং EMA 200 লাইনের উপরে থাকে।
• **ডাউনট্রেন্ড (Bearish Trend):** দাম যখন ক্রমাগত নিচে নামতে থাকে এবং EMA 200 লাইনের নিচে অবস্থান করে।

## ধাপ ২: সাপোর্ট ও রেজিস্ট্যান্স লেভেলে ক্যান্ডেল কনফার্মেশন
মার্কেট মাঝপথে থাকা অবস্থায় কখনোই এন্ট্রি নেবেন না। দাম যখন সাপোর্ট জোনে আসবে, তখন **হ্যামার (Hammer)** বা **বুলিশ এনগালফিং** ক্যান্ডেল তৈরি হওয়া পর্যন্ত অপেক্ষা করুন।

💡 **প্রো টিপ:** ক্যান্ডেল ক্লোজ হওয়ার আগে তাড়াহুড়ো করে অর্ডার দেবেন না। ক্যান্ডেল পুরোপুরি ক্লোজ হলে তবেই পরবর্তী ক্যান্ডেলে এন্ট্রি নিন।

## ধাপ ৩: ১:২ রিস্ক-রিওয়ার্ড এবং স্টপ লস নির্ধারণ
আপনার স্টপ লস যদি হয় ১০ পিপস বা ১০ ডলার, তবে টেক প্রফিট কমপক্ষে ২০ পিপস বা ২০ ডলার রাখুন।

⚠️ **সতর্কবার্তা:** হাই-ইমপ্যাক্ট অর্থনৈতিক নিউজ (যেমন CPI বা NFP) প্রকাশের সময় নতুন ট্রেড ওপেন করা থেকে বিরত থাকুন।`);
      setContentEnInput(`## Introduction: Why Disciplined Trading Rules Matter
The key to long-term survival and success in Forex and Crypto markets is following a structured trading plan rather than trading on emotion or guesswork.

## Step 1: Identify the Market Trend
Before opening any trade, inspect the **1h** or **4h** timeframe to determine the dominant market direction:
• **Uptrend (Bullish Trend):** Price forms consecutive Higher Highs and Higher Lows while trading above the EMA 200 line.
• **Downtrend (Bearish Trend):** Price forms Lower Highs and Lower Lows while trading below the EMA 200 line.

## Step 2: Wait for Candlestick Confirmation at Support & Resistance
Never enter a trade in the middle of nowhere. Wait patiently for price to reach a key Support zone and form a **Hammer** or **Bullish Engulfing** candle.

💡 **Pro Tip:** Never rush into an order before the candle closes. Wait for full candle closure before executing your entry.

## Step 3: Set a 1:2 Risk-to-Reward Ratio & Stop Loss
If your Stop Loss risk is 10 pips or $10, set your Take Profit target at a minimum of 20 pips or $20.

⚠️ **Risk Warning:** Avoid opening new leveraged positions right before high-impact economic news releases such as CPI or NFP.`);
    } else if (templateType === 'PATTERNS') {
      setTitleBnInput(
        'প্রাইস অ্যাকশন ও ক্যান্ডেলস্টিক দেখে মার্কেট রিভার্সাল চেনার ৫টি কার্যকরী উপায়'
      );
      setTitleEnInput(
        '5 Effective Ways to Spot Market Reversals Using Price Action & Candlesticks'
      );
      setSlugInput('price-action-market-reversal-guide-bangla');
      setCategoryInput('PATTERNS');
      setExcerptBnInput(
        'কোনো জটিল ইন্ডিকেটর ছাড়াই খালি চোখে ক্যান্ডেলস্টিকের বডি, লম্বা উইক (Wick Rejection) এবং ভলিউম দেখে মার্কেট কখন ঘুরবে তা চেনার প্রফেশনাল গাইড।'
      );
      setExcerptEnInput(
        'Professional guide to spotting market reversals using raw candlestick bodies, long wick rejections, and volume without lagging indicators.'
      );
      setKeywordsInput(
        'প্রাইস অ্যাকশন ট্রেডিং বাংলা, ক্যান্ডেলস্টিক রিভার্সাল, চার্ট অ্যানালাইসিস শেখার নিয়ম, Price Action Bangla'
      );
      setTakeawaysBnInput(
        'সাপোর্ট বা রেজিস্ট্যান্স লেভেলে লম্বা উইক (Long Wick) মানেই সেখানে বড় ক্রেতা বা বিক্রেতাদের অবস্থান রয়েছে।\nভলিউম স্পাইক ছাড়া কোনো ব্রেকআউট বিশ্বাসযোগ্য নয়।\nTradebd লাইভ চার্টে সরাসরি প্যাটার্নগুলো অনুশীলন করুন।'
      );
      setTakeawaysEnInput(
        'Long wicks at Support or Resistance indicate strong institutional buying or selling rejection.\nBreakouts without a volume spike are prone to failure.\nPractice spotting these patterns live on the Tradebd chart.'
      );
      setContentBnInput(`## প্রাইস অ্যাকশন (Price Action) ট্রেডিং কী?
চার্টে অতিরিক্ত ইন্ডিকেটর ব্যবহার না করে শুধুমাত্র দামের গতিবিধি, ক্যান্ডেলস্টিক ফর্মেশন এবং সাপোর্ট-রেজিস্ট্যান্স জোন বিশ্লেষণ করে ট্রেড নেওয়ার পদ্ধতিকে **প্রাইস অ্যাকশন ট্রেডিং** বলা হয়।

## ১. লম্বা উইক বা শ্যাডো রিজেকশন (Wick Rejection)
যখন কোনো শক্তিশালী রেজিস্ট্যান্স লেভেলে গিয়ে ক্যান্ডেলের উপরে লম্বা শ্যাডো তৈরি হয় এবং বডি নিচে ক্লোজ হয়, তখন বুঝতে হবে বিক্রেতারা (Sellers) দাম নিচে নামিয়ে দিয়েছে।

## ২. ব্রেক অফ স্ট্রাকচার (Break of Structure - BOS)
• আপট্রেন্ডে থাকা মার্কেট যখন সর্বশেষ Higher Low ব্রেক করে নিচে ক্লোজ দেয়, তখন ট্রেন্ড পরিবর্তনের প্রথম সংকেত পাওয়া যায়।
• এরপর দাম রিটেস্ট (Retest) করতে উপরে গেলে চমৎকার Sell/Short এন্ট্রি পাওয়া যায়।

💡 **প্রো টিপ:** আমাদের **Live Chart** ওয়ার্কস্পেসে গিয়ে 15m ও 1h টাইমফ্রেমে সাপোর্ট এবং রেজিস্ট্যান্স লাইনের কাছে ক্যান্ডেলের আচরণ লক্ষ্য করুন।`);
      setContentEnInput(`## What is Price Action Trading?
**Price Action Trading** is the discipline of making trading decisions based on raw price movement, candlestick formations, and supply/demand zones without relying on cluttered indicators.

## 1. Long Wick Rejection
When price tests a major Resistance zone and leaves a long upper wick while closing near the bottom of the candle, it reveals aggressive seller rejection.

## 2. Break of Structure (BOS)
• When an uptrend breaks and closes below its most recent Higher Low, it signals a potential trend shift.
• Waiting for price to pull back and retest the broken level provides a high-probability Short entry.

💡 **Pro Tip:** Open our **Live Chart** workspace on the 15m and 1h timeframes to observe how candles react around Support and Resistance lines.`);
    } else {
      setTitleBnInput(
        'ছোট একাউন্ট ($50–$500) বড় করার নিরাপদ মানি ম্যানেজমেন্ট ও কম্পাউন্ডিং প্ল্যান'
      );
      setTitleEnInput(
        'Safe Money Management & Compounding Plan to Grow a Small Account ($50–$500)'
      );
      setSlugInput('small-account-money-management-plan-bangla');
      setCategoryInput('RISK');
      setExcerptBnInput(
        'মাত্র ৫০ বা ১০০ ডলারের ছোট ট্রেডিং একাউন্ট জিরো হওয়া থেকে বাঁচিয়ে কীভাবে সঠিক লট সাইজ ও ১%-২% রিস্ক নিয়ে ধাপে ধাপে গ্রো করবেন তার গাইড।'
      );
      setExcerptEnInput(
        'Learn how to protect a $50 or $100 small trading account from liquidation and grow it steadily using 1%–2% risk management and lot sizing.'
      );
      setKeywordsInput(
        'মানি ম্যানেজমেন্ট ট্রেডিং, ছোট একাউন্ট ট্রেডিং নিয়ম, লট সাইজ হিসাব, Risk Calculator Bangla'
      );
      setTakeawaysBnInput(
        'ছোট একাউন্টে অতিরিক্ত লিভারেজ (৫০x বা ১০০x) নেওয়া একাউন্ট জিরো হওয়ার প্রধান কারণ।\nপ্রতিদিন নির্দিষ্ট ১-২টি হাই-কোয়ালিটি সেটআপের বেশি ট্রেড নেবেন না।\nট্রেড নেওয়ার আগে Tradebd Risk Calculator দিয়ে সঠিক লট সাইজ বের করুন।'
      );
      setTakeawaysEnInput(
        'Excessive leverage (50x or 100x) is the #1 killer of small trading accounts.\nLimit yourself to 1 or 2 high-quality setups per day.\nUse the Tradebd Risk Calculator before every trade to size your position accurately.'
      );
      setContentBnInput(`## ছোট ব্যালেন্সে ট্রেডাররা কেন ব্যর্থ হন?
যাদের ব্যালেন্স $50 বা $100, তারা অনেকেই একদিনে একাউন্ট দ্বিগুণ করার চেষ্টা করেন। কিন্তু ট্রেডিং হলো ধারাবাহিকতার খেলা। সপ্তাহে মাত্র ৩% থেকে ৫% গ্রোথ ধরে রাখতে পারলেও কম্পাউন্ডিংয়ের মাধ্যমে এক বছরে বিশাল ফলাফল পাওয়া সম্ভব।

## নিরাপদ রিস্ক চার্ট ($100 একাউন্টের উদাহরণ)
• **মোট ব্যালেন্স:** $100
• **প্রতি ট্রেডে সর্বোচ্চ ঝুঁকি (২%):** $2.00
• **প্রতি ট্রেডে টার্গেট প্রফিট (১:২ রেশিও):** $4.00
• **দৈনিক সর্বোচ্চ লস লিমিট:** পরপর ২টি ট্রেডে লস হলে ($4 লস) ওই দিন ট্রেডিং বন্ধ রাখুন।

⚠️ **সতর্কবার্তা:** কখনোই একটি লস ট্রেড কভার করার জন্য পরের ট্রেডে দ্বিগুণ মার্জিন বা লট সাইজ ব্যবহার করবেন না।`);
      setContentEnInput(`## Why Do Traders Fail with Small Balances?
Traders starting with $50 or $100 often try to double their balance overnight. However, trading is a game of consistency. Compounding just 3% to 5% per week yields remarkable growth over a year while keeping drawdown low.

## Safe Risk Blueprint (Example for a $100 Account)
• **Total Account Balance:** $100
• **Maximum Risk per Trade (2%):** $2.00
• **Target Profit per Trade (1:2 R:R):** $4.00
• **Daily Loss Limit:** Stop trading for the day if you hit 2 consecutive losses ($4.00 total loss).

⚠️ **Risk Warning:** Never double your lot size after a losing trade to recover losses quickly.`);
    }
  };

  // Insert formatting snippet into active language content textarea
  const insertSnippet = (snippetBn: string, snippetEn: string) => {
    if (editorLangTab === 'bn') {
      setContentBnInput(
        (prev) => `${prev}${prev.endsWith('\n') || !prev ? '' : '\n\n'}${snippetBn}`
      );
    } else {
      setContentEnInput(
        (prev) => `${prev}${prev.endsWith('\n') || !prev ? '' : '\n\n'}${snippetEn}`
      );
    }
  };

  // Publish / Save Article with Automatic Bidirectional Translation (BN <-> EN)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !adminKey) {
      setShowLoginModal(true);
      return;
    }

    let finalTitleBn = titleBnInput.trim();
    let finalTitleEn = titleEnInput.trim();
    let finalExcerptBn = excerptBnInput.trim();
    let finalExcerptEn = excerptEnInput.trim();
    let finalContentBn = contentBnInput.trim();
    let finalContentEn = contentEnInput.trim();
    let finalTakeawaysBnStr = takeawaysBnInput.trim();
    let finalTakeawaysEnStr = takeawaysEnInput.trim();

    if ((!finalTitleBn && !finalTitleEn) || (!finalContentBn && !finalContentEn)) {
      onShowToast?.(
        isBn
          ? 'অনুগ্রহ করে বাংলা অথবা ইংরেজি যেকোনো একটি ভাষায় শিরোনাম এবং মূল আর্টিকেল লিখুন।'
          : 'Please enter a title and article content in either Bengali or English.',
        'danger'
      );
      return;
    }

    setIsSavingServer(true);

    // Detect if user typed English into the Bengali fields by mistake
    if (
      finalTitleBn &&
      !finalTitleEn &&
      !hasBengaliChars(finalTitleBn) &&
      !hasBengaliChars(finalContentBn)
    ) {
      finalTitleEn = finalTitleBn;
      finalExcerptEn = finalExcerptBn;
      finalContentEn = finalContentBn;
      finalTakeawaysEnStr = finalTakeawaysBnStr;
      finalTitleBn = '';
      finalExcerptBn = '';
      finalContentBn = '';
    }

    // Detect if user typed Bengali into the English fields
    if (
      finalTitleEn &&
      !finalTitleBn &&
      hasBengaliChars(finalTitleEn) &&
      hasBengaliChars(finalContentEn)
    ) {
      finalTitleBn = finalTitleEn;
      finalExcerptBn = finalExcerptEn;
      finalContentBn = finalContentEn;
      finalTakeawaysBnStr = finalTakeawaysEnStr;
      finalTitleEn = '';
      finalExcerptEn = '';
      finalContentEn = '';
    }

    // Auto-generate missing excerpt in source language first
    if (finalContentBn && !finalExcerptBn) {
      finalExcerptBn =
        finalContentBn
          .replace(/##\s+/g, '')
          .replace(/[•💡⚠️*]/g, '')
          .slice(0, 155)
          .trim() + '...';
    }
    if (finalContentEn && !finalExcerptEn) {
      finalExcerptEn =
        finalContentEn
          .replace(/##\s+/g, '')
          .replace(/[•💡⚠️*]/g, '')
          .slice(0, 155)
          .trim() + '...';
    }

    // CASE 1: Written in Bengali -> Auto-translate missing English fields
    if (finalTitleBn && finalContentBn && (!finalTitleEn || !finalContentEn)) {
      const [trTitle, trExcerpt, trContent, trTakeaways] = await Promise.all([
        finalTitleEn
          ? Promise.resolve(finalTitleEn)
          : translateTextSmart(finalTitleBn, 'bn', 'en'),
        finalExcerptEn
          ? Promise.resolve(finalExcerptEn)
          : translateTextSmart(finalExcerptBn, 'bn', 'en'),
        finalContentEn
          ? Promise.resolve(finalContentEn)
          : translateTextSmart(finalContentBn, 'bn', 'en'),
        finalTakeawaysEnStr
          ? Promise.resolve(finalTakeawaysEnStr)
          : translateTextSmart(finalTakeawaysBnStr, 'bn', 'en'),
      ]);
      finalTitleEn = trTitle || finalTitleBn;
      finalExcerptEn = trExcerpt || finalExcerptBn;
      finalContentEn = trContent || finalContentBn;
      finalTakeawaysEnStr = trTakeaways || finalTakeawaysBnStr;
    }

    // CASE 2: Written in English -> Auto-translate missing Bengali fields
    if (finalTitleEn && finalContentEn && (!finalTitleBn || !finalContentBn)) {
      const [trTitle, trExcerpt, trContent, trTakeaways] = await Promise.all([
        finalTitleBn
          ? Promise.resolve(finalTitleBn)
          : translateTextSmart(finalTitleEn, 'en', 'bn'),
        finalExcerptBn
          ? Promise.resolve(finalExcerptBn)
          : translateTextSmart(finalExcerptEn, 'en', 'bn'),
        finalContentBn
          ? Promise.resolve(finalContentBn)
          : translateTextSmart(finalContentEn, 'en', 'bn'),
        finalTakeawaysBnStr
          ? Promise.resolve(finalTakeawaysBnStr)
          : translateTextSmart(finalTakeawaysEnStr, 'en', 'bn'),
      ]);
      finalTitleBn = trTitle || finalTitleEn;
      finalExcerptBn = trExcerpt || finalExcerptEn;
      finalContentBn = trContent || finalContentEn;
      finalTakeawaysBnStr = trTakeaways || finalTakeawaysEnStr;
    }

    const finalSlug = createSlug(
      slugInput.trim() || finalTitleEn || finalTitleBn
    );

    const keywordsArr = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const takeawaysBnArr = finalTakeawaysBnStr
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const takeawaysEnArr = finalTakeawaysEnStr
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const wordCount = (finalContentBn || finalContentEn)
      .split(/\s+/)
      .filter(Boolean).length;
    const calcReadTime = Math.max(2, Math.ceil(wordCount / 140));

    const newArticle: BlogArticle = {
      id: editingId || `custom-${Date.now()}`,
      slug: finalSlug,
      titleBn: finalTitleBn,
      titleEn: finalTitleEn,
      excerptBn: finalExcerptBn,
      excerptEn: finalExcerptEn,
      contentBn: finalContentBn,
      contentEn: finalContentEn,
      category: categoryInput,
      author: authorInput.trim() || 'Tradebd Editorial Team',
      publishedAt: new Date().toISOString().slice(0, 10),
      readTimeMinutes: calcReadTime,
      keywords:
        keywordsArr.length > 0
          ? keywordsArr
          : ['Tradebd', 'ফরেক্স ট্রেডিং বাংলা', 'Forex Trading Guide'],
      keyTakeawaysBn:
        takeawaysBnArr.length > 0
          ? takeawaysBnArr
          : ['সর্বদা সঠিক রিস্ক ম্যানেজমেন্ট ও স্টপ লস মেনে ট্রেড করুন।'],
      keyTakeawaysEn:
        takeawaysEnArr.length > 0
          ? takeawaysEnArr
          : ['Always practice disciplined risk management and stop-loss placement.'],
      isCustom: true,
      ctaTab: ctaTabInput,
    };

    // Persist to Server with Admin Key verification
    let serverRejectedAuth = false;
    const endpoints = ['/api-blogs.php', '/api/blogs'];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save',
            adminKey,
            article: newArticle,
          }),
        });
        if (res.status === 401 || res.status === 403) {
          serverRejectedAuth = true;
          break;
        }
        if (res.ok) break;
      } catch {
        // fallback handled by localStorage
      }
    }
    setIsSavingServer(false);

    if (serverRejectedAuth) {
      setIsAdmin(false);
      setShowLoginModal(true);
      onShowToast?.(
        isBn
          ? 'অ্যাডমিন পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে আবার অ্যাডমিন লগইন করুন।'
          : 'Admin authentication failed! Please log in again.',
        'danger'
      );
      return;
    }

    // Save locally as well
    const updatedCustom = [
      newArticle,
      ...customArticles.filter((a) => a.id !== newArticle.id),
    ];
    setCustomArticles(updatedCustom);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustom));
    } catch {
      // ignore
    }

    setIsEditorOpen(false);
    setEditingId(null);
    handleOpenArticle(newArticle.slug);

    onShowToast?.(
      isBn
        ? '🎉 আর্টিকেলটি বাংলা ও ইংরেজি উভয় ভাষায় স্বয়ংক্রিয়ভাবে অনুবাদ হয়ে প্রকাশিত হয়েছে!'
        : '🎉 Article automatically translated into both Bengali & English and published!',
      'success'
    );
  };

  // Delete Custom Article (Admin Only)
  const handleDeleteArticle = async (id: string) => {
    if (!isAdmin || !adminKey) {
      setShowLoginModal(true);
      return;
    }

    const endpoints = ['/api-blogs.php', '/api/blogs'];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', adminKey, id }),
        });
        if (res.ok) break;
      } catch {
        // ignore
      }
    }

    const updated = customArticles.filter((a) => a.id !== id);
    setCustomArticles(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setDeleteConfirmId(null);
    if (activeArticle?.id === id) {
      handleBackToList();
    }
    onShowToast?.(
      isBn ? 'আর্টিকেলটি মুছে ফেলা হয়েছে।' : 'Article deleted.',
      'info'
    );
  };

  // Copy Direct Shareable Article URL
  const handleCopyArticleLink = (slug?: string) => {
    const targetUrl = slug
      ? `https://tradebd.online/blog/${encodeURIComponent(slug)}`
      : 'https://tradebd.online/blog';
    try {
      navigator.clipboard.writeText(targetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      onShowToast?.(
        isBn
          ? `🔗 লিংক কপি হয়েছে: ${targetUrl} — এখন ফেসবুক বা টেলিগ্রামে শেয়ার করুন!`
          : `🔗 Copied link: ${targetUrl}`,
        'success'
      );
    } catch {
      // ignore
    }
  };

  // Render formatted markdown-like paragraphs cleanly
  const renderFormattedContent = (rawText: string) => {
    const blocks = rawText.split(/\n\n+/);
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Subheading ##
      if (trimmed.startsWith('## ')) {
        const headingText = trimmed.replace(/^##\s+/, '');
        return (
          <h2
            key={idx}
            className="text-lg sm:text-xl font-extrabold text-white mt-7 mb-3 pb-2 border-b border-slate-800/90 flex items-center gap-2"
          >
            <span className="w-1.5 h-5 bg-emerald-400 rounded-full shrink-0" />
            <span>{headingText}</span>
          </h2>
        );
      }

      // Pro Tip Box 💡
      if (trimmed.startsWith('💡')) {
        return (
          <div
            key={idx}
            className="my-4 p-4 rounded-xl bg-emerald-950/35 border border-emerald-500/35 text-emerald-100 text-sm leading-relaxed flex items-start gap-3"
          >
            <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {formatInlineBold(trimmed.replace(/^💡\s*/, ''))}
            </div>
          </div>
        );
      }

      // Warning Box ⚠️
      if (trimmed.startsWith('⚠️')) {
        return (
          <div
            key={idx}
            className="my-4 p-4 rounded-xl bg-amber-950/35 border border-amber-500/35 text-amber-100 text-sm leading-relaxed flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {formatInlineBold(trimmed.replace(/^⚠️\s*/, ''))}
            </div>
          </div>
        );
      }

      // Bullet list lines
      const lines = trimmed.split('\n');
      const isBulletBlock = lines.every(
        (l) =>
          l.trim().startsWith('•') ||
          l.trim().startsWith('- ') ||
          /^[০-৯0-9]+\./.test(l.trim())
      );

      if (isBulletBlock) {
        return (
          <ul key={idx} className="space-y-2.5 my-3 pl-1">
            {lines.map((line, lIdx) => (
              <li
                key={lIdx}
                className="flex items-start gap-2.5 text-slate-200 text-sm sm:text-[15px] leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 shrink-0" />
                <span>{formatInlineBold(line.replace(/^[•\-]\s*/, ''))}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Mixed paragraph with potential bullet lines
      return (
        <div key={idx} className="space-y-2 my-3">
          {lines.map((line, lIdx) => {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('•') || cleanLine.startsWith('- ')) {
              return (
                <div
                  key={lIdx}
                  className="flex items-start gap-2.5 text-slate-200 text-sm sm:text-[15px] leading-relaxed pl-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 shrink-0" />
                  <span>{formatInlineBold(cleanLine.replace(/^[•\-]\s*/, ''))}</span>
                </div>
              );
            }
            return (
              <p
                key={lIdx}
                className="text-slate-200 text-sm sm:text-[15px] leading-7"
              >
                {formatInlineBold(cleanLine)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper to bold **text**
  const formatInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const getCategoryMeta = (cat: Exclude<BlogCategory, 'ALL'>) => {
    return BLOG_CATEGORIES.find((c) => c.id === cat) || BLOG_CATEGORIES[1];
  };

  // Shared Modals: Admin Login Modal & Change Password Modal
  const renderSecurityModals = () => (
    <>
      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Lock className="w-4 h-4" />
                <span>
                  {isBn
                    ? 'অ্যাডমিন সিকিউরিটি লগইন (Admin Only)'
                    : 'Admin Security Login'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn
                ? 'শুধুমাত্র সাইটের অ্যাডমিন নতুন ব্লগ বা আর্টিকেল প্রকাশ, সম্পাদনা ও ডিলিট করতে পারবেন। আপনার গোপন অ্যাডমিন পাসওয়ার্ড দিন:'
                : 'Only the site administrator can publish, edit, or delete articles. Enter your Admin Password:'}
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {isBn ? 'অ্যাডমিন পাসওয়ার্ড (Admin Password)' : 'Admin Password'}
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-sm text-white font-mono focus:outline-hidden"
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-700/70 text-rose-200 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingLogin}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  {isVerifyingLogin
                    ? isBn
                      ? 'যাচাই হচ্ছে...'
                      : 'Verifying...'
                    : isBn
                    ? 'আনলক করুন (Login)'
                    : 'Unlock Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Change Password Modal */}
      {showChangePassModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>
                  {isBn
                    ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন'
                    : 'Change Admin Password'}
                </span>
              </div>
              <button
                onClick={() => setShowChangePassModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn
                ? 'আপনার পছন্দমতো নতুন গোপন পাসওয়ার্ড সেট করুন (কমপক্ষে ৬ অক্ষর)। এটি সরাসরি সার্ভারে এনক্রিপ্টেড অবস্থায় সেভ থাকবে।'
                : 'Set a new secret Admin Password (min 6 characters). It will be stored encrypted on the server.'}
            </p>

            <form onSubmit={handleChangeAdminPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  {isBn ? 'নতুন পাসওয়ার্ড দিন' : 'New Password'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white font-mono focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  {isBn ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="পুনরায় একই পাসওয়ার্ড দিন"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white font-mono focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPass}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  {isUpdatingPass
                    ? isBn
                      ? 'সেভ হচ্ছে...'
                      : 'Saving...'
                    : isBn
                    ? 'পাসওয়ার্ড আপডেট করুন'
                    : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // ============================================================================
  // VIEW 1: ARTICLE WRITER & SEO PUBLISHING STUDIO (ADMIN ONLY)
  // ============================================================================
  if (isEditorOpen && isAdmin) {
    return (
      <div className="space-y-6 pb-10">
        {renderSecurityModals()}

        {/* Top Studio Bar */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isBn
                  ? 'অটো দ্বিভাষিক (বাংলা ↔ ইংরেজি) আর্টিকেল পাবলিশিং স্টুডিও'
                  : 'Auto Bilingual (BN ↔ EN) Article Publishing Studio'}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white">
              {editingId
                ? isBn
                  ? 'আর্টিকেল সম্পাদনা করুন (Edit Article)'
                  : 'Edit Educational Article'
                : isBn
                ? 'নতুন শিক্ষণীয় ব্লগ বা আর্টিকেল লিখুন'
                : 'Write New Educational Blog Article'}
            </h1>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'আপনি শুধু বাংলায় লিখলে তা স্বয়ংক্রিয়ভাবে ইংরেজিতে অনুবাদ হয়ে যাবে, আর ইংরেজিতে লিখলে স্বয়ংক্রিয়ভাবে বাংলায় অনুবাদ হয়ে যাবে!'
                : 'Write in Bengali and it automatically translates to English—or write in English and it automatically translates to Bengali!'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>
                {previewMode
                  ? isBn
                    ? 'এডিটরে ফিরে যান'
                    : 'Back to Editor'
                  : isBn
                  ? 'লাইভ প্রিভিউ দেখুন'
                  : 'Live Preview'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isBn ? 'বন্ধ করুন' : 'Close'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Ready SEO Templates Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {isBn
                ? '১-ক্লিকে রেডিমেড দ্বিভাষিক (বাংলা + ইংরেজি) এসইও আর্টিকেল টেমপ্লেট লোড করুন:'
                : '1-Click Ready Bilingual (BN + EN) SEO Article Templates:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleLoadSeoTemplate('FOREX')}
              className="px-3 py-1.5 rounded-lg bg-[#0b0f19] hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold text-cyan-200 transition-colors cursor-pointer"
            >
              📘 {isBn ? 'ফরেক্স ও গোল্ড ট্রেডিং গাইড টেমপ্লেট' : 'Forex & Gold Strategy Template'}
            </button>
            <button
              type="button"
              onClick={() => handleLoadSeoTemplate('PATTERNS')}
              className="px-3 py-1.5 rounded-lg bg-[#0b0f19] hover:bg-slate-800 border border-emerald-500/30 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer"
            >
              📊 {isBn ? 'প্রাইস অ্যাকশন ও ক্যান্ডেলস্টিক টেমপ্লেট' : 'Price Action & Candlestick Template'}
            </button>
            <button
              type="button"
              onClick={() => handleLoadSeoTemplate('RISK')}
              className="px-3 py-1.5 rounded-lg bg-[#0b0f19] hover:bg-slate-800 border border-rose-500/30 text-xs font-semibold text-rose-200 transition-colors cursor-pointer"
            >
              🛡️ {isBn ? 'ছোট একাউন্ট মানি ম্যানেজমেন্ট টেমপ্লেট' : 'Small Account Risk Management Template'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Form or Live Preview */}
          <div className="lg:col-span-8">
            {previewMode ? (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                    {isBn ? 'লাইভ আর্টিকেল প্রিভিউ' : 'Live Article Preview'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditorLangTab('bn')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        editorLangTab === 'bn'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      🇧🇩 বাংলা প্রিভিউ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorLangTab('en')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        editorLangTab === 'en'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      🇺🇸 English Preview
                    </button>
                  </div>
                </div>

                <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
                  {(editorLangTab === 'bn' ? titleBnInput : titleEnInput) ||
                    (isBn
                      ? 'আর্টিকেলের শিরোনাম এখানে দেখাবে...'
                      : 'Article Title Preview...')}
                </h2>
                <p className="text-sm text-slate-400 border-l-2 border-cyan-500 pl-3">
                  {(editorLangTab === 'bn' ? excerptBnInput : excerptEnInput) ||
                    (isBn
                      ? 'মেটা সারসংক্ষেপ এখানে দেখাবে...'
                      : 'Meta summary preview...')}
                </p>
                <div className="pt-4 border-t border-slate-800">
                  {renderFormattedContent(
                    (editorLangTab === 'bn' ? contentBnInput : contentEnInput) ||
                      (isBn
                        ? 'আপনার আর্টিকেলের মূল লেখা এখানে সুন্দরভাবে সাজানো দেখাবে...'
                        : 'Article content will render here...')
                  )}
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSaveArticle}
                className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5"
              >
                {/* Bilingual Language Switcher & 1-Click Auto-Translator Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditorLangTab('bn')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                        editorLangTab === 'bn'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>🇧🇩 বাংলায় লিখুন / দেখুন</span>
                      {titleBnInput.trim() && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorLangTab('en')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                        editorLangTab === 'en'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>🇺🇸 Write / View in English</span>
                      {titleEnInput.trim() && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* 1-Click Instant Translate Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {editorLangTab === 'bn' ? (
                      <button
                        type="button"
                        disabled={isTranslating}
                        onClick={() => handleManualAutoTranslate('BN_TO_EN')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            isTranslating ? 'animate-spin' : ''
                          }`}
                        />
                        <span>
                          {isTranslating
                            ? 'অনুবাদ হচ্ছে...'
                            : 'বাংলা → ইংরেজিতে অটো অনুবাদ করুন'}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isTranslating}
                        onClick={() => handleManualAutoTranslate('EN_TO_BN')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            isTranslating ? 'animate-spin' : ''
                          }`}
                        />
                        <span>
                          {isTranslating
                            ? 'Translating...'
                            : 'ইংরেজি → বাংলায় অটো অনুবাদ করুন'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Title Input (Active Language) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    {editorLangTab === 'bn'
                      ? '১. আর্টিকেলের শিরোনাম (বাংলায় অথবা ইংরেজিতে লিখুন) *'
                      : '1. Article Title (English Version) *'}
                  </label>
                  <input
                    type="text"
                    value={editorLangTab === 'bn' ? titleBnInput : titleEnInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editorLangTab === 'bn') {
                        setTitleBnInput(val);
                      } else {
                        setTitleEnInput(val);
                      }
                      if (!editingId) {
                        setSlugInput(createSlug(val));
                      }
                    }}
                    placeholder={
                      editorLangTab === 'bn'
                        ? 'যেমন: ফরেক্স ট্রেডিংয়ে সাপোর্ট ও রেজিস্ট্যান্স দেখে এন্ট্রি নেওয়ার সহজ নিয়ম'
                        : 'e.g. How to Trade Support and Resistance in Forex & Crypto'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-sm text-white font-semibold focus:outline-hidden"
                  />
                </div>

                {/* Category, Author & URL Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      {isBn ? 'ক্যাটাগরি (Category)' : 'Category'}
                    </label>
                    <select
                      value={categoryInput}
                      onChange={(e) =>
                        setCategoryInput(
                          e.target.value as Exclude<BlogCategory, 'ALL'>
                        )
                      }
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                    >
                      {BLOG_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                        <option key={c.id} value={c.id}>
                          {isBn ? c.labelBn : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      {isBn ? 'লেখকের নাম (Author)' : 'Author Name'}
                    </label>
                    <input
                      type="text"
                      value={authorInput}
                      onChange={(e) => setAuthorInput(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      {isBn ? 'লিঙ্ক স্লাগ (URL Slug)' : 'URL Slug'}
                    </label>
                    <input
                      type="text"
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value)}
                      placeholder="forex-trading-guide"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* SEO Meta Description / Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-200">
                      {editorLangTab === 'bn'
                        ? '২. এসইও সারসংক্ষেপ / মেটা ডেসক্রিপশন (বাংলা)'
                        : '2. SEO Summary / Meta Description (English)'}
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {(editorLangTab === 'bn' ? excerptBnInput : excerptEnInput).length}{' '}
                      / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editorLangTab === 'bn' ? excerptBnInput : excerptEnInput}
                    onChange={(e) => {
                      if (editorLangTab === 'bn') {
                        setExcerptBnInput(e.target.value);
                      } else {
                        setExcerptEnInput(e.target.value);
                      }
                    }}
                    placeholder={
                      editorLangTab === 'bn'
                        ? 'গুগলে সার্চ করলে শিরোনামের নিচে যে ২ লাইনের সংক্ষিপ্ত বিবরণ দেখাবে তা এখানে লিখুন (খালি রাখলে মূল লেখা থেকে অটো তৈরি হবে)...'
                        : 'Write a 1–2 sentence summary for Google search results (or leave blank to auto-generate)...'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden"
                  />
                </div>

                {/* Main Article Content with Formatting Toolbar */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-200">
                      {editorLangTab === 'bn'
                        ? '৩. মূল আর্টিকেল বা ব্লগ বডি (বাংলা অথবা ইংরেজি যেকোনো ভাষায় লিখুন) *'
                        : '3. Main Article Content Body (English Version) *'}
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '## এখানে নতুন সাব-হেডিং লিখুন\nআপনার অনুচ্ছেদ এখানে লিখুন...',
                            '## Write New Subheading Here\nWrite your paragraph here...'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-cyan-300 cursor-pointer"
                      >
                        + সাব-হেডিং (##)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '• প্রথম গুরুত্বপূর্ণ পয়েন্ট\n• দ্বিতীয় গুরুত্বপূর্ণ পয়েন্ট\n• তৃতীয় গুরুত্বপূর্ণ পয়েন্ট',
                            '• First key point\n• Second key point\n• Third key point'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 cursor-pointer"
                      >
                        + বুলেট লিস্ট (•)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '💡 **প্রো টিপ:** এখানে আপনার বিশেষ কৌশল বা গুরুত্বপূর্ণ টিপস লিখুন।',
                            '💡 **Pro Tip:** Write your actionable trading tip here.'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 cursor-pointer"
                      >
                        + 💡 প্রো টিপ বক্স
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '⚠️ **সতর্কবার্তা:** এখানে ঝুঁকি সতর্কবার্তা বা করণীয় বিষয় উল্লেখ করুন।',
                            '⚠️ **Risk Warning:** Mention important risk precautions here.'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-[11px] font-bold text-amber-300 cursor-pointer"
                      >
                        + ⚠️ সতর্কবার্তা বক্স
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={14}
                    value={editorLangTab === 'bn' ? contentBnInput : contentEnInput}
                    onChange={(e) => {
                      if (editorLangTab === 'bn') {
                        setContentBnInput(e.target.value);
                      } else {
                        setContentEnInput(e.target.value);
                      }
                    }}
                    placeholder={
                      editorLangTab === 'bn'
                        ? 'আপনার আর্টিকেল এখানে বাংলায় (অথবা ইংরেজিতে) লিখুন...\nপাবলিশ বাটনে ক্লিক করলেই অন্য ভাষাটিতে স্বয়ংক্রিয়ভাবে অনুবাদ হয়ে যাবে!'
                        : 'Write your article in English here...\nWhen you click Publish, it will automatically translate into Bengali as well!'
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl text-sm text-slate-100 leading-relaxed focus:outline-hidden font-sans"
                  />
                </div>

                {/* Key Takeaways & SEO Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      {editorLangTab === 'bn'
                        ? '৪. মূল শিক্ষণীয় পয়েন্ট (Key Takeaways - প্রতি লাইনে ১টি)'
                        : '4. Key Takeaways (English - 1 per line)'}
                    </label>
                    <textarea
                      rows={4}
                      value={
                        editorLangTab === 'bn'
                          ? takeawaysBnInput
                          : takeawaysEnInput
                      }
                      onChange={(e) => {
                        if (editorLangTab === 'bn') {
                          setTakeawaysBnInput(e.target.value);
                        } else {
                          setTakeawaysEnInput(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-200">
                        {isBn
                          ? '৫. গুগল এসইও কিওয়ার্ডসমূহ (কমা দিয়ে লিখুন)'
                          : '5. Google SEO Focus Keywords (comma separated)'}
                      </label>
                      <input
                        type="text"
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        placeholder="ফরেক্স ট্রেডিং, ক্যান্ডেলস্টিক চার্ট, ডেমো একাউন্ট"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-200">
                        {isBn
                          ? '৬. আর্টিকেলের শেষে প্র্যাকটিস বাটন কোন পেজে নিয়ে যাবে?'
                          : '6. Call-to-Action Target Tool'}
                      </label>
                      <select
                        value={ctaTabInput}
                        onChange={(e) => setCtaTabInput(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-hidden"
                      >
                        <option value="SIMULATOR">
                          {isBn
                            ? 'ভার্চুয়াল পেপার ট্রেডিং সিমুলেটর (Paper Trading Simulator)'
                            : 'Paper Trading Simulator'}
                        </option>
                        <option value="CHART">
                          {isBn
                            ? 'লাইভ ক্যান্ডেলস্টিক চার্ট (Live Candlestick Chart)'
                            : 'Live Candlestick Chart'}
                        </option>
                        <option value="CALCULATOR">
                          {isBn
                            ? 'রিস্ক ও লট সাইজ ক্যালকুলেটর (Risk Calculator)'
                            : 'Risk & Lot Size Calculator'}
                        </option>
                        <option value="CALENDAR">
                          {isBn
                            ? 'অর্থনৈতিক ক্যালেন্ডার ও সেশন (Economic Calendar)'
                            : 'Economic Calendar & Sessions'}
                        </option>
                        <option value="PATTERNS">
                          {isBn
                            ? 'ক্যান্ডেলস্টিক প্যাটার্ন গ্যালারি (Pattern Gallery)'
                            : 'Candlestick Pattern Gallery'}
                        </option>
                        <option value="ACADEMY">
                          {isBn
                            ? 'ট্রেডিং একাডেমি কোর্স (Trading Academy)'
                            : 'Trading Academy Courses'}
                        </option>
                        <option value="MENTOR">
                          {isBn
                            ? 'ইন্টারঅ্যাক্টিভ চার্ট কুইজ ও মেন্টর (Chart Quiz & Mentor)'
                            : 'Interactive Chart Quiz & Mentor'}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Bar */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    {isBn ? 'বাতিল করুন' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingServer || isTranslating}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSavingServer
                        ? isBn
                          ? 'অটো-অনুবাদ ও প্রকাশিত হচ্ছে...'
                          : 'Auto-Translating & Publishing...'
                        : editingId
                        ? isBn
                          ? 'আর্টিকেল আপডেট ও সেভ করুন (বাংলা + EN)'
                          : 'Update & Save Article (BN + EN)'
                        : isBn
                        ? 'অটো অনুবাদসহ প্রকাশ করুন (Publish BN + EN)'
                        : 'Auto-Translate & Publish Now'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right 4 Cols: Real-time Google SEO Score & Bilingual Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                    {isBn ? 'লাইভ গুগল এসইও স্কোর' : 'Live Google SEO Score'}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-extrabold ${
                    seoEvaluation.score >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : seoEvaluation.score >= 60
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {seoEvaluation.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    seoEvaluation.score >= 80
                      ? 'bg-emerald-500'
                      : seoEvaluation.score >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${seoEvaluation.score}%` }}
                />
              </div>

              <ul className="space-y-2.5 text-xs">
                {seoEvaluation.checks.map((chk, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        chk.passed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {chk.passed ? '✓' : '•'}
                    </span>
                    <span
                      className={
                        chk.passed
                          ? 'text-slate-200 font-medium'
                          : 'text-slate-500'
                      }
                    >
                      {chk.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-slate-200 space-y-1.5 leading-relaxed">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" />
                  <span>
                    {isBn
                      ? 'অটো বাংলা ↔ ইংরেজি অনুবাদ সুবিধা:'
                      : 'Auto Bengali ↔ English Translation:'}
                  </span>
                </div>
                <p>
                  {isBn
                    ? 'আপনি শুধু বাংলায় আর্টিকেল লিখে পাবলিশ করলেই সাইট স্বয়ংক্রিয়ভাবে তার ইংরেজি অনুবাদ তৈরি করে সেভ করবে। আবার ইংরেজিতে আর্টিকেল লিখলে স্বয়ংক্রিয়ভাবে তার বাংলা অনুবাদ তৈরি হয়ে যাবে!'
                    : 'Write in Bengali and it automatically generates the English version—or write in English and it automatically generates the Bengali version!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: SINGLE ARTICLE READER VIEW (/blog/:slug)
  // ============================================================================
  if (activeArticle) {
    const catMeta = getCategoryMeta(activeArticle.category);
    const takeaways = isBn
      ? activeArticle.keyTakeawaysBn
      : activeArticle.keyTakeawaysEn;
    const bodyText = isBn ? activeArticle.contentBn : activeArticle.contentEn;
    const relatedArticles = allArticles
      .filter((a) => a.id !== activeArticle.id)
      .slice(0, 3);

    return (
      <div className="space-y-6 pb-10">
        {renderSecurityModals()}

        {/* Top Navigation & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19] border border-slate-800 rounded-xl px-4 py-3">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {isBn
                ? 'সব ব্লগ ও আর্টিকেলে ফিরে যান'
                : 'Back to All Blog Articles'}
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick 1-Click Language Toggle inside Article Reader (বাংলা <-> English) */}
            <button
              onClick={() => setLanguage(isBn ? 'en' : 'bn')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-xs font-extrabold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>
                {isBn
                  ? '🇺🇸 ইংরেজিতে পড়ুন (Read in English)'
                  : '🇧🇩 বাংলায় পড়ুন (Read in Bengali)'}
              </span>
            </button>

            <button
              onClick={() => handleCopyArticleLink(activeArticle.slug)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedLink
                  ? isBn
                    ? 'লিংক কপি হয়েছে!'
                    : 'Link Copied!'
                  : isBn
                  ? 'শেয়ার লিংক কপি করুন'
                  : 'Copy Article Link'}
              </span>
            </button>

            {/* Admin-only Edit & New Buttons */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleStartEditArticle(activeArticle)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'এডিট করুন' : 'Edit'}</span>
                </button>

                <button
                  onClick={handleStartNewArticle}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBn ? 'নতুন আর্টিকেল লিখুন' : 'Write Article'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Article Container */}
        <article className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-6 shadow-xl">
          {/* Category Badge & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span
              className={`px-2.5 py-1 rounded-md font-bold border ${catMeta.badgeColor}`}
            >
              {isBn ? catMeta.labelBn : catMeta.labelEn}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeArticle.publishedAt}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {activeArticle.readTimeMinutes}{' '}
                {isBn ? 'মিনিট পড়া' : 'min read'}
              </span>
            </span>
            <span className="text-slate-400">✍️ {activeArticle.author}</span>
          </div>

          {/* Article H1 Title */}
          <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
            {isBn ? activeArticle.titleBn : activeArticle.titleEn}
          </h1>

          {/* Excerpt / Lead Paragraph */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed border-l-4 border-emerald-500 pl-4 py-1 bg-slate-900/50 rounded-r-xl">
            {isBn ? activeArticle.excerptBn : activeArticle.excerptEn}
          </p>

          {/* Key Takeaways Box */}
          {takeaways && takeaways.length > 0 && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isBn
                    ? 'এক নজরে মূল শিক্ষণীয় বিষয় (Key Takeaways)'
                    : 'Key Takeaways at a Glance'}
                </span>
              </div>
              <ul className="space-y-2">
                {takeaways.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formatted Main Article Body */}
          <div className="pt-2 space-y-2">
            {renderFormattedContent(bodyText)}
          </div>

          {/* FAQ Section (if present) */}
          {activeArticle.faqs && activeArticle.faqs.length > 0 && (
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>
                  {isBn
                    ? 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)'
                    : 'Frequently Asked Questions (FAQ)'}
                </span>
              </h3>
              <div className="space-y-3">
                {activeArticle.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                  >
                    <div className="text-sm font-bold text-cyan-300">
                      {isBn
                        ? `প্রশ্ন: ${faq.question}`
                        : `Q: ${faq.questionEn || faq.question}`}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {isBn
                        ? `উত্তর: ${faq.answer}`
                        : `A: ${faq.answerEn || faq.answer}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Practice CTA Banner inside Article */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-white">
                {isBn
                  ? 'এখনই যা শিখলেন তা লাইভ মার্কেটে ঝুঁকি ছাড়া অনুশীলন করুন!'
                  : 'Practice What You Just Learned Risk-Free!'}
              </div>
              <p className="text-xs text-slate-300">
                {isBn
                  ? 'কোনো ডিপোজিট বা সাইন-আপ ছাড়াই কাস্টম ডেমো ফান্ড নিয়ে লাইভ চার্টে ট্রেড প্র্যাকটিস করুন।'
                  : 'Open virtual positions on live candlestick charts with customizable demo funds.'}
              </p>
            </div>
            <button
              onClick={() =>
                onNavigateTab?.(activeArticle.ctaTab || 'SIMULATOR')
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <TrendingUp className="w-4 h-4" />
              <span>
                {isBn ? 'লাইভ প্র্যাকটিস শুরু করুন →' : 'Start Live Practice →'}
              </span>
            </button>
          </div>

          {/* SEO Keywords & Social Share Footer */}
          <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {activeArticle.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
                >
                  #{kw}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleCopyArticleLink(activeArticle.slug)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>
                {isBn
                  ? 'শেয়ার করার জন্য লিংক কপি করুন'
                  : 'Copy Shareable Link'}
              </span>
            </button>
          </div>
        </article>

        {/* Related Articles Section */}
        <div className="max-w-4xl mx-auto space-y-3 pt-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
            {isBn ? 'আরও পড়ুন (Related Trading Guides)' : 'Related Trading Guides'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => handleOpenArticle(rel.slug)}
                className="bg-[#0b0f19] hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-cyan-400">
                    {rel.readTimeMinutes} {isBn ? 'মিনিট পড়া' : 'min read'}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 line-clamp-2 leading-snug">
                    {isBn ? rel.titleBn : rel.titleEn}
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <span>{isBn ? 'বিস্তারিত পড়ুন' : 'Read Article'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: MAIN BLOG & EDUCATIONAL ARTICLE HUB (/blog)
  // ============================================================================
  return (
    <div className="space-y-6 pb-10">
      {renderSecurityModals()}

      {/* Admin Control Bar (Visible ONLY when Admin is authenticated) */}
      {isAdmin && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isBn
                ? 'অ্যাডমিন প্যানেল সক্রিয় (বাংলা ↔ ইংরেজি অটো অনুবাদসহ আর্টিকেল পোস্ট, এডিট ও ডিলিট)'
                : 'Admin Mode Active (Publish, edit, or delete with Auto BN ↔ EN translation)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartNewArticle}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>
                {isBn
                  ? '✍️ নতুন ব্লগ / আর্টিকেল লিখুন'
                  : '✍️ Write New Article'}
              </span>
            </button>

            <button
              onClick={() => setShowChangePassModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-700 text-xs font-bold text-rose-300 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0b1324] via-[#0b0f19] to-[#09191f] border border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {isBn
                ? 'Tradebd ফিন্যান্সিয়াল এডুকেশন ও মার্কেট গাইড'
                : 'Tradebd Financial Education & Market Guides'}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isBn
              ? 'শিক্ষণীয় ট্রেডিং ব্লগ, গাইড ও মার্কেট অ্যানালাইসিস আর্টিকেল'
              : 'Educational Trading Blog, Strategy Guides & Market Analysis'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isBn
              ? 'ফরেক্স, ক্রিপ্টোকারেন্সি, ক্যান্ডেলস্টিক চার্ট প্যাটার্ন, বাংলাদেশ সময় অনুযায়ী ট্রেডিং সেশন এবং মানি ম্যানেজমেন্টের বিস্তারিত বাংলা ও ইংরেজি আর্টিকেল।'
              : 'In-depth tutorials on Forex, Crypto, Candlestick Patterns, Global Sessions, and Risk Management in both English and Bengali.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Quick Language Toggle on Blog Hub */}
          <button
            onClick={() => setLanguage(isBn ? 'en' : 'bn')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-xs font-extrabold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>
              {isBn ? '🇺🇸 Read in English' : '🇧🇩 বাংলায় পড়ুন'}
            </span>
          </button>

          {!isAdmin && (
            <button
              onClick={() => setShowLoginModal(true)}
              title={isBn ? 'শুধুমাত্র সাইট অ্যাডমিনের জন্য' : 'Site Admin Login'}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isBn ? 'অ্যাডমিন লগইন' : 'Admin'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0b0f19] border border-slate-800 rounded-xl p-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {BLOG_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {isBn ? cat.labelBn : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBn
                ? 'আর্টিকেল বা কিওয়ার্ড খুঁজুন (যেমন: ফরেক্স, হ্যামার, লট)...'
                : 'Search articles or keywords...'
            }
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-xs text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-slate-300">
            {isBn
              ? 'এই বিষয়ে কোনো আর্টিকেল পাওয়া যায়নি।'
              : 'No matching articles found.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const catMeta = getCategoryMeta(article.category);
            return (
              <div
                key={article.id}
                className="bg-[#0b0f19] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-md hover:shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Top Category & Read Time */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold border ${catMeta.badgeColor}`}
                    >
                      {isBn ? catMeta.labelBn : catMeta.labelEn}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <span>{article.publishedAt}</span>
                      <span>•</span>
                      <span>
                        {article.readTimeMinutes} {isBn ? 'মিনিট' : 'min'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    onClick={() => handleOpenArticle(article.slug)}
                    className="text-base font-extrabold text-white group-hover:text-cyan-300 leading-snug cursor-pointer line-clamp-2"
                  >
                    {isBn ? article.titleBn : article.titleEn}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {isBn ? article.excerptBn : article.excerptEn}
                  </p>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {article.keywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800/90 text-[10px] text-slate-400"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenArticle(article.slug)}
                    className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {isBn ? 'সম্পূর্ণ আর্টিকেল পড়ুন' : 'Read Full Article'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyArticleLink(article.slug)}
                      title={isBn ? 'লিংক কপি করুন' : 'Copy Link'}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit & Delete buttons shown ONLY when Admin is logged in */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleStartEditArticle(article)}
                          title={isBn ? 'এডিট করুন' : 'Edit'}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {article.isCustom && (
                          <>
                            {deleteConfirmId === article.id ? (
                              <button
                                onClick={() => handleDeleteArticle(article.id)}
                                className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                              >
                                {isBn ? 'নিশ্চিত মুছুন' : 'Confirm'}
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(article.id)}
                                title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
