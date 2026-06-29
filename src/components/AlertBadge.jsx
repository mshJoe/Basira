import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Bilingual strings
   ═══════════════════════════════════════════════════════ */
const TEXT = {
  ar: {
    daysLeft: 'يوم متبقي',
    day: 'يوم',
    levels: {
      green:  { label: 'آمن',    description: 'السيولة في مستوى مستقر وآمن' },
      yellow: { label: 'تحذير',  description: 'انخفاض ملحوظ في مستوى السيولة' },
      red:    { label: 'حرج',    description: 'مستوى حرج — تدخل فوري مطلوب' },
    },
    severity: 'الحالة',
  },
  en: {
    daysLeft: 'days left',
    day: 'day',
    levels: {
      green:  { label: 'Safe',     description: 'Liquidity is at a stable, safe level' },
      yellow: { label: 'Warning',  description: 'Noticeable decline in liquidity level' },
      red:    { label: 'Critical', description: 'Critical level — immediate action required' },
    },
    severity: 'Severity',
  },
};

/* ═══════════════════════════════════════════════════════
   Colour mapping per alert level
   ═══════════════════════════════════════════════════════ */
const LEVEL_COLORS = {
  green: {
    ring: '#10b981',
    bg:   'rgba(16, 185, 129, 0.08)',
    glow: 'rgba(16, 185, 129, 0.25)',
    pillBg: 'rgba(16, 185, 129, 0.12)',
    pillText: '#10b981',
  },
  yellow: {
    ring: '#f59e0b',
    bg:   'rgba(245, 158, 11, 0.08)',
    glow: 'rgba(245, 158, 11, 0.25)',
    pillBg: 'rgba(245, 158, 11, 0.12)',
    pillText: '#f59e0b',
  },
  red: {
    ring: '#ef4444',
    bg:   'rgba(239, 68, 68, 0.08)',
    glow: 'rgba(239, 68, 68, 0.25)',
    pillBg: 'rgba(239, 68, 68, 0.12)',
    pillText: '#ef4444',
  },
};

/**
 * AlertBadge — displays a prominent circular alert indicator
 * with a days-remaining countdown and severity pill.
 *
 * @param {Object}  props
 * @param {'green'|'yellow'|'red'} props.level  — alert severity
 * @param {number}  props.daysRemaining         — countdown days
 */
export default function AlertBadge({ level = 'green', daysRemaining = 45 }) {
  const { lang } = useThemeLang();
  const t = TEXT[lang];
  const clr = LEVEL_COLORS[level];
  const info = t.levels[level];

  return (
    <div className="alert-badge" style={{ background: clr.bg }}>
      {/* ─── Circular indicator ─── */}
      <div className="alert-badge__ring-wrap">
        <div
          className="alert-badge__ring"
          style={{
            borderColor: clr.ring,
            boxShadow: `0 0 18px ${clr.glow}, inset 0 0 8px ${clr.glow}`,
          }}
        >
          <span className="alert-badge__days" style={{ color: clr.ring }}>
            {daysRemaining}
          </span>
        </div>
        <span className="alert-badge__days-label">
          {daysRemaining === 1 ? t.day : t.daysLeft}
        </span>
      </div>

      {/* ─── Text content ─── */}
      <div className="alert-badge__body">
        <div className="alert-badge__header">
          <h3 className="alert-badge__title">{info.description}</h3>
        </div>
        <div className="alert-badge__pills">
          {/* Severity pill */}
          <span
            className="pill"
            style={{ background: clr.pillBg, color: clr.pillText }}
          >
            <span
              className="pill__dot"
              style={{ background: clr.ring }}
            />
            {info.label}
          </span>
          {/* Countdown pill */}
          <span className="pill pill--muted">
            {daysRemaining} {daysRemaining === 1 ? t.day : t.daysLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
