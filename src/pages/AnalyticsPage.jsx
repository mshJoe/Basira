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
    notifAlertBodyPost: " أيام فقط قبل دخول الرصيد للمنطقة السالبة إذا استمر الوضع الحالي.",
    breakdownTitle: "تفاصيل وتحليل التوزيع المالي",
    breakdownSubtitle: "ملخص المؤشرات المالية الأساسية حسب التصنيف",
    colLabel: "البند / التصنيف",
    colValue: "القيمة الحالية",
    colChange: "التغير",
    colStatus: "الحالة",
    statusHealthy: "مستقر",
    statusWarning: "تحذير",
    statusCritical: "حرج",
    rowRevenue: "متوسط الإيرادات اليومية",
    rowExpenses: "متوسط المصروفات اليومية",
    rowNetCash: "صافي التدفق النقدي",
    rowRiskProb: "احتمالية المخاطر",
    rowRunway: "فترة الأمان المتبقية",
    rowWorstDay: "أسوأ يوم متوقع"
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
    notifAlertBodyPost: " days before entering negative balance if the current situation continues.",
    breakdownTitle: "Financial Distribution Breakdown",
    breakdownSubtitle: "Summary of core financial indicators by category",
    colLabel: "Item / Category",
    colValue: "Current Value",
    colChange: "Change",
    colStatus: "Status",
    statusHealthy: "Healthy",
    statusWarning: "Warning",
    statusCritical: "Critical",
    rowRevenue: "Average Daily Revenue",
    rowExpenses: "Average Daily Expenses",
    rowNetCash: "Net Cash Flow",
    rowRiskProb: "Risk Probability",
    rowRunway: "Remaining Safety Runway",
    rowWorstDay: "Worst Projected Day"
  }
};

export default function AnalyticsPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const [analysisData, setAnalysisData] = useState(null);

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
        const response = await fetch(`https://05e9-2001-16a4-428-478f-608c-aead-f4f0-ba95.ngrok-free.app/api/refresh_analysis`, {
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

  // Extract data arrays (safe even when analysisData is null)
  const forecastData = analysisData?.forecast_data || [];
  const historicalData = analysisData?.historical_data || [];

  // Compute fallback metrics from data (used when backend/AI values aren't available)
  const computedMetrics = useMemo(() => {
    const hist = historicalData || [];
    const fore = forecastData || [];

    let computedOverdue = 0;
    if (hist.length > 0) {
      const last60 = hist.slice(-60);
      computedOverdue = last60.reduce((s, d) => s + (d.cashflow < 0 ? Math.abs(d.cashflow) : 0), 0);
    }

    let computedDso = 30;
    if (hist.length >= 30) {
      const last30 = hist.slice(-30);
      const positives = last30.filter(d => d.cashflow > 0);
      const negatives = last30.filter(d => d.cashflow < 0);
      const avgRevenue = positives.length > 0
        ? positives.reduce((s, d) => s + d.cashflow, 0) / positives.length
        : Math.abs(last30.reduce((s, d) => s + d.cashflow, 0) / last30.length);
      const totalReceivables = negatives.length > 0
        ? Math.abs(negatives.reduce((s, d) => s + d.cashflow, 0))
        : 0;
      computedDso = avgRevenue > 0 ? Math.max(0, Math.round((totalReceivables / avgRevenue) * 10) / 10) : 30;
    }

    let computedRiskValue = 0;
    if (fore.length > 0) {
      const worst = Math.min(...fore.map(d => d.predicted || 0));
      computedRiskValue = Math.round(Math.abs(worst) * 100) / 100;
    }
    const computedRiskTitle = isArabic ? 'انخفاض متوقع في التدفق النقدي' : 'Expected cash flow decline';

    return { computedOverdue, computedDso, computedRiskValue, computedRiskTitle };
  }, [historicalData, forecastData, isArabic]);

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
  const avgForecast = forecastData.length > 0
    ? Math.round(forecastData.reduce((sum, d) => sum + d.predicted, 0) / forecastData.length)
    : 0;

  // حساب نسبة التغير من البيانات التاريخية
  const changePercentage = historicalData.length >= 60
    ? (((historicalData.slice(-30).reduce((s, d) => s + d.cashflow, 0) / 30) -
        (historicalData.slice(-60, -30).reduce((s, d) => s + d.cashflow, 0) / 30)) /
        Math.abs(historicalData.slice(-60, -30).reduce((s, d) => s + d.cashflow, 0) / 30) * 100).toFixed(1)
    : '0.0';

  const daysToRisk = alert?.days_to_risk || analysisData?.runway_days || 0;
  const overduePayments = analysisData?.overdue_receivables ?? analysisData?.overdue_payments ?? computedMetrics.computedOverdue ?? 0;
  const dso = analysisData?.dso ?? analysisData?.collection_period ?? analysisData?.average_collection_days ?? computedMetrics.computedDso ?? 30;
  const highestRiskValue = analysisData?.highest_risk_value ?? analysisData?.highest_upcoming_risk ?? computedMetrics.computedRiskValue ?? 0;
  const highestRiskTitle = analysisData?.highest_risk_description ?? analysisData?.highest_risk ?? computedMetrics.computedRiskTitle ?? t.latePayments;

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

      {/* Financial Distribution Breakdown */}
      {(() => {
        // Compute breakdown rows from real data
        const hist = analysisData?.historical_data || [];
        const avgRevenue = hist.length > 0 ? Math.round(hist.reduce((s, d) => s + (d.sales || 0), 0) / hist.length) : 0;
        const avgExpenses = hist.length > 0 ? Math.round(hist.reduce((s, d) => s + (d.expenses || 0), 0) / hist.length) : 0;
        const netCash = avgRevenue - avgExpenses;
        const riskProb = alert?.risk_probability || 0;
        const worstCash = alert?.worst_expected_cashflow || 0;

        const getStatus = (type) => {
          if (type === 'positive') return { label: t.statusHealthy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', dot: 'bg-emerald-500' };
          if (type === 'warning') return { label: t.statusWarning, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500' };
          return { label: t.statusCritical, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', dot: 'bg-red-500' };
        };

        const rows = analysisData?.breakdown_items || [
          { label: t.rowRevenue, value: avgRevenue, suffix: t.currency, status: avgRevenue > 0 ? 'positive' : 'warning', change: null },
          { label: t.rowExpenses, value: avgExpenses, suffix: t.currency, status: avgExpenses > avgRevenue ? 'critical' : avgExpenses > avgRevenue * 0.8 ? 'warning' : 'positive', change: null },
          { label: t.rowNetCash, value: netCash, suffix: t.currency, status: netCash > 0 ? 'positive' : netCash > -1000 ? 'warning' : 'critical', change: changePercentage ? `${changePercentage}%` : null },
          { label: t.rowRiskProb, value: riskProb, suffix: '%', status: riskProb > 70 ? 'critical' : riskProb > 40 ? 'warning' : 'positive', change: null },
          { label: t.rowRunway, value: daysToRisk, suffix: ` ${t.days}`, status: daysToRisk < 15 ? 'critical' : daysToRisk < 30 ? 'warning' : 'positive', change: null },
          { label: t.rowWorstDay, value: worstCash, suffix: t.currency, status: worstCash < 0 ? 'critical' : worstCash < 2000 ? 'warning' : 'positive', change: null },
        ];

        return (
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '28px',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-sm)',
            marginTop: '32px',
            marginBottom: '32px',
            transition: 'box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--color-ink)',
                margin: 0,
                lineHeight: 1.3,
              }}>{t.breakdownTitle}</h3>
              <p style={{
                fontSize: '12.5px',
                color: 'var(--color-muted)',
                margin: '4px 0 0 0',
              }}>{t.breakdownSubtitle}</p>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 rounded-xl mb-2" style={{
              background: 'var(--color-surface-soft)',
            }}>
              <span className="col-span-4" style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{t.colLabel}</span>
              <span className="col-span-3 text-center" style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{t.colValue}</span>
              <span className="col-span-2 text-center" style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{t.colChange}</span>
              <span className="col-span-3 text-center" style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{t.colStatus}</span>
            </div>

            <div>
              {rows.map((row, idx) => {
                const st = getStatus(row.status);
                const statusColor = row.status === 'positive' ? 'var(--color-green)'
                  : row.status === 'warning' ? 'var(--color-amber)'
                  : 'var(--color-red)';
                const statusBg = row.status === 'positive' ? 'var(--color-green-soft)'
                  : row.status === 'warning' ? 'var(--color-amber-soft)'
                  : 'var(--color-red-soft)';
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 items-center rounded-lg transition-colors"
                    style={{
                      borderBottom: idx < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: statusColor,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)',
                      }}>{row.label}</span>
                    </div>
                    <div className="col-span-1 md:col-span-3 text-center">
                      <span style={{
                        fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {Number(row.value || 0).toLocaleString('en-US')}
                      </span>
                      <span style={{
                        fontSize: '11px', color: 'var(--color-muted)', marginLeft: '4px',
                      }}>{row.suffix}</span>
                    </div>
                    <div className="col-span-1 md:col-span-2 text-center">
                      {row.change ? (
                        <span style={{
                          fontSize: '11px', fontWeight: 600,
                          padding: '2px 8px', borderRadius: '100px',
                          color: parseFloat(row.change) >= 0 ? 'var(--color-amber)' : 'var(--color-green)',
                          background: parseFloat(row.change) >= 0 ? 'var(--color-amber-soft)' : 'var(--color-green-soft)',
                        }}>
                          {parseFloat(row.change) >= 0 ? '↑' : '↓'} {row.change}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px', color: 'var(--color-muted)', opacity: 0.5,
                        }}>—</span>
                      )}
                    </div>
                    <div className="col-span-1 md:col-span-3 flex justify-center">
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '100px',
                        color: statusColor,
                        background: statusBg,
                      }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}


      {/* Warning Reason */}
      {recommendation?.analytics_insight && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '28px',
          padding: '22px 24px',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '32px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: alertColor,
            opacity: 0.8,
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${alertColor}1a`,
              color: alertColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldAlert size={20} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-ink)',
                margin: 0,
                lineHeight: 1.4,
              }}>
                {recommendation.analytics_insight.title}
              </h3>
              <p style={{
                fontSize: '12.5px',
                color: 'var(--color-ink-soft)',
                margin: '6px 0 0 0',
                lineHeight: 1.6,
              }}>
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