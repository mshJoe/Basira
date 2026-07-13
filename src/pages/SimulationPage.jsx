import { useState, useMemo, useEffect } from 'react';
import { Clock, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import WhatIfSlider from '../components/WhatIfSlider';
import CashFlowChart from '../components/CashFlowChart';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export default function SimulationPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [collectionRate, setCollectionRate] = useState(50);
  const [forecastData, setForecastData] = useState([]);
  const [alertColor, setAlertColor] = useState('green');
  const [riskProb, setRiskProb] = useState(0);

  // نقرأ البيانات الأصلية من localStorage
  const [originalForecast] = useState(() => {
    const saved = localStorage.getItem('basira_analysis');
    return saved ? JSON.parse(saved).forecast_data : [];
  });

  const [historicalData] = useState(() => {
    const saved = localStorage.getItem('basira_analysis');
    return saved ? JSON.parse(saved).historical_data : [];
  });

  // كل ما تغير السلايدر نستدعي API whatif
  useEffect(() => {
    if (originalForecast.length === 0) return;

    const callWhatIf = async () => {
      try {
        const response = await fetch(`${API_URL}/api/whatif`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection_rate: collectionRate,
            forecast_data: originalForecast,
          }),
        });
        const data = await response.json();
        setForecastData(data.adjusted_forecast);
        setAlertColor(data.color);
        setRiskProb(data.risk_probability);
      } catch (e) {
        // لو فشل الاتصال نستخدم البيانات الأصلية
        setForecastData(originalForecast);
      }
    };

    callWhatIf();
  }, [collectionRate, originalForecast]);

  const runwayColor = alertColor === 'green' ? '#10b981'
    : alertColor === 'yellow' ? '#f59e0b' : '#ef4444';

  const riskLevel = {
    ar: alertColor === 'green' ? 'منخفض' : alertColor === 'yellow' ? 'متوسط' : 'مرتفع',
    en: alertColor === 'green' ? 'Low' : alertColor === 'yellow' ? 'Medium' : 'High',
    color: runwayColor,
  };

  const statusPillText = {
    ar: alertColor === 'green' ? 'آمن' : alertColor === 'yellow' ? 'تحذير' : 'حرج',
    en: alertColor === 'green' ? 'Safe' : alertColor === 'yellow' ? 'Warning' : 'Critical',
  };

  const cashDelta = useMemo(() => Math.round((collectionRate - 50) * 3200), [collectionRate]);

  const runway = useMemo(() => {
    if (alertColor === 'green') return Math.round(30 + (collectionRate - 65) * 0.75);
    if (alertColor === 'yellow') return Math.round(10 + (collectionRate - 40) * 0.8);
    return Math.max(1, Math.round(collectionRate * 0.25));
  }, [alertColor, collectionRate]);

  return (
    <div className="fade-in">
      <WhatIfSlider value={collectionRate} onChange={setCollectionRate} />

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">
        {/* Runway */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${runwayColor}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: runwayColor }}>
              <Clock size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'المدرج التشغيلي (٣٠ يوم)' : '30-Day Runway'}
          </p>
          <p className="sim-feedback-card__value !text-lg" style={{ color: runwayColor }}>
            {runway} {isArabic ? 'يوم' : 'days'}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic ? 'المدة المتوقعة قبل نفاد السيولة' : 'Estimated time before liquidity runs out'}
          </p>
        </div>

        {/* Cash Delta */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: cashDelta >= 0 ? '#10b98118' : '#ef444418', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cashDelta >= 0 ? '#10b981' : '#ef4444' }}>
              <TrendingUp size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'تأثير التدفق النقدي' : 'Cash Position Impact'}
          </p>
          <p className="sim-feedback-card__value !text-lg" style={{ color: cashDelta >= 0 ? '#10b981' : '#ef4444' }}>
            {cashDelta >= 0 ? '+' : ''}
            {isArabic ? `${cashDelta.toLocaleString('ar-SA')} ﷼` : `${cashDelta.toLocaleString()} SAR`}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic ? 'الفارق المتوقع في الرصيد التشغيلي' : 'Projected change in operational balance'}
          </p>
        </div>

        {/* Risk Level */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${riskLevel.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: riskLevel.color }}>
              <ShieldAlert size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'مستوى المخاطر' : 'Risk Level'}
          </p>
          <p className="sim-feedback-card__value !text-lg" style={{ color: riskLevel.color }}>
            {isArabic ? riskLevel.ar : riskLevel.en}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic ? `احتمالية الخطر: ${riskProb}%` : `Risk probability: ${riskProb}%`}
          </p>
        </div>

        {/* Status */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${riskLevel.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: riskLevel.color }}>
              <Activity size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'حالة السيولة' : 'Liquidity Status'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0' }}>
            <span className="status-pill" style={{ background: `${riskLevel.color}18`, color: riskLevel.color, padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
              <span className="status-pill__dot" style={{ background: riskLevel.color, width: '5px', height: '5px' }} />
              {isArabic ? statusPillText.ar : statusPillText.en}
            </span>
          </div>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1" style={{ fontWeight: 500, color: 'var(--color-basira-text)', lineHeight: '1.4' }}>
            {isArabic
              ? alertColor === 'green' ? 'السيولة في مستوى مستقر وآمن'
                : alertColor === 'yellow' ? 'انخفاض ملحوظ في مستوى السيولة'
                : 'مستوى حرج — تدخل فوري مطلوب'
              : alertColor === 'green' ? 'Liquidity is at a stable, safe level'
                : alertColor === 'yellow' ? 'Noticeable decline in liquidity level'
                : 'Critical level — immediate action required'}
          </p>
        </div>
      </div>

      <div className="h-8 w-full shrink-0"></div>

      <CashFlowChart
        collectionRate={collectionRate}
        historicalData={historicalData}
        forecastData={forecastData.length > 0 ? forecastData : originalForecast}
      />
    </div>
  );
}