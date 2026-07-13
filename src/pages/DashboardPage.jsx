import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, ShieldAlert, PiggyBank, AlertTriangle,
  Activity, Wallet, TrendingDown,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import MetricCard from '../components/MetricCard';
import CashFlowChart from '../components/CashFlowChart';
import { RecommendationSection } from '../components/RecommendationCard';

const RECOMMENDATIONS = [
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
    const saved = localStorage.getItem('basira_analysis');
    if (saved) setAnalysisData(JSON.parse(saved));
  }, []);

  // لو ما في بيانات — نستخدم القيم الافتراضية
  const alert = analysisData?.alert || { color: 'green', days_to_risk: 30, risk_probability: 0, reasons: [] };
  const forecastData = analysisData?.forecast_data || [];
  const historicalData = analysisData?.historical_data || [];

  const alertColor = alert.color === 'green' ? '#10b981'
    : alert.color === 'yellow' ? '#f59e0b' : '#ef4444';

  const liquidityStatus = {
    ar: alert.color === 'green' ? 'آمنة' : alert.color === 'yellow' ? 'متوسطة' : 'حرجة',
    en: alert.color === 'green' ? 'Safe' : alert.color === 'yellow' ? 'Moderate' : 'Critical',
  };

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
      <div className="kpi-grid">
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
                {isArabic
                  ? alert.color === 'green' ? 'السيولة في مستوى مستقر وآمن'
                    : alert.color === 'yellow' ? 'انخفاض ملحوظ في مستوى السيولة'
                    : 'مستوى حرج — تدخل فوري مطلوب'
                  : alert.color === 'green' ? 'Liquidity is at a stable, safe level'
                    : alert.color === 'yellow' ? 'Noticeable decline in liquidity level'
                    : 'Critical level — immediate action required'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: الرصيد التشغيلي */}
        <MetricCard
          title={isArabic ? 'الرصيد التشغيلي المتوقع' : 'Expected Operational Balance'}
          value={isArabic
            ? `${avgForecast.toLocaleString('ar-SA')} ﷼`
            : `${avgForecast.toLocaleString()} SAR`}
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
          value={isArabic
            ? (alert.reasons?.[0] || 'لا يوجد')
            : (alert.reasons?.[0] || 'None')}
          subtitle={isArabic
            ? `احتمالية الخطر: ${alert.risk_probability}%`
            : `Risk probability: ${alert.risk_probability}%`}
          icon={AlertTriangle}
          accentColor="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <RecommendationSection recommendations={RECOMMENDATIONS} />
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