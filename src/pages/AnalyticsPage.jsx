import { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert, ArrowUpRight,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import CashFlowChart from '../components/CashFlowChart';

const TRANSLATIONS = {
  ar: {
    noDataTitle: "لا توجد بيانات بعد",
    noDataDesc: "يرجى رفع ملف CSV من صفحة الربط ورفع الملفات",
    latePayments: "تأخر المدفوعات",
    cardLiquidity: "مدرج السيولة المتبقي",
    days: "أيام",
    dayUnit: "يوم",
    liquidityNote: "الوقت المتبقي قبل نفاذ النقد",
    cardOverdue: "ذمم متأخرة (+30 يوم)",
    currency: "ر.س",
    overdueNote: "مستحقة من عميل واحد رئيسي",
    cardDso: "متوسط أيام التحصيل",
    dsoNote: "مدة استلام دفعات العملاء عادةً",
    cardCashflow: "التدفق النقدي التشغيلي",
    cashflowNote: "صافي النقد الداخل هذا الشهر",
    cardChange: "نسبة التغير الشهري",
    costWarning: "بسبب ارتفاع التكاليف المباشرة",
    cardRisk: "أعلى خطر قادم",
    notifHeader: "التنبيهات",
    notifAlertTitle: "تنبيه سيولة حرج",
    notifAlertBodyPre: "سيولتك تكفي ",
    notifAlertBodyPost: " أيام فقط قبل دخول الرصيد للمنطقة السالبة إذا استمر الوضع الحالي."
  },
  en: {
    noDataTitle: "No data yet",
    noDataDesc: "Please upload a CSV file from the File Upload page",
    latePayments: "Late Payments",
    cardLiquidity: "Remaining Liquidity Runway",
    days: "Days",
    dayUnit: "Days",
    liquidityNote: "Time remaining before cash out",
    cardOverdue: "Overdue Payments (+30 Days)",
    currency: "SAR",
    overdueNote: "Due from one key client",
    cardDso: "Average Collection Period (DSO)",
    dsoNote: "Usual time to receive payments",
    cardCashflow: "Operating Cash Flow",
    cashflowNote: "Net cash inflow this month",
    cardChange: "Monthly Change Ratio",
    costWarning: "Due to rising direct costs",
    cardRisk: "Highest Upcoming Risk",
    notifHeader: "Notifications",
    notifAlertTitle: "Critical Liquidity Alert",
    notifAlertBodyPre: "Your liquidity is only sufficient for ",
    notifAlertBodyPost: " days before entering negative balance if the current situation continues."
  }
};

export default function AnalyticsPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const [analysisData, setAnalysisData] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // نقرأ البيانات ونجددها من الباكاند مباشرة
  useEffect(() => {
    const fetchAndRefresh = async () => {
      // 1. Show cached data immediately from localStorage (instant display)
      const saved = localStorage.getItem('basira_analysis');
      let parsedData = saved ? JSON.parse(saved) : null;

      // 2. If no localStorage data, nothing to show yet
      if (!parsedData) return;

      // Show cached data instantly while we fetch fresh
      setAnalysisData(parsedData);

      try {
        // 3. Try to get fresh data from backend /api/refresh_analysis
        const response = await fetch(`${API_URL}/api/refresh_analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            historical_data: parsedData.historical_data || [],
            forecast_data: parsedData.forecast_data || [],
            lang: lang
          })
        });

        if (!response.ok) {
          console.warn(`API refresh failed (${response.status}) — using cached data`);
          return;
        }

        const freshData = await response.json();
        if (!freshData.success) {
          console.warn('API refresh returned unsuccessful — using cached data');
          return;
        }

        // 4. Merge fresh data into cached data (preserve historical/forecast from upload)
        const merged = {
          ...parsedData,
          ...freshData,
          historical_data: parsedData.historical_data || freshData.historical_data,
          forecast_data: parsedData.forecast_data || freshData.forecast_data,
        };

        setAnalysisData(merged);
        localStorage.setItem('basira_analysis', JSON.stringify(merged));
        console.log('Analytics data refreshed from backend');

      } catch (error) {
        console.warn('Failed to fetch fresh analysis data — using cached:', error.message);
      }
    };

    // Listen for file upload completion events to re-fetch
    const handleUploadEvent = () => {
      console.log('File upload detected — refreshing analytics...');
      fetchAndRefresh();
    };

    // Initial load
    fetchAndRefresh();

    window.addEventListener('basira_analysis_updated', handleUploadEvent);
    window.addEventListener('refresh_analysis', handleUploadEvent);

    return () => {
      window.removeEventListener('basira_analysis_updated', handleUploadEvent);
      window.removeEventListener('refresh_analysis', handleUploadEvent);
    };
  }, [lang]);

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
          {t.noDataTitle}
        </h2>
        <p style={{ opacity: 0.4 }}>
          {t.noDataDesc}
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

  const daysToRisk = alert?.days_to_risk || analysisData?.runway_days || 0;
  const overduePayments = analysisData?.overdue_receivables || analysisData?.overdue_payments || 0;
  const dso = analysisData?.dso || analysisData?.collection_period || analysisData?.average_collection_days || 0;
  const highestRiskValue = analysisData?.highest_risk_value || analysisData?.highest_upcoming_risk || 0;
  const highestRiskTitle = analysisData?.highest_risk_description || analysisData?.highest_risk || t.latePayments;

  return (
    <div className="fade-in">

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 kpi-grid">

        {/* 1. مدة بقاء السيولة */}
        <article className="kpi-card kpi-card--ring">
          <span className="kpi-card__label">{t.cardLiquidity}</span>
          
          <div className="kpi-ring" style={{ '--ring-percentage': `${Math.min(daysToRisk/90, 1) * 100}%` }}>
            <div className="kpi-ring__inner">
              <span className="kpi-ring__value">{daysToRisk}</span>
              <span className="kpi-ring__unit">{t.days}</span>
            </div>
          </div>
          
          <p className="kpi-card__note">{t.liquidityNote}</p>
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 2. ذمم متأخرة */}
        <article className="kpi-card kpi-card--warning">
          <span className="kpi-priority-dot" />
          <span className="kpi-card__label">{t.cardOverdue}</span>
          
          <h3 className="kpi-card__value">{Number(overduePayments).toLocaleString('en-US')} <span className="text-xl">{t.currency}</span></h3>
          <p className="kpi-card__note">{t.overdueNote}</p>
          
          <div className="kpi-card__spark">
            {[40, 60, 35, 90, 50, 70].map((h, i) => (
              <span key={i} className={i === 3 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 3. متوسط أيام التحصيل */}
        <article className="kpi-card">
          <span className="kpi-card__label">{t.cardDso}</span>
          
          <h3 className="kpi-card__value">{Number(dso).toLocaleString('en-US')}</h3>
          <p className="kpi-card__note">{t.dsoNote}</p>
          
          <div className="kpi-card__spark">
            {[55, 45, 65, 85, 60, 40].map((h, i) => (
              <span key={i} className={i === 3 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 4. التدفق النقدي التشغيلي */}
        <article className="kpi-card kpi-card--positive">
          <span className="kpi-card__label">{t.cardCashflow}</span>
          
          <h3 className="kpi-card__value">+{avgForecast.toLocaleString('en-US')}</h3>
          <p className="kpi-card__note">{t.cashflowNote}</p>
          
          <div className="kpi-card__spark">
            {[30, 50, 40, 65, 95, 70].map((h, i) => (
              <span key={i} className={i === 4 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 5. نسبة التغير الشهري */}
        <article className="kpi-card kpi-card--warning">
          <span className="kpi-priority-dot" />
          <span className="kpi-card__label">{t.cardChange}</span>
          
          <h3 className="kpi-card__value">
            <span className="ml-1" style={{ color: Number(changePercentage) >= 0 ? 'var(--color-amber)' : 'var(--color-green)' }}>{Number(changePercentage) >= 0 ? '↑' : '↓'}</span>
            {Math.abs(Number(changePercentage))}%
          </h3>
          <p className="kpi-card__note">{t.costWarning}</p>
          
          <div className="kpi-card__spark">
            {[90, 70, 55, 45, 35, 25].map((h, i) => (
              <span key={i} className={i === 0 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 6. أعلى خطر قادم */}
        <article className="kpi-card kpi-card--danger">
          <span className="kpi-priority-dot" />
          <span className="kpi-card__label">{t.cardRisk}</span>
          
          <h3 className="kpi-card__value">{Number(highestRiskValue).toLocaleString('en-US')} <span className="text-xl">{t.currency}</span></h3>
          <p className="kpi-card__note truncate" title={highestRiskTitle}>{highestRiskTitle}</p>
          
          <div className="kpi-card__spark">
            {[35, 40, 45, 60, 75, 100].map((h, i) => (
              <span key={i} className={i === 5 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>
        
      </div>

      {/* Recommendations */}
      {recommendation?.analytics_insight && (
        <div className="my-10 block clear-both" style={{ marginTop: '40px', marginBottom: '40px', display: 'block', width: '100%' }}>
          <div className="p-8 rounded-2xl flex items-start gap-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" style={{ padding: '24px', borderRadius: '16px' }}>
            <div className="text-3xl flex-shrink-0 leading-none mt-0.5">💡</div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg m-0 font-bold text-gray-800 dark:text-gray-100 leading-snug">
                {recommendation.analytics_insight.title}
              </h3>
              <p className="m-0 leading-relaxed text-gray-500 dark:text-gray-400 font-medium mt-1.5 text-sm">
                {recommendation.analytics_insight.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* الرسم البياني */}
      <div style={{ marginTop: '24px' }}>
        <CashFlowChart 
          historicalData={historicalData}
        forecastData={forecastData}
        />
      </div>
    </div>
  );
}