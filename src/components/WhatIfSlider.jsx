import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Bilingual strings
   ═══════════════════════════════════════════════════════ */
const TEXT = {
  ar: {
    title: 'محاكاة معدل التحصيل',
    subtitle: 'اسحب المؤشر لرؤية تأثير التغيير على التوقعات والتنبيهات',
    label: 'معدل التحصيل',
    low: 'منخفض',
    high: 'مرتفع',
  },
  en: {
    title: 'Collection Rate Simulation',
    subtitle: 'Drag the slider to see how changes affect forecasts and alerts',
    label: 'Collection Rate',
    low: 'Low',
    high: 'High',
  },
};

/**
 * WhatIfSlider — adjusts a collection rate percentage.
 * Drives AlertBadge severity + CashFlowChart forecast reactively.
 *
 * @param {number}   value     — current collection rate (0-100)
 * @param {function} onChange  — callback with new value
 */
export default function WhatIfSlider({ value = 50, onChange }) {
  const { lang } = useThemeLang();
  const t = TEXT[lang];

  // Derive accent colour from value for the filled track + thumb glow
  const accentColor =
    value >= 65
      ? 'var(--clr-success)'
      : value >= 40
        ? '#f59e0b'
        : '#ef4444';

  // Percentage for the filled portion of the track
  const pct = `${value}%`;

  return (
    <div className="whatif-slider">
      {/* Header */}
      <div className="whatif-slider__header">
        <div>
          <h2 className="whatif-slider__title">{t.title}</h2>
          <p className="whatif-slider__subtitle">{t.subtitle}</p>
        </div>
        {/* Value badge */}
        <div className="whatif-slider__value-badge" style={{ color: accentColor }}>
          {value}%
        </div>
      </div>

      {/* Slider track */}
      <div className="whatif-slider__track-wrap">
        <span className="whatif-slider__bound">{t.low}</span>

        <div className="whatif-slider__track-container">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className="whatif-slider__input"
            style={{
              '--slider-pct': pct,
              '--slider-accent': accentColor,
            }}
            aria-label={t.label}
          />
        </div>

        <span className="whatif-slider__bound">{t.high}</span>
      </div>

      {/* Label */}
      <p className="whatif-slider__label">{t.label}: <strong>{value}%</strong></p>
    </div>
  );
}
