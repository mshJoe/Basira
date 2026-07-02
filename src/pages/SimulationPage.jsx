import { useState, useMemo } from 'react';
import { Clock, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import WhatIfSlider from '../components/WhatIfSlider';
import CashFlowChart from '../components/CashFlowChart';

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

  const statusPillText = useMemo(() => {
    if (alert.level === 'green') return { ar: 'آمن', en: 'Safe' };
    if (alert.level === 'yellow') return { ar: 'تحذير', en: 'Warning' };
    return { ar: 'حرج', en: 'Critical' };
  }, [alert.level]);

  return (
    <div className="fade-in">
      {/* Slider */}
      <WhatIfSlider value={collectionRate} onChange={setCollectionRate} />

      {/* Instant Feedback Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">
        {/* Runway */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${runwayColor}1a`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: runwayColor,
              }}
            >
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
            {isArabic
              ? 'المدة المتوقعة قبل نفاد السيولة'
              : 'Estimated time before liquidity runs out'}
          </p>
        </div>

        {/* Cash Delta */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: cashDelta >= 0 ? '#10b98118' : '#ef444418',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cashDelta >= 0 ? '#10b981' : '#ef4444',
              }}
            >
              <TrendingUp size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'تأثير التدفق النقدي' : 'Cash Position Impact'}
          </p>
          <p
            className="sim-feedback-card__value !text-lg"
            style={{ color: cashDelta >= 0 ? '#10b981' : '#ef4444' }}
          >
            {cashDelta >= 0 ? '+' : ''}
            {isArabic
              ? `${cashDelta.toLocaleString('ar-SA').replace(/٬/g, ',')} ﷼`
              : `${cashDelta.toLocaleString()} SAR`}
          </p>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1">
            {isArabic
              ? 'الفارق المتوقع في الرصيد التشغيلي'
              : 'Projected change in operational balance'}
          </p>
        </div>

        {/* Risk Level */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${riskLevel.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: riskLevel.color,
              }}
            >
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
            {isArabic
              ? 'تقييم مخاطر السيولة الحالية'
              : 'Current liquidity risk assessment'}
          </p>
        </div>
        {/* Status Description (4th Card) */}
        <div className="sim-feedback-card !p-3">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${riskLevel.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: riskLevel.color,
              }}
            >
              <Activity size={16} strokeWidth={1.8} />
            </div>
          </div>
          <p className="sim-feedback-card__label !text-[0.7rem] !mb-1">
            {isArabic ? 'حالة السيولة' : 'Liquidity Status'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0' }}>
            <span
              className="status-pill"
              style={{
                background: `${riskLevel.color}18`,
                color: riskLevel.color,
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem'
              }}
            >
              <span className="status-pill__dot" style={{ background: riskLevel.color, width: '5px', height: '5px' }} />
              {isArabic ? statusPillText.ar : statusPillText.en}
            </span>
          </div>
          <p className="sim-feedback-card__detail !text-[0.65rem] !mt-1" style={{ fontWeight: 500, color: 'var(--color-basira-text)', lineHeight: '1.4' }}>
            {isArabic 
              ? alert.level === 'green' ? 'السيولة في مستوى مستقر وآمن' : alert.level === 'yellow' ? 'انخفاض ملحوظ في مستوى السيولة' : 'مستوى حرج — تدخل فوري مطلوب'
              : alert.level === 'green' ? 'Liquidity is at a stable, safe level' : alert.level === 'yellow' ? 'Noticeable decline in liquidity level' : 'Critical level — immediate action required'}
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-8 w-full shrink-0"></div>

      {/* Predictive Chart */}
      <CashFlowChart collectionRate={collectionRate} />
    </div>
  );
}
