import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Bilingual strings
   ═══════════════════════════════════════════════════════ */
const TEXT = {
  ar: {
    title: 'التدفق النقدي',
    subtitle: 'بيانات تاريخية لـ ٦ أشهر مع توقعات ٣٠ يومًا',
    historical: 'تاريخي',
    forecast: 'متوقع',
    amount: 'المبلغ',
    date: 'التاريخ',
    currency: 'ر.س',
    todayLabel: 'اليوم',
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
  },
  en: {
    title: 'Cash Flow',
    subtitle: '6-month historical data with 30-day forecast',
    historical: 'Historical',
    forecast: 'Forecast',
    amount: 'Amount',
    date: 'Date',
    currency: 'SAR',
    todayLabel: 'Today',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  },
};

/* ═══════════════════════════════════════════════════════
   Theme-aware colour palette
   ═══════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    grid: 'rgba(255,255,255,0.05)',
    axis: '#7a7f9d',
    tooltipBg: '#1c1d2a',
    tooltipBorder: 'rgba(255,255,255,0.08)',
    tooltipText: '#e4e5f1',
    referenceLine: 'rgba(255,255,255,0.15)',
    historicalLine: '#60a5fa',
    historicalGlow: 'rgba(96,165,250,0.3)',
    forecastLine: '#f87171',
    forecastGlow: 'rgba(248,113,113,0.25)',
  },
  light: {
    grid: 'rgba(0,0,0,0.05)',
    axis: '#6b7194',
    tooltipBg: '#ffffff',
    tooltipBorder: 'rgba(0,0,0,0.08)',
    tooltipText: '#1a1d2e',
    referenceLine: 'rgba(0,0,0,0.12)',
    historicalLine: '#3b82f6',
    historicalGlow: 'rgba(59,130,246,0.25)',
    forecastLine: '#ef4444',
    forecastGlow: 'rgba(239,68,68,0.2)',
  },
};

/* ═══════════════════════════════════════════════════════
   Seed-based pseudo-random (deterministic per language)
   ═══════════════════════════════════════════════════════ */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/* ═══════════════════════════════════════════════════════
   Generate mock data — stable across re-renders
   Forecast values scale with collectionRate.
   ═══════════════════════════════════════════════════════ */
function generateMockData(lang, collectionRate) {
  const t = TEXT[lang];
  const data = [];
  const rand = seededRandom(lang === 'ar' ? 42 : 99);

  // 6 months of historical (≈ one point per week = ~26 points)
  const historicalWeeks = 26;
  let value = 420000;

  for (let i = 0; i < historicalWeeks; i++) {
    const monthIdx = Math.floor((i / historicalWeeks) * 6);
    const weekInMonth = (i % 4) + 1;
    const label = `${t.months[monthIdx]} W${weekInMonth}`;

    // Simulate organic cash-flow fluctuations
    const trend = 1800;
    const noise = (rand() - 0.45) * 30000;
    const seasonal = Math.sin(i * 0.5) * 12000;
    value = Math.max(350000, value + trend + noise + seasonal);

    data.push({
      name: label,
      historical: Math.round(value),
      forecast: null,
    });
  }

  // Bridge point — last historical point is also first forecast point
  const bridgeValue = data[data.length - 1].historical;
  data[data.length - 1].forecast = bridgeValue;

  // 30-day forecast (≈ 4 weekly points)
  // The collectionRate (0-100) scales the forecast trend:
  //   rate=50 → baseline,  rate=100 → strong growth,  rate=0 → decline
  const rateMultiplier = (collectionRate - 50) / 50; // -1 to +1
  const forecastWeeks = 4;
  let fValue = bridgeValue;

  for (let i = 1; i <= forecastWeeks; i++) {
    const label = `${t.months[6]} W${i}`;
    // Base trend amplified/dampened by collection rate
    const baseTrend = 2500;
    const rateTrend = rateMultiplier * 15000 * (i / forecastWeeks);
    const noise = (rand() - 0.5) * 8000;
    fValue = fValue + baseTrend + rateTrend + noise;

    data.push({
      name: label,
      historical: null,
      forecast: Math.round(fValue),
    });
  }

  return data;
}

/* ═══════════════════════════════════════════════════════
   Custom Tooltip
   ═══════════════════════════════════════════════════════ */
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
            <span
              className="chart-tooltip__dot"
              style={{ background: isHistorical ? colors.historicalLine : colors.forecastLine }}
            />
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

/* ═══════════════════════════════════════════════════════
   CashFlowChart Component
   ═══════════════════════════════════════════════════════ */
export default function CashFlowChart({ collectionRate = 50 }) {
  const { theme, lang } = useThemeLang();
  const t = TEXT[lang];
  const colors = THEMES[theme];

  // Re-generate data when language or collectionRate changes
  const data = useMemo(
    () => generateMockData(lang, collectionRate),
    [lang, collectionRate],
  );

  // Find the bridge index (where forecast begins)
  const bridgeIndex = data.findIndex((d) => d.forecast !== null);

  return (
    <div className="chart-section">
      {/* Header */}
      <div className="chart-header">
        <div>
          <h2 className="chart-header__title">{t.title}</h2>
          <p className="chart-header__subtitle">{t.subtitle}</p>
        </div>
        {/* Legend pills */}
        <div className="chart-legend-pills">
          <span className="chart-legend-pill">
            <span className="chart-legend-pill__line" style={{ background: colors.historicalLine }} />
            {t.historical}
          </span>
          <span className="chart-legend-pill">
            <span
              className="chart-legend-pill__line chart-legend-pill__line--dashed"
              style={{ background: colors.forecastLine }}
            />
            {t.forecast}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart
            data={data}
            margin={{ top: 12, right: 24, left: 8, bottom: 4 }}
          >
            <defs>
              <filter id="glow-hist">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-forecast">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.grid}
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{ fill: colors.axis, fontSize: 11 }}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
              dy={8}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fill: colors.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dx={-4}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={48}
            />

            <Tooltip
              content={<CustomTooltip colors={colors} t={t} />}
              cursor={{ stroke: colors.referenceLine, strokeWidth: 1 }}
            />

            {/* "Today" reference line at the bridge point */}
            <ReferenceLine
              x={data[bridgeIndex]?.name}
              stroke={colors.referenceLine}
              strokeDasharray="4 4"
              label={{
                value: t.todayLabel,
                position: 'top',
                fill: colors.axis,
                fontSize: 11,
                fontWeight: 500,
              }}
            />

            {/* Historical — solid blue */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke={colors.historicalLine}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: colors.historicalLine,
                stroke: colors.tooltipBg,
                strokeWidth: 2,
              }}
              connectNulls={false}
              filter="url(#glow-hist)"
              isAnimationActive={false}
            />

            {/* Forecast — dashed red */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={colors.forecastLine}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{
                r: 4,
                fill: colors.forecastLine,
                stroke: colors.tooltipBg,
                strokeWidth: 2,
              }}
              connectNulls={false}
              filter="url(#glow-forecast)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
