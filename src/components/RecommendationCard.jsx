import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Bilingual strings
   ═══════════════════════════════════════════════════════ */
const TEXT = {
  ar: {
    sectionTitle: 'توصيات بصيرة',
    sectionSubtitle: 'إجراءات مقترحة بناءً على تحليل البيانات',
    tags: {
      highPriority: 'أولوية عالية',
      medPriority: 'أولوية متوسطة',
      automated: 'تلقائي',
      manual: 'يدوي',
      cashflow: 'تدفق نقدي',
      risk: 'إدارة مخاطر',
      saving: 'توفير',
    },
  },
  en: {
    sectionTitle: 'Basira Insights',
    sectionSubtitle: 'Suggested actions based on data analysis',
    tags: {
      highPriority: 'High Priority',
      medPriority: 'Medium Priority',
      automated: 'Automated',
      manual: 'Manual',
      cashflow: 'Cash Flow',
      risk: 'Risk Mgmt',
      saving: 'Saving',
    },
  },
};

/**
 * RecommendationCard — displays a single AI recommendation.
 *
 * @param {Object}  props
 * @param {React.ElementType} props.icon    — lucide-react icon component
 * @param {string}  props.titleAr           — Arabic title
 * @param {string}  props.titleEn           — English title
 * @param {string}  props.descriptionAr     — Arabic description
 * @param {string}  props.descriptionEn     — English description
 * @param {string[]} props.tags             — array of tag keys from TEXT.tags
 * @param {'accent'|'success'|'secondary'|'warning'} props.accentKey — colour accent
 */
export function RecommendationCard({
  icon: Icon,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  tags = [],
  accentKey = 'accent',
}) {
  const { lang } = useThemeLang();
  const t = TEXT[lang];
  const isArabic = lang === 'ar';

  const accentMap = {
    accent:    'var(--clr-accent)',
    success:   'var(--clr-success)',
    secondary: 'var(--clr-secondary)',
    warning:   '#f59e0b',
  };
  const accentBgMap = {
    accent:    'rgba(99, 102, 241, 0.1)',
    success:   'rgba(16, 185, 129, 0.1)',
    secondary: 'rgba(139, 92, 246, 0.1)',
    warning:   'rgba(245, 158, 11, 0.1)',
  };

  const accentColor = accentMap[accentKey];
  const accentBg = accentBgMap[accentKey];

  return (
    <div className="rec-card">
      {/* Icon */}
      <div
        className="rec-card__icon-wrap"
        style={{ background: accentBg, color: accentColor }}
      >
        {Icon && <Icon size={20} strokeWidth={1.8} />}
      </div>

      {/* Content */}
      <div className="rec-card__body">
        <h3 className="rec-card__title">
          {isArabic ? titleAr : titleEn}
        </h3>
        <p className="rec-card__desc">
          {isArabic ? descriptionAr : descriptionEn}
        </p>

        {/* Pill-style tags */}
        {tags.length > 0 && (
          <div className="rec-card__tags">
            {tags.map((tagKey) => (
              <span className="pill pill--muted pill--sm" key={tagKey}>
                {t.tags[tagKey] || tagKey}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * RecommendationSection — renders the section header + a list of cards.
 * Used as a convenience wrapper in the Dashboard.
 */
export function RecommendationSection({ recommendations }) {
  const { lang } = useThemeLang();
  const t = TEXT[lang];

  return (
    <div className="rec-section">
      <div className="rec-section__header">
        <h2 className="rec-section__title">{t.sectionTitle}</h2>
        <p className="rec-section__subtitle">{t.sectionSubtitle}</p>
      </div>
      <div className="rec-section__list">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={i} {...rec} />
        ))}
      </div>
    </div>
  );
}
