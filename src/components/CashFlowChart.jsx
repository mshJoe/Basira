import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { useThemeLang } from '../context/ThemeLangProvider';

const TEXT = {
  ar: {
    title: 'التدفق النقدي التنبؤي',
    subtitle: 'بيانات تاريخية لـ ٦ أشهر مع توقعات الأشهر القادمة',
    historical: 'تاريخي',
    forecast: 'متوقع (AI)',
    amount: 'المبلغ',
    date: 'التاريخ',
    currency: 'ر.س',
    todayLabel: 'اليوم',
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
  },
  en: {
    title: 'Predictive Cash Flow',
    subtitle: '6-month historical data with AI-powered forecast',
    historical: 'Historical',
    forecast: 'Forecast (AI)',
    amount: 'Amount',
    date: 'Date',
    currency: 'SAR',
    todayLabel: 'Today',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  },
};

const THEMES = {
  dark: {
    grid: '#1e293b', axis: '#64748b',
    tooltipBg: 'rgba(15, 23, 42, 0.95)',
    tooltipBorder: 'rgba(51, 65, 85, 0.5)',
    tooltipText: '#e2e8f0',
    referenceLine: 'rgba(148, 163, 184, 0.3)',
    historicalLine: '#3B82F6',
    historicalFillTop: 'rgba(59, 130, 246, 0.25)',
    historicalFillBottom: 'rgba(59, 130, 246, 0.0)',
    forecastLine: '#F59E0B',
    forecastFillTop: 'rgba(245, 158, 11, 0.15)',
    forecastFillBottom: 'rgba(245, 158, 11, 0.0)',
  },
  light: {
    grid: '#e2e8f0', axis: '#64748b',
    tooltipBg: 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: 'rgba(0, 0, 0, 0.08)',
    tooltipText: '#1e293b',
    referenceLine: 'rgba(100, 116, 139, 0.3)',
    historicalLine: '#2563EB',
    historicalFillTop: 'rgba(37, 99, 235, 0.15)',
    historicalFillBottom: 'rgba(37, 99, 235, 0.0)',
    forecastLine: '#D97706',
    forecastFillTop: 'rgba(217, 119, 6, 0.1)',
    forecastFillBottom: 'rgba(217, 119, 6, 0.0)',
  },
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateMockData(lang, collectionRate) {
  const t = TEXT[lang];
  const data = [];
  const rand = seededRandom(lang === 'ar' ? 42 : 99);
  const historicalWeeks = 26;
  let value = 420000;
  for (let i = 0; i < historicalWeeks; i++) {
    const monthIdx = Math.floor((i / historicalWeeks) * 6);
    const weekInMonth = (i % 4) + 1;
    const label = `${t.months[monthIdx]} W${weekInMonth}`;
    const trend = 1800;
    const noise = (rand() - 0.45) * 30000;
    const seasonal = Math.sin(i * 0.5) * 12000;
    value = Math.max(350000, value + trend + noise + seasonal);
    data.push({ name: label, historical: Math.round(value), forecast: null });
  }
  const bridgeValue = data[data.length - 1].historical;
  data[data.length - 1].forecast = bridgeValue;
  const rateMultiplier = (collectionRate - 50) / 50;
  const forecastWeeks = 4;
  let fValue = bridgeValue;
  for (let i = 1; i <= forecastWeeks; i++) {
    const label = `${t.months[6]} W${i}`;
    const baseTrend = 2500;
    const rateTrend = rateMultiplier * 15000 * (i / forecastWeeks);
    const noise = (rand() - 0.5) * 8000;
    fValue = fValue + baseTrend + rateTrend + noise;
    data.push({ name: label, historical: null, forecast: Math.round(fValue) });
  }
  return data;
}

// تحويل البيانات الحقيقية لشكل الرسم البياني
function convertRealData(historicalData, forecastData) {
  const data = [];

  // البيانات التاريخية — نأخذ كل أسبوع (كل 7 أيام)
  historicalData.forEach((point, i) => {
    if (i % 7 === 0) {
      const date = new Date(point.date);
      const month = date.toLocaleDateString('ar-SA', { month: 'short' });
      data.push({
        name: `${month} W${Math.floor(i / 7) + 1}`,
        historical: Math.round(point.cashflow),
        forecast: null,
      });
    }
  });

  // نقطة الجسر
  if (data.length > 0 && forecastData.length > 0) {
    data[data.length - 1].forecast = data[data.length - 1].historical;
  }

  // بيانات التنبؤ
  forecastData.forEach((point, i) => {
    if (i % 7 === 0) {
      const date = new Date(point.date);
      const month = date.toLocaleDateString('ar-SA', { month: 'short' });
      data.push({
        name: `${month} W${Math.floor(i / 7) + 1}`,
        historical: null,
        forecast: Math.round(point.predicted),
      });
    }
  });

  return data;
}

function CustomTooltip({ active, payload, label, colors, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip" style={{
      background: colors.tooltipBg,
      border: `1px solid ${colors.tooltipBorder}`,
      color: colors.tooltipText,
    }}>
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((entry, i) => {
        if (entry.value == null) return null;
        const isHistorical = entry.dataKey === 'historical';
        return (
          <div className="chart-tooltip__row" key={i}>
            <span className="chart-tooltip__dot" style={{
              background: isHistorical ? colors.historicalLine : colors.forecastLine,
            }} />
            <span className="chart-tooltip__key">
              {isHistorical ? t.historical : t.forecast}
            </span>
            <span className="chart-tooltip__value">
              {Number(entry.value).toLocaleString()} {t.currency}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CashFlowChart({
  collectionRate = 50,
  showForecastOnly = false,
  className = '',
  historicalData = null,
  forecastData = null,
}) {
  const { theme, lang } = useThemeLang();
  const t = TEXT[lang];
  const colors = THEMES[theme];

  // لو في بيانات حقيقية استخدمها، غير كذلك استخدم الوهمية
  const fullData = useMemo(() => {
    if (historicalData && historicalData.length > 0 && forecastData && forecastData.length > 0) {
      return convertRealData(historicalData, forecastData);
    }
    return generateMockData(lang, collectionRate);
  }, [historicalData, forecastData, lang, collectionRate]);

  const data = useMemo(() => {
    if (showForecastOnly) {
      return fullData.filter(d => d.forecast !== null).map(d => ({ ...d, historical: null }));
    }
    return fullData;
  }, [fullData, showForecastOnly]);

  const bridgeIndex = useMemo(() => fullData.findIndex((d) => d.forecast !== null), [fullData]);

  return (
    <div className={`chart-section ${className}`}>
      <div className="chart-header">
        <div>
          <h2 className="chart-header__title">{t.title}</h2>
          <p className="chart-header__subtitle">{t.subtitle}</p>
        </div>
        <div className="chart-legend-pills">
          {!showForecastOnly && (
            <span className="chart-legend-pill">
              <span className="chart-legend-pill__line" style={{ background: colors.historicalLine }} />
              {t.historical}
            </span>
          )}
          <span className="chart-legend-pill">
            <span className="chart-legend-pill__line chart-legend-pill__line--dashed" style={{ borderColor: colors.forecastLine }} />
            {t.forecast}
          </span>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data} margin={{ top: 12, right: 24, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="grad-historical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.historicalFillTop} />
                <stop offset="100%" stopColor={colors.historicalFillBottom} />
              </linearGradient>
              <linearGradient id="grad-forecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.forecastFillTop} />
                <stop offset="100%" stopColor={colors.forecastFillBottom} />
              </linearGradient>
              <filter id="glow-hist">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-forecast">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: colors.axis, fontSize: 11 }}
              axisLine={{ stroke: colors.grid }} tickLine={false} dy={8} interval="preserveStartEnd" />
            <YAxis tick={{ fill: colors.axis, fontSize: 11 }} axisLine={false} tickLine={false}
              dx={-4} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={48} />
            <Tooltip content={<CustomTooltip colors={colors} t={t} />}
              cursor={{ stroke: colors.referenceLine, strokeWidth: 1 }} />

            {!showForecastOnly && (
              <ReferenceLine x={fullData[bridgeIndex]?.name} stroke={colors.referenceLine}
                strokeDasharray="4 4"
                label={{ value: t.todayLabel, position: 'top', fill: colors.axis, fontSize: 11, fontWeight: 500 }} />
            )}

            {!showForecastOnly && (
              <Area type="monotone" dataKey="historical" stroke={colors.historicalLine}
                strokeWidth={2.5} fill="url(#grad-historical)" dot={false}
                activeDot={{ r: 5, fill: colors.historicalLine, stroke: colors.tooltipBg, strokeWidth: 2 }}
                connectNulls={false} filter="url(#glow-hist)"
                isAnimationActive={true} animationDuration={1200} />
            )}

            <Area type="monotone" dataKey="forecast" stroke={colors.forecastLine}
              strokeWidth={2.5} strokeDasharray="6 4" fill="url(#grad-forecast)" dot={false}
              activeDot={{ r: 5, fill: colors.forecastLine, stroke: colors.tooltipBg, strokeWidth: 2 }}
              connectNulls={false} filter="url(#glow-forecast)"
              isAnimationActive={true} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}