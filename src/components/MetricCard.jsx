/**
 * MetricCard — Premium glassmorphic KPI card with accent top border.
 *
 * @param {string}             title       — Card title (e.g. "حالة السيولة")
 * @param {string|ReactNode}   value       — Large display value
 * @param {string}             subtitle    — Secondary info text
 * @param {React.ElementType}  icon        — lucide-react icon component
 * @param {string}             accentColor — CSS color for accent (top border + icon bg)
 * @param {'up'|'down'|null}   trend       — Optional trend direction
 * @param {string}             trendValue  — Trend display value (e.g. "+12%")
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#3B82F6',
  trend = null,
  trendValue = '',
}) {
  // Build accent background color (10% opacity version)
  const accentBg = `${accentColor}1a`; // hex + 1a ≈ 10%

  return (
    <div
      className="metric-card"
      style={{ '--metric-accent': accentColor, '--metric-accent-bg': accentBg }}
    >
      <div className="metric-card__header">
        <span className="metric-card__title">{title}</span>
        {Icon && (
          <div
            className="metric-card__icon-wrap"
            style={{
              background: accentBg,
              color: accentColor,
            }}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <div className="metric-card__value">{value}</div>

      <div className="metric-card__subtitle">
        {trend && (
          <span
            className={`metric-card__trend ${
              trend === 'up' ? 'metric-card__trend--up' : 'metric-card__trend--down'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
}
