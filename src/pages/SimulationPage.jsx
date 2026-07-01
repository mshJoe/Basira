import { useState, useMemo } from 'react';
import { Clock, TrendingUp, ShieldAlert } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import WhatIfSlider from '../components/WhatIfSlider';
import CashFlowChart from '../components/CashFlowChart';
import AlertBadge from '../components/AlertBadge';

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
 * SimulationPage — Interactive liquidity simulation with slider,
 * instant feedback cards, chart, and alert badge.
 */
export default function SimulationPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [collectionRate, setCollectionRate] = useState(50);
  const alert = useMemo(() => deriveAlertFromRate(collectionRate), [collectionRate]);

  /* ─── Derived metrics ─── */
  const runway = alert.days;
  const cashDelta = useMemo(() => {
    const base = (collectionRate - 50) * 3200;
    return Math.round(base);
  }, [collectionRate]);

  const riskLevel = useMemo(() => {
    if (alert.level === 'green') return { ar: 'منخفض', en: 'Low', color: '#10b981' };
    if (alert.level === 'yellow') return { ar: 'متوسط', en: 'Medium', color: '#f59e0b' };
    return { ar: 'مرتفع', en: 'High', color: '#ef4444' };
  }, [alert.level]);

  const runwayColor =
    alert.level === 'green' ? '#10b981' : alert.level === 'yellow' ? '#f59e0b' : '#ef4444';

  return (
    <div className="fade-in">
      {/* Slider */}
      <WhatIfSlider value={collectionRate} onChange={setCollectionRate} />

      {/* Instant Feedback Cards */}
      <div className="sim-feedback-grid">
        {/* Runway */}
        <div className="sim-feedback-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${runwayColor}1a`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: runwayColor,
              }}
            >
              <Clock size={18} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label">
            {isArabic ? 'المدرج التشغيلي (٣٠ يوم)' : '30-Day Runway'}
          </p>
          <p className="sim-feedback-card__value" style={{ color: runwayColor }}>
            {runway} {isArabic ? 'يوم' : 'days'}
          </p>
          <p className="sim-feedback-card__detail">
            {isArabic
              ? 'المدة المتوقعة قبل نفاد السيولة'
              : 'Estimated time before liquidity runs out'}
          </p>
        </div>

        {/* Cash Delta */}
        <div className="sim-feedback-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: cashDelta >= 0 ? '#10b98118' : '#ef444418',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cashDelta >= 0 ? '#10b981' : '#ef4444',
              }}
            >
              <TrendingUp size={18} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label">
            {isArabic ? 'تأثير التدفق النقدي' : 'Cash Position Impact'}
          </p>
          <p
            className="sim-feedback-card__value"
            style={{ color: cashDelta >= 0 ? '#10b981' : '#ef4444' }}
          >
            {cashDelta >= 0 ? '+' : ''}
            {isArabic
              ? `${cashDelta.toLocaleString('ar-SA')} ﷼`
              : `${cashDelta.toLocaleString()} SAR`}
          </p>
          <p className="sim-feedback-card__detail">
            {isArabic
              ? 'الفارق المتوقع في الرصيد التشغيلي'
              : 'Projected change in operational balance'}
          </p>
        </div>

        {/* Risk Level */}
        <div className="sim-feedback-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${riskLevel.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: riskLevel.color,
              }}
            >
              <ShieldAlert size={18} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label">
            {isArabic ? 'مستوى المخاطر' : 'Risk Level'}
          </p>
          <p className="sim-feedback-card__value" style={{ color: riskLevel.color }}>
            {isArabic ? riskLevel.ar : riskLevel.en}
          </p>
          <p className="sim-feedback-card__detail">
            {isArabic
              ? 'تقييم مخاطر السيولة الحالية'
              : 'Current liquidity risk assessment'}
          </p>
        </div>
      </div>

      {/* Alert Badge */}
      <div className="alerts-row">
        <AlertBadge level={alert.level} daysRemaining={alert.days} />
      </div>

      {/* Predictive Chart */}
      <CashFlowChart collectionRate={collectionRate} />
    </div>
  );
}
