import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, ShieldAlert, PiggyBank, AlertTriangle,
  Activity, Wallet, TrendingDown,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import MetricCard from '../components/MetricCard';
import CashFlowChart from '../components/CashFlowChart';

export default function AnalyticsPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [analysisData, setAnalysisData] = useState(null);

  // نقرأ البيانات من localStorage لما تفتح الصفحة
  useEffect(() => {
    const saved = localStorage.getItem('basira_analysis');
    if (saved) {
      setAnalysisData(JSON.parse(saved));
    }
  }, []);

  // لو ما في بيانات — نعرض رسالة
  if (!analysisData) {
    return (
      <div className="fade-in" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <ShieldAlert size={48} style={{ opacity: 0.3 }} />
        <h2 style={{ opacity: 0.6 }}>
          {isArabic ? 'لا توجد بيانات بعد' : 'No data yet'}
        </h2>
        <p style={{ opacity: 0.4 }}>
          {isArabic 
            ? 'يرجى رفع ملف CSV من صفحة الربط ورفع الملفات' 
            : 'Please upload a CSV file from the File Upload page'}
        </p>
      </div>
    );
  }

  const alert = analysisData.alert;
  const recommendation = analysisData.recommendation;

  // تحديد لون الإنذار
  const alertColor = alert.color === 'green' ? '#10b981' 
    : alert.color === 'yellow' ? '#f59e0b' 
    : '#ef4444';

  const liquidityStatus = {
    ar: alert.color === 'green' ? 'آمنة' : alert.color === 'yellow' ? 'متوسطة' : 'حرجة',
    en: alert.color === 'green' ? 'Safe' : alert.color === 'yellow' ? 'Moderate' : 'Critical',
  };

  // حساب الرصيد التشغيلي من البيانات الحقيقية
  const forecastData = analysisData.forecast_data || [];
  const avgForecast = forecastData.length > 0
    ? Math.round(forecastData.reduce((sum, d) => sum + d.predicted, 0) / forecastData.length)
    : 0;

  // حساب نسبة التغير من البيانات التاريخية
  const historicalData = analysisData.historical_data || [];
  const changePercentage = historicalData.length >= 60
    ? (((historicalData.slice(-30).reduce((s, d) => s + d.cashflow, 0) / 30) -
        (historicalData.slice(-60, -30).reduce((s, d) => s + d.cashflow, 0) / 30)) /
        Math.abs(historicalData.slice(-60, -30).reduce((s, d) => s + d.cashflow, 0) / 30) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="fade-in">
      {/* KPI Cards */}
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
                {isArabic ? alert.message : alert.message}
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
            ? (alert.reasons[0] || 'لا يوجد') 
            : (alert.reasons[0] || 'None')}
          subtitle={isArabic
            ? `احتمالية الخطر: ${alert.risk_probability}%`
            : `Risk probability: ${alert.risk_probability}%`}
          icon={AlertTriangle}
          accentColor="#f59e0b"
        />
      </div>

      {/* التوصية */}
      {recommendation && (
        <div style={{
          margin: '1.5rem 0',
          padding: '1.5rem',
          borderRadius: '12px',
          background: `${alertColor}0d`,
          border: `1px solid ${alertColor}40`
        }}>
          <h3 style={{ marginBottom: '0.5rem', color: alertColor }}>
            {isArabic ? '💡 توصية بصيرة' : '💡 Basira Recommendation'}
          </h3>
          <p style={{ lineHeight: '1.8' }}>{recommendation}</p>
        </div>
      )}

      {/* الرسم البياني */}
      <CashFlowChart 
        historicalData={historicalData}
        forecastData={forecastData}
      />
    </div>
  );
}