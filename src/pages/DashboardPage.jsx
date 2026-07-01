import { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  PiggyBank,
  AlertTriangle,
  Activity,
  Wallet,
  TrendingDown,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import MetricCard from '../components/MetricCard';
import CashFlowChart from '../components/CashFlowChart';
import AlertBadge from '../components/AlertBadge';
import WhatIfSlider from '../components/WhatIfSlider';
import { RecommendationSection } from '../components/RecommendationCard';

/* ─── Sample recommendation data ─── */
const RECOMMENDATIONS = [
  {
    icon: TrendingUp,
    titleAr: 'حَصّل مستحقات العميل الرئيسي هذا الأسبوع',
    titleEn: 'Collect Key Client Receivables This Week',
    descriptionAr:
      'تحليل بصيرة يُظهر أن تحصيل ٧٠٪ من المستحقات المتأخرة سيرفع الرصيد التشغيلي بمقدار ١٢٠,٠٠٠ ﷼ خلال ٧ أيام.',
    descriptionEn:
      'Basira analysis shows collecting 70% of overdue receivables will increase operational balance by 120,000 SAR within 7 days.',
    tags: ['highPriority', 'cashflow'],
    accentKey: 'accent',
  },
  {
    icon: ShieldAlert,
    titleAr: 'مراجعة حدود الائتمان مع الموردين',
    titleEn: 'Review Supplier Credit Limits',
    descriptionAr:
      'البيانات تُظهر إمكانية تحسين شروط الائتمان مع ٣ موردين رئيسيين لتقليل المخاطر بنسبة ١٥٪.',
    descriptionEn:
      'Data indicates an opportunity to optimize credit terms with 3 key suppliers, reducing risk exposure by 15%.',
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
    const days = Math.round(30 + (rate - 65) * 0.75);
    return { level: 'green', days };
  }
  if (rate >= 40) {
    const days = Math.round(10 + (rate - 40) * 0.8);
    return { level: 'yellow', days };
  }
  const days = Math.max(1, Math.round(rate * 0.25));
  return { level: 'red', days };
}

/**
 * DashboardPage — Main dashboard view with KPI cards, chart, alerts & recommendations.
 */
export default function DashboardPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [collectionRate, setCollectionRate] = useState(40);
  const alert = useMemo(() => deriveAlertFromRate(collectionRate), [collectionRate]);

  /* ─── Derived liquidity status ─── */
  const liquidityStatus = useMemo(() => {
    if (alert.level === 'green') return { ar: 'آمنة', en: 'Safe', color: '#10b981' };
    if (alert.level === 'yellow') return { ar: 'متوسطة', en: 'Moderate', color: '#f59e0b' };
    return { ar: 'حرجة', en: 'Critical', color: '#ef4444' };
  }, [alert.level]);

  /* ─── Derived operational balance ─── */
  const operationalBalance = useMemo(() => {
    const base = 3200 + (collectionRate - 40) * 45;
    return Math.round(Math.max(800, base));
  }, [collectionRate]);

  /* ─── Derived change percentage ─── */
  const changePercentage = useMemo(() => {
    const pct = ((collectionRate - 50) / 50) * 18;
    return pct.toFixed(1);
  }, [collectionRate]);

  return (
    <div className="fade-in">
      {/* ─── KPI Cards Grid ─── */}
      <div className="kpi-grid">
        {/* Card 1: Alert Status */}
        <MetricCard
          title={isArabic ? 'مؤشر الإنذار الرئيسي' : 'Main Alert Status'}
          value={
            <span
              className="status-pill"
              style={{
                background: `${liquidityStatus.color}18`,
                color: liquidityStatus.color,
              }}
            >
              <span
                className="status-pill__dot"
                style={{ background: liquidityStatus.color }}
              />
              {isArabic ? liquidityStatus.ar : liquidityStatus.en}
            </span>
          }
          subtitle={isArabic ? 'حالة السيولة الحالية' : 'Current liquidity status'}
          icon={Activity}
          accentColor={liquidityStatus.color}
        />

        {/* Card 2: Operational Balance */}
        <MetricCard
          title={isArabic ? 'الرصيد التشغيلي المتوقع' : 'Expected Operational Balance'}
          value={
            isArabic
              ? `${operationalBalance.toLocaleString('ar-SA')} ﷼`
              : `${operationalBalance.toLocaleString()} SAR`
          }
          subtitle={isArabic ? 'خلال ٣٠ يوم القادمة' : 'Over the next 30 days'}
          icon={Wallet}
          accentColor="#3B82F6"
          trend={Number(changePercentage) >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(Number(changePercentage))}%`}
        />

        {/* Card 3: Change Percentage */}
        <MetricCard
          title={isArabic ? 'نسبة التغير' : 'Change Ratio'}
          value={`${Number(changePercentage) >= 0 ? '+' : ''}${changePercentage}%`}
          subtitle={isArabic ? 'مقارنة بالشهر السابق' : 'Compared to last month'}
          icon={Number(changePercentage) >= 0 ? TrendingUp : TrendingDown}
          accentColor={Number(changePercentage) >= 0 ? '#10b981' : '#ef4444'}
        />

        {/* Card 4: Highest Upcoming Risk */}
        <MetricCard
          title={isArabic ? 'أعلى خطر قادم' : 'Highest Upcoming Risk'}
          value={isArabic ? 'إيجار المقر' : 'Office Rent'}
          subtitle={
            isArabic
              ? 'مستحق خلال ١٤ يوم — ٤٥,٠٠٠ ﷼'
              : 'Due in 14 days — 45,000 SAR'
          }
          icon={AlertTriangle}
          accentColor="#f59e0b"
        />
      </div>

      {/* ─── Alert Badge ─── */}
      <div className="alerts-row">
        <AlertBadge level={alert.level} daysRemaining={alert.days} />
      </div>

      {/* ─── What-If Slider ─── */}
      <WhatIfSlider value={collectionRate} onChange={setCollectionRate} />

      {/* ─── Predictive Cash Flow Chart ─── */}
      <CashFlowChart collectionRate={collectionRate} />

      {/* ─── AI Recommendations ─── */}
      <RecommendationSection recommendations={RECOMMENDATIONS} />
    </div>
  );
}
