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
        {/* Card 1: Merged Alert Status & Countdown */}
        <div 
          className="metric-card" 
          style={{ 
            '--metric-accent': liquidityStatus.color,
            '--metric-accent-bg': `${liquidityStatus.color}1a`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Header matching exact flex layout of sibling cards */}
          <div className="metric-card__header">
            <span className="metric-card__title">
              {isArabic ? 'مؤشر الإنذار الرئيسي' : 'Main Alert Status'}
            </span>
            <div
              className="metric-card__icon-wrap"
              style={{
                background: `${liquidityStatus.color}1a`,
                color: liquidityStatus.color,
              }}
            >
              <Activity size={18} strokeWidth={1.8} />
            </div>
          </div>
          
          {/* Bottom Area: Circular Ring + Badge + Subtitle */}
          <div className="flex items-center gap-4 mt-2">
            {/* Circular Indicator */}
            <div 
              style={{ 
                width: '56px',
                height: '56px', 
                flexShrink: 0,
                borderColor: liquidityStatus.color,
                boxShadow: `0 0 10px ${liquidityStatus.color}30, inset 0 0 4px ${liquidityStatus.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                borderWidth: '2.5px',
                borderStyle: 'solid'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1' }}>
                <span style={{ color: liquidityStatus.color, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {alert.days}
                </span>
                <span style={{ fontSize: '0.55rem', color: 'var(--color-basira-text-muted)', marginTop: '2px' }}>
                  {isArabic ? (alert.days === 1 ? 'يوم' : 'متبقي') : (alert.days === 1 ? 'day' : 'left')}
                </span>
              </div>
            </div>

            {/* Vertical Stack: Badge & Text */}
            <div className="flex flex-col items-start gap-2">
              <span
                className="status-pill"
                style={{
                  background: `${liquidityStatus.color}18`,
                  color: liquidityStatus.color,
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem',
                  margin: 0
                }}
              >
                <span className="status-pill__dot" style={{ background: liquidityStatus.color, width: '6px', height: '6px' }} />
                {isArabic ? liquidityStatus.ar : liquidityStatus.en}
              </span>

              <p className="metric-card__subtitle" style={{ fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>
                {isArabic 
                  ? alert.level === 'green' ? 'السيولة في مستوى مستقر وآمن' : alert.level === 'yellow' ? 'انخفاض ملحوظ في مستوى السيولة' : 'مستوى حرج — تدخل فوري مطلوب'
                  : alert.level === 'green' ? 'Liquidity is at a stable, safe level' : alert.level === 'yellow' ? 'Noticeable decline in liquidity level' : 'Critical level — immediate action required'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Operational Balance */}
        <MetricCard
          title={isArabic ? 'الرصيد التشغيلي المتوقع' : 'Expected Operational Balance'}
          value={
            isArabic
              ? `${operationalBalance.toLocaleString('ar-SA').replace(/٬/g, ',')} ﷼`
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

      {/* ─── Dashboard Main Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
        {/* Recommendations (Right side in RTL) */}
        <div className="lg:col-span-5 h-full">
          <RecommendationSection recommendations={RECOMMENDATIONS} />
        </div>

        {/* Chart (Left side in RTL) */}
        <div className="lg:col-span-7 h-full">
          <CashFlowChart collectionRate={collectionRate} showForecastOnly={true} className="h-full !mb-0" />
        </div>
      </div>
    </div>
  );
}
