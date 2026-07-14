import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, ShieldAlert, PiggyBank, AlertTriangle,
  Activity, Wallet, TrendingDown,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import MetricCard from '../components/MetricCard';
import CashFlowChart from '../components/CashFlowChart';
import { RecommendationSection } from '../components/RecommendationCard';

const DEFAULT_RECOMMENDATIONS = [
  {
    icon: TrendingUp,
    titleAr: 'حَصّل مستحقات العميل الرئيسي هذا الأسبوع',
    titleEn: 'Collect Key Client Receivables This Week',
    descriptionAr: 'تحليل بصيرة يُظهر أن تحصيل ٧٠٪ من المستحقات المتأخرة سيرفع الرصيد التشغيلي بمقدار ١٢٠,٠٠٠ ﷼ خلال ٧ أيام.',
    descriptionEn: 'Basira analysis shows collecting 70% of overdue receivables will increase operational balance by 120,000 SAR within 7 days.',
    tags: ['highPriority', 'cashflow'],
    accentKey: 'accent',
  },
  {
    icon: ShieldAlert,
    titleAr: 'مراجعة حدود الائتمان مع الموردين',
    titleEn: 'Review Supplier Credit Limits',
    descriptionAr: 'البيانات تُظهر إمكانية تحسين شروط الائتمان مع ٣ موردين رئيسيين لتقليل المخاطر بنسبة ١٥٪.',
    descriptionEn: 'Data indicates an opportunity to optimize credit terms with 3 key suppliers, reducing risk exposure by 15%.',
    tags: ['medPriority', 'risk'],
    accentKey: 'warning',
  },
  {
    icon: PiggyBank,
    titleAr: 'تحويل الفائض إلى استثمار قصير الأجل',
    titleEn: 'Redirect Surplus to Short-Term Investment',
    descriptionAr: 'الفائض النقدي الحالي يمكن استثماره في أدوات قصيرة الأجل لتحقيق عائد إضافي بدون مخاطر عالية.',
    descriptionEn: 'Current cash surplus can be invested in short-term instruments to generate additional yield with minimal risk.',
    tags: ['automated', 'saving'],
    accentKey: 'success',
  },
];

export default function DashboardPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const loadAnalysis = () => {
      const saved = localStorage.getItem('basira_analysis');
      if (saved) setAnalysisData(JSON.parse(saved));
    };

    loadAnalysis();

    window.addEventListener('basira_analysis_updated', loadAnalysis);
    return () => window.removeEventListener('basira_analysis_updated', loadAnalysis);
  }, []);

  // لو ما في بيانات — نستخدم القيم الافتراضية
  const alert = analysisData?.alert || { color: 'green', days_to_risk: 30, risk_probability: 0, reasons: [] };
  const forecastData = analysisData?.forecast_data || [];
  const historicalData = analysisData?.historical_data || [];

  const dynamicRecommendations = useMemo(() => {
    const actions = analysisData?.recommendation?.dashboard_actions;
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return DEFAULT_RECOMMENDATIONS;
    }

    const icons = [TrendingUp, ShieldAlert, PiggyBank];

    return actions.map((action, i) => {
      let accentKey = 'secondary';
      const tag = action.primary_tag || '';
      if (tag.includes('عالية') || tag.includes('High')) accentKey = 'accent';
      else if (tag.includes('مخاطر') || tag.includes('Risk') || tag.includes('تحذير')) accentKey = 'warning';
      else if (tag.includes('توفير') || tag.includes('Saving') || tag.includes('استثمار')) accentKey = 'success';

      return {
        icon: icons[i % icons.length],
        titleAr: action.title,
        titleEn: action.title,
        descriptionAr: action.description,
        descriptionEn: action.description,
        tags: [tag],
        accentKey: accentKey,
      };
    });
  }, [analysisData]);

  const days = alert.days_to_risk || 30;

  const getLevelFromDays = (days) => {
    if (days > 30) return 'green';
    if (days >= 15) return 'yellow';
    return 'red';
  };

  const computedLevel = getLevelFromDays(days);

  const alertColor = computedLevel === 'green' ? '#10b981'
    : computedLevel === 'yellow' ? '#f59e0b'
    : '#ef4444';

  const liquidityStatus = {
    ar: computedLevel === 'green' ? 'آمنة'
      : computedLevel === 'yellow' ? 'متوسطة'
      : 'حرجة',
    en: computedLevel === 'green' ? 'Safe'
      : computedLevel === 'yellow' ? 'Moderate'
      : 'Critical',
  };

  const statusNote = {
    ar: computedLevel === 'green'
      ? 'السيولة في مستوى مستقر وآمن'
      : computedLevel === 'yellow'
        ? 'انخفاض ملحوظ في مستوى السيولة'
        : 'مستوى حرج — تدخل فوري مطلوب',
    en: computedLevel === 'green'
      ? 'Liquidity is at a stable, safe level'
      : computedLevel === 'yellow'
        ? 'Noticeable decline in liquidity level'
        : 'Critical level — immediate action required',
  };

  const bannerColors = computedLevel === 'green'
    ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
    : computedLevel === 'yellow'
      ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
      : 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';

  const avgForecast = forecastData.length > 0
    ? Math.round(forecastData.reduce((s, d) => s + d.predicted, 0) / forecastData.length)
    : 3200;

  const changePercentage = historicalData.length >= 60
    ? (((historicalData.slice(-30).reduce((s, d) => s + d.cashflow, 0) / 30) -
        (historicalData.slice(-60, -30).reduce((s, d) => s + d.cashflow, 0) / 30)) /
        Math.abs(historicalData.slice(-60, -30).reduce((s, d) => s + d.cashflow, 0) / 30) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="fade-in">
      {/* Liquidity Alert Banner */}
      {alert && alert.days_to_risk && (
        <div className="p-5 my-6 rounded-2xl flex items-center justify-between bg-red-950/20 border border-red-900/30 text-red-500" style={{ padding: '20px 24px', marginTop: '24px', marginBottom: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', width: '100%' }}>
          <div className="flex items-center gap-3" style={{ gap: '12px' }}>
            <ShieldAlert size={28} className="flex-shrink-0" />
            <p className="font-semibold m-0 text-sm md:text-base leading-relaxed">
              {isArabic 
                ? `سيولتك تكفي ${alert.days_to_risk} يوماً فقط قبل دخول الرصيد للمنطقة السالبة إذا استمر الوضع الحالي`
                : `Your liquidity is sufficient for only ${alert.days_to_risk} days before entering negative balance if the current situation continues`}
            </p>
          </div>
        </div>
      )}

      <div className="kpi-grid gap-6 mb-12">
        {/* Card 1: مؤشر الإنذار */}
        <div className="metric-card" style={{
          '--metric-accent': alertColor,
          '--metric-accent-bg': `${alertColor}1a`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div className="metric-card__header">
            <span className="metric-card__title">
              {isArabic ? 'مؤشر الإنذار الرئيسي' : 'Main Alert Status'}
            </span>
            <div className="metric-card__icon-wrap" style={{
              background: `${alertColor}1a`, color: alertColor,
            }}>
              <Activity size={18} strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div style={{
              width: '56px', height: '56px', flexShrink: 0,
              borderColor: alertColor,
              boxShadow: `0 0 10px ${alertColor}30, inset 0 0 4px ${alertColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', borderWidth: '2.5px', borderStyle: 'solid'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1' }}>
                <span style={{ color: alertColor, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {alert.days_to_risk}
                </span>
                <span style={{ fontSize: '0.55rem', color: 'var(--color-basira-text-muted)', marginTop: '2px' }}>
                  {isArabic ? 'متبقي' : 'left'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="status-pill" style={{
                background: `${alertColor}18`, color: alertColor,
                padding: '0.2rem 0.6rem', fontSize: '0.75rem', margin: 0
              }}>
                <span className="status-pill__dot" style={{ background: alertColor, width: '6px', height: '6px' }} />
                {isArabic ? liquidityStatus.ar : liquidityStatus.en}
              </span>
              <p className="metric-card__subtitle" style={{ fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>
                {isArabic ? statusNote.ar : statusNote.en}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: الرصيد التشغيلي */}
        <MetricCard
          title={isArabic ? 'الرصيد التشغيلي المتوقع' : 'Expected Operational Balance'}
          value={isArabic
            ? `${avgForecast.toLocaleString('en-US')} ﷼`
            : `${avgForecast.toLocaleString('en-US')} SAR`}
          subtitle={isArabic ? 'خلال ٣٠ يوم القادمة' : 'Over the next 30 days'}
          icon={Wallet}
          accentColor="#3B82F6"
          trend={Number(changePercentage) >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(Number(changePercentage))}%`}
        />

        {/* Card 3: نسبة التغير */}
        <MetricCard
          title={isArabic ? 'نسبة التغير' : 'Change Ratio'}
          value={`${Number(changePercentage) >= 0 ? '+' : ''}${changePercentage}%`}
          subtitle={isArabic ? 'مقارنة بالشهر السابق' : 'Compared to last month'}
          icon={Number(changePercentage) >= 0 ? TrendingUp : TrendingDown}
          accentColor={Number(changePercentage) >= 0 ? '#10b981' : '#ef4444'}
        />

        {/* Card 4: أعلى خطر */}
        <MetricCard
          title={isArabic ? 'أعلى خطر قادم' : 'Highest Upcoming Risk'}
          value={
            <span className="text-xl leading-snug" style={{ display: 'block', marginTop: '0.25rem' }}>
              {isArabic ? (alert.reasons?.[0] || 'لا يوجد') : (alert.reasons?.[0] || 'None')}
            </span>
          }
          subtitle={isArabic
            ? `احتمالية الخطر: ${alert.risk_probability}%`
            : `Risk probability: ${alert.risk_probability}%`}
          icon={AlertTriangle}
          accentColor="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <RecommendationSection recommendations={dynamicRecommendations} />
        </div>
        <div className="lg:col-span-7 h-full">
          <CashFlowChart
            showForecastOnly={true}
            className="h-full !mb-0"
            historicalData={historicalData}
            forecastData={forecastData}
          />
        </div>
      </div>
    </div>
  );
}