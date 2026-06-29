import { useState, useMemo } from 'react';
import { Sun, Moon, TrendingUp, ShieldAlert, PiggyBank } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import FileUpload from './FileUpload';
import CashFlowChart from './CashFlowChart';
import AlertBadge from './AlertBadge';
import WhatIfSlider from './WhatIfSlider';
import { RecommendationSection } from './RecommendationCard';
import logoWhite from '../assets/Basira logo white.png';
import logoBlue from '../assets/Basira logo blue.png';
import logoWhiteEng from '../assets/Basira logo white eng.png';
import logoBlueEng from '../assets/Basira logo blue eng.png';

/* ─── Sample recommendation data ─── */
const RECOMMENDATIONS = [
  {
    icon: TrendingUp,
    titleAr: 'تأجيل المصروفات غير الضرورية',
    titleEn: 'Defer Non-Essential Expenses',
    descriptionAr:
      'يُوصى بتأجيل المصروفات التشغيلية غير الحرجة لمدة ١٥ يومًا لتعزيز مستوى السيولة الحالي.',
    descriptionEn:
      'Consider deferring non-critical operational expenses for 15 days to strengthen the current liquidity position.',
    tags: ['highPriority', 'cashflow'],
    accentKey: 'accent',
  },
  {
    icon: ShieldAlert,
    titleAr: 'مراجعة حدود الائتمان',
    titleEn: 'Review Credit Limits',
    descriptionAr:
      'تحليل البيانات يُظهر إمكانية تحسين شروط الائتمان مع الموردين الرئيسيين لتقليل المخاطر.',
    descriptionEn:
      'Data analysis indicates an opportunity to optimize credit terms with key suppliers to reduce risk exposure.',
    tags: ['medPriority', 'risk'],
    accentKey: 'warning',
  },
  {
    icon: PiggyBank,
    titleAr: 'تحويل الفائض إلى استثمار قصير الأجل',
    titleEn: 'Redirect Surplus to Short-Term Investment',
    descriptionAr:
      'الفائض النقدي الحالي يمكن استثماره في أدوات قصيرة الأجل لتحقيق عائد إضافي بدون مخاطر عالية.',
    descriptionEn:
      'Current cash surplus can be invested in short-term instruments to generate additional yield with minimal risk.',
    tags: ['automated', 'saving'],
    accentKey: 'success',
  },
];

/* ═══════════════════════════════════════════════════════
   Derive alert state from collection rate
   ═══════════════════════════════════════════════════════ */
function deriveAlertFromRate(rate) {
  if (rate >= 65) {
    // Green zone — safe
    const days = Math.round(30 + (rate - 65) * 0.75); // 30–56 days
    return { level: 'green', days };
  }
  if (rate >= 40) {
    // Yellow zone — warning
    const days = Math.round(10 + (rate - 40) * 0.8); // 10–30 days
    return { level: 'yellow', days };
  }
  // Red zone — critical
  const days = Math.max(1, Math.round(rate * 0.25)); // 1–10 days
  return { level: 'red', days };
}

/**
 * Dashboard — main application layout.
 * Contains a top navigation bar with theme and language toggles,
 * and a content area with interactive what-if simulation.
 */
export default function Dashboard() {
  const { theme, lang, toggleTheme, toggleLang } = useThemeLang();

  const isDark = theme === 'dark';
  const isArabic = lang === 'ar';

  /* ─── Collection rate state (drives alerts + forecast) ─── */
  const [collectionRate, setCollectionRate] = useState(40);

  /* ─── Derived alert state ─── */
  const alert = useMemo(() => deriveAlertFromRate(collectionRate), [collectionRate]);

  /* ─── Derived liquidity status text ─── */
  const liquidityStatus = useMemo(() => {
    if (alert.level === 'green') return { ar: 'مستقرة', en: 'Stable' };
    if (alert.level === 'yellow') return { ar: 'متوسطة', en: 'Moderate' };
    return { ar: 'حرجة', en: 'Critical' };
  }, [alert.level]);

  const liquidityAccent =
    alert.level === 'green'
      ? 'var(--clr-success)'
      : alert.level === 'yellow'
        ? '#f59e0b'
        : '#ef4444';

  return (
    <div className="dashboard">
      {/* ─── Navigation Bar ─── */}
      <nav className="navbar">
        {/* Logo / Brand */}
        <div className="navbar__brand">
          <img 
            src={
              !isArabic
                ? isDark ? logoWhiteEng : logoBlueEng
                : isDark ? logoWhite : logoBlue
            } 
            alt="Basira Logo" 
            className="navbar__logo-img"
          />
          <span className="navbar__subtitle">
            {isArabic ? 'نظام الإنذار المبكر' : 'Early Warning System'}
          </span>
        </div>

        {/* Controls */}
        <div className="navbar__controls">
          {/* Language Toggle */}
          <button
            className="toggle-btn lang-toggle"
            onClick={toggleLang}
            aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
            title={isArabic ? 'English' : 'عربي'}
          >
            <span className="lang-toggle__label">
              {isArabic ? 'EN' : 'AR'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            className="toggle-btn theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            <span className="theme-toggle__icon">
              {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            </span>
          </button>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="dashboard__content">
        <div className="dashboard__hero">
          <h1 className="dashboard__title">
            {isArabic ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="dashboard__description">
            {isArabic
              ? 'مرحبًا بك في نظام بصيرة للإنذار المبكر. تابع حالة السيولة والتنبيهات الفورية.'
              : 'Welcome to the Basira Early Warning System. Monitor liquidity status and real-time alerts.'}
          </p>
        </div>

        {/* ─── File Upload ─── */}
        <FileUpload />

        {/* ─── What-If Slider ─── */}
        <WhatIfSlider value={collectionRate} onChange={setCollectionRate} />

        {/* ─── Alert Badge (reactive to slider) ─── */}
        <div className="alerts-row">
          <AlertBadge level={alert.level} daysRemaining={alert.days} />
        </div>

        {/* Status cards grid */}
        <div className="dashboard__grid">
          {[
            {
              titleAr: 'حالة السيولة',
              titleEn: 'Liquidity Status',
              valueAr: liquidityStatus.ar,
              valueEn: liquidityStatus.en,
              accent: liquidityAccent,
            },
            {
              titleAr: 'معدل التحصيل',
              titleEn: 'Collection Rate',
              valueAr: `${collectionRate}٪`,
              valueEn: `${collectionRate}%`,
              accent: liquidityAccent,
            },
            {
              titleAr: 'آخر تحديث',
              titleEn: 'Last Update',
              valueAr: 'الآن',
              valueEn: 'Just now',
              accent: 'var(--clr-secondary)',
            },
          ].map((card, i) => (
            <div className="card" key={i}>
              <div className="card__accent" style={{ background: card.accent }} />
              <h2 className="card__title">
                {isArabic ? card.titleAr : card.titleEn}
              </h2>
              <p className="card__value" style={{ color: card.accent }}>
                {isArabic ? card.valueAr : card.valueEn}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Cash Flow Chart (reactive to slider) ─── */}
        <CashFlowChart collectionRate={collectionRate} />

        {/* ─── AI Recommendations ─── */}
        <RecommendationSection recommendations={RECOMMENDATIONS} />
      </main>
    </div>
  );
}
