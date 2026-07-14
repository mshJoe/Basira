import { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert, ArrowUpRight,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import CashFlowChart from '../components/CashFlowChart';

export default function AnalyticsPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [analysisData, setAnalysisData] = useState(null);

  // نقرأ البيانات من localStorage لما تفتح الصفحة
  useEffect(() => {
    const loadAnalysis = () => {
      const saved = localStorage.getItem('basira_analysis');
      if (saved) setAnalysisData(JSON.parse(saved));
    };

    loadAnalysis();

    window.addEventListener('basira_analysis_updated', loadAnalysis);
    return () => window.removeEventListener('basira_analysis_updated', loadAnalysis);
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

  const daysToRisk = alert?.days_to_risk || 0;
  const overduePayments = analysisData?.overdue_receivables || analysisData?.overdue_payments || 0;
  const dso = analysisData?.dso || analysisData?.collection_period || analysisData?.average_collection_days || 0;
  const highestRiskValue = analysisData?.highest_upcoming_risk || analysisData?.highest_risk_value || 12000;
  const highestRiskTitle = analysisData?.highest_risk || (isArabic ? 'تأخر المدفوعات' : 'Late Payments');

  return (
    <div className="fade-in">

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 kpi-grid">

        {/* 1. مدة بقاء السيولة */}
        <article className="kpi-card kpi-card--ring">
          <span className="kpi-card__label">{isArabic ? 'مدة بقاء السيولة' : 'Liquidity Runway'}</span>
          
          <div className="kpi-ring" style={{ '--ring-percentage': `${Math.min(daysToRisk/90, 1) * 100}%` }}>
            <div className="kpi-ring__inner">
              <span className="kpi-ring__value">{daysToRisk}</span>
              <span className="kpi-ring__unit">{isArabic ? 'يوم' : 'Days'}</span>
            </div>
          </div>
          
          <p className="kpi-card__note">{isArabic ? 'الوقت المتبقي قبل نفاذ النقد' : 'Time remaining before cash out'}</p>
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 2. ذمم متأخرة */}
        <article className="kpi-card kpi-card--warning">
          <span className="kpi-priority-dot" />
          <span className="kpi-card__label">{isArabic ? 'ذمم متأخرة (30+ يوم)' : 'Overdue Payments (30+ days)'}</span>
          
          <h3 className="kpi-card__value">{Number(overduePayments).toLocaleString('en-US')} <span className="text-xl">{isArabic ? 'ر.س' : 'SAR'}</span></h3>
          <p className="kpi-card__note">{isArabic ? 'مستحقة من عميل واحد رئيسي' : 'Due from one key client'}</p>
          
          <div className="kpi-card__spark">
            {[40, 60, 35, 90, 50, 70].map((h, i) => (
              <span key={i} className={i === 3 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 3. متوسط أيام التحصيل */}
        <article className="kpi-card">
          <span className="kpi-card__label">{isArabic ? 'متوسط أيام التحصيل' : 'Average Collection Period'}</span>
          
          <h3 className="kpi-card__value">{dso}</h3>
          <p className="kpi-card__note">{isArabic ? 'مدة استلام دفعات العملاء عادةً' : 'Usual time to receive payments'}</p>
          
          <div className="kpi-card__spark">
            {[55, 45, 65, 85, 60, 40].map((h, i) => (
              <span key={i} className={i === 3 ? 'is-peak' : ''} style={{ height: `${h}%` }} />
            ))}
          </div>
          
          <span className="kpi-card__action"><ArrowUpRight size={14} /></span>
        </article>

        {/* 4. التدفق النقدي التشغيلي */}
        <article className="kpi-card kpi-card--positive">
          <span className="kpi-card__label">{isArabic ? 'التدفق النقدي التشغيلي' : 'Operating Cash Flow'}</span>
          
          <h3 className="kpi-card__value">+{avgForecast.toLocaleString()}</h3>
          <p className="kpi-card__note">{isArabic ? 'صافي النقد الداخل هذا الشهر' : 'Net cash inflow this month'}</p>
          
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
          <span className="kpi-card__label">{isArabic ? 'نسبة التغير الشهري' : 'Monthly Change Ratio'}</span>
          
          <h3 className="kpi-card__value">
            <span className="ml-1" style={{ color: Number(changePercentage) >= 0 ? 'var(--color-green)' : 'var(--color-amber)' }}>{Number(changePercentage) >= 0 ? '↑' : '↓'}</span>
            {Math.abs(Number(changePercentage))}%
          </h3>
          <p className="kpi-card__note">{isArabic ? 'بسبب ارتفاع التكاليف المباشرة' : 'Due to direct costs increase'}</p>
          
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
          <span className="kpi-card__label">{isArabic ? 'أعلى خطر قادم' : 'Highest Upcoming Risk'}</span>
          
          <h3 className="kpi-card__value">{Number(highestRiskValue).toLocaleString('en-US')}</h3>
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
        <div className="bg-white dark:bg-[#131E2C] rounded-2xl p-6 mb-8 shadow-sm flex items-start gap-5">
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
      )}

      {/* الرسم البياني */}
      <CashFlowChart 
        historicalData={historicalData}
        forecastData={forecastData}
      />
    </div>
  );
}