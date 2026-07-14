import { useThemeLang } from '../context/ThemeLangProvider';

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

export default function WhatIfSlider({ collectionRate = 50, onRateChange, activeColor }) {
  const { lang } = useThemeLang();
  const t = TEXT[lang];

  // Cross-browser RTL/LTR linear gradient logic
  const direction = lang === 'ar' ? 'to left' : 'to right';
  const trackBackground = `linear-gradient(${direction}, ${activeColor} ${collectionRate}%, #374151 ${collectionRate}%)`;

  return (
    <div className="whatif-slider">
      {/* Header */}
      <div className="whatif-slider__header">
        <div>
          <h2 className="whatif-slider__title">{t.title}</h2>
          <p className="whatif-slider__subtitle">{t.subtitle}</p>
        </div>
        {/* Value badge */}
        <div className="whatif-slider__value-badge" style={{ color: activeColor }}>
          {collectionRate}%
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
            value={collectionRate}
            onChange={(e) => onRateChange?.(Number(e.target.value))}
            className="whatif-slider__input"
            style={{
              background: trackBackground,
              '--slider-accent': activeColor,
            }}
            aria-label={t.label}
          />
        </div>

        <span className="whatif-slider__bound">{t.high}</span>
      </div>

      {/* Label */}
      <p className="whatif-slider__label">{t.label}: <strong>{collectionRate}%</strong></p>
    </div>
  );
}
