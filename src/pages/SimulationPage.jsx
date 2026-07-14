import { useState, useMemo, useEffect } from 'react';
import { Clock, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import WhatIfSlider from '../components/WhatIfSlider';
import CashFlowChart from '../components/CashFlowChart';

const API_URL = 'https://9208-2001-16a4-428-478f-608c-aead-f4f0-ba95.ngrok-free.app';

export default function SimulationPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [collectionRate, setCollectionRate] = useState(50);
  const [simulationData, setSimulationData] = useState({
    adjusted_forecast: [],
    color: 'yellow',
    risk_probability: 0,
  });

  const [originalForecast] = useState(() => {
    const saved = localStorage.getItem('basira_analysis');
    return saved ? JSON.parse(saved).forecast_data : [];
  });

  const [historicalData] = useState(() => {
    const saved = localStorage.getItem('basira_analysis');
    return saved ? JSON.parse(saved).historical_data : [];
  });

  /* ── Backend call: numbers only ── */
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
            lang: lang,
          }),
        });
        const data = await response.json();
        setSimulationData({
          adjusted_forecast: data.adjusted_forecast || [],
          color: data.color || 'yellow',
          risk_probability: data.risk_probability || 0,
        });
      } catch (e) {
        // Keep last good state on network error
      }
    };

    callWhatIf();
  }, [collectionRate, originalForecast]);

  /* ═══════════════════════════════════════════════════════
     THEME COLOR: derived locally from slider position
     (NOT from simulationData.color)
     ═══════════════════════════════════════════════════════ */
  const activeThemeColor =
    collectionRate >= 65 ? '#10b981' :
    collectionRate >= 40 ? '#f59e0b' :
    '#ef4444';

  /* ── Risk / status labels: also derived from slider position to stay in sync ── */
  const riskLevel = {
    ar: collectionRate >= 65 ? 'منخفض' : collectionRate >= 40 ? 'متوسط' : 'مرتفع',
    en: collectionRate >= 65 ? 'Low' : collectionRate >= 40 ? 'Medium' : 'High',
  };

  const statusPillText = {
    ar: collectionRate >= 65 ? 'آمن' : collectionRate >= 40 ? 'تحذير' : 'حرج',
    en: collectionRate >= 65 ? 'Safe' : collectionRate >= 40 ? 'Warning' : 'Critical',
  };

  const statusDescription = isArabic
    ? (collectionRate >= 65 ? 'السيولة في مستوى مستقر وآمن'
      : collectionRate >= 40 ? 'انخفاض ملحوظ في مستوى السيولة'
      : 'مستوى حرج — تدخل فوري مطلوب')
    : (collectionRate >= 65 ? 'Liquidity is at a stable, safe level'
      : collectionRate >= 40 ? 'Noticeable decline in liquidity level'
      : 'Critical level — immediate action required');

  /* ═══════════════════════════════════════════════════════
     NUMBERS: derived from backend simulationData
     ═══════════════════════════════════════════════════════ */
  const forecastData = simulationData.adjusted_forecast;

  const cashDelta = useMemo(() => {
    if (!forecastData || !originalForecast || forecastData.length === 0 || originalForecast.length === 0) return 0;
    const totalAdjusted = forecastData.reduce((sum, d) => sum + d.predicted, 0);
    const totalOriginal = originalForecast.reduce((sum, d) => sum + d.predicted, 0);
    return Math.round(totalAdjusted - totalOriginal);
  }, [forecastData, originalForecast]);

  const runway = useMemo(() => {
    if (collectionRate >= 65) return Math.round(30 + (collectionRate - 65) * 0.75);
    if (collectionRate >= 40) return Math.round(10 + (collectionRate - 40) * 0.8);
    return Math.max(1, Math.round(collectionRate * 0.25));
  }, [collectionRate]);

  /* Cash Delta card — independent positive/negative color */
  const cashDeltaColor = cashDelta >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="fade-in">
      {/* Slider — driven by local activeThemeColor */}
      <WhatIfSlider
        collectionRate={collectionRate}
        onRateChange={setCollectionRate}
        activeColor={activeThemeColor}
      />

      {/* ── 4 Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">

        {/* 1 · Runway */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${activeThemeColor}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeThemeColor }}>
              <Clock size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'المدرج التشغيلي (٣٠ يوم)' : '30-Day Runway'}
          </p>
          <p className="sim-feedback-card__value !text-lg" style={{ color: activeThemeColor }}>
            {runway} {isArabic ? 'يوم' : 'days'}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic ? 'المدة المتوقعة قبل نفاد السيولة' : 'Estimated time before liquidity runs out'}
          </p>
        </div>

        {/* 2 · Cash Delta (independent +/- color) */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cashDeltaColor}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cashDeltaColor }}>
              <TrendingUp size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'تأثير التدفق النقدي' : 'Cash Position Impact'}
          </p>
          <p className="sim-feedback-card__value !text-lg" style={{ color: cashDeltaColor }}>
            {cashDelta >= 0 ? '+' : ''}
            {isArabic ? `${cashDelta.toLocaleString('ar-SA')} ﷼` : `${cashDelta.toLocaleString()} SAR`}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic ? 'الفارق المتوقع في الرصيد التشغيلي' : 'Projected change in operational balance'}
          </p>
        </div>

        {/* 3 · Risk Level */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${activeThemeColor}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeThemeColor }}>
              <ShieldAlert size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'مستوى المخاطر' : 'Risk Level'}
          </p>
          <p className="sim-feedback-card__value !text-lg" style={{ color: activeThemeColor }}>
            {isArabic ? riskLevel.ar : riskLevel.en}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic ? 'تقييم مخاطر السيولة الحالية' : 'Current liquidity risk assessment'}
          </p>
        </div>

        {/* 4 · Liquidity Status */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${activeThemeColor}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeThemeColor }}>
              <Activity size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'حالة السيولة' : 'Liquidity Status'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0' }}>
            <span className="status-pill" style={{ background: `${activeThemeColor}1a`, color: activeThemeColor, padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
              <span className="status-pill__dot" style={{ background: activeThemeColor, width: '5px', height: '5px' }} />
              {isArabic ? statusPillText.ar : statusPillText.en}
            </span>
          </div>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1" style={{ fontWeight: 500, color: 'var(--color-basira-text)', lineHeight: '1.4' }}>
            {statusDescription}
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