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

/* ═══════════════════════════════════════════════════════
   Static color map — avoids dynamic class interpolation.
   Each zone maps to a concrete hex that is guaranteed visible
   in both dark and light modes.
   ═══════════════════════════════════════════════════════ */
const ZONE_COLORS = {
  safe:    '#10b981', // emerald-500 — bright green, visible on dark bg
  warning: '#f59e0b', // amber-500
  danger:  '#ef4444', // red-500
};

function getZone(value) {
  if (value >= 65) return 'safe';
  if (value >= 40) return 'warning';
  return 'danger';
}

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

  const zone = getZone(value);
  const accentColor = ZONE_COLORS[zone];
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
