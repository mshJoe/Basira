import {
  Home,
  BarChart2,
  FileSpreadsheet,
  SlidersHorizontal,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Navigation Items — Bilingual
   ═══════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, labelAr: 'الصفحة الرئيسة', labelEn: 'Dashboard' },
  { id: 'analytics', icon: BarChart2, labelAr: 'الاحصائيات', labelEn: 'Analytics' },
  { id: 'upload', icon: FileSpreadsheet, labelAr: 'الربط ورفع الملفات', labelEn: 'Upload & Connect' },
  { id: 'simulation', icon: SlidersHorizontal, labelAr: 'محاكاة السيولة', labelEn: 'Simulation' },
  { id: 'chat', icon: Sparkles, labelAr: 'تحدث مع BasiraAI', labelEn: 'BasiraAI Chat' },
];

/**
 * Sidebar — Persistent right navigation (RTL layout).
 *
 * @param {string}   activePage    — current active page id
 * @param {function} onNavigate    — callback when nav item is clicked
 * @param {boolean}  isOpen        — mobile sidebar open state
 * @param {function} onClose       — close callback for mobile
 * @param {string}   logoSrc       — logo image source
 */
export default function Sidebar({ activePage, onNavigate, isOpen, onClose, logoSrc }) {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar__overlay ${isOpen ? 'sidebar__overlay--visible' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          {logoSrc && (
            <img src={logoSrc} alt="Basira Logo" className="sidebar__logo-img" />
          )}
          <span className="sidebar__logo-text">
            {isArabic ? 'نظام الإنذار المبكر' : 'Early Warning System'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.6}
                  className="sidebar__nav-icon"
                />
                <span>{isArabic ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <p className="sidebar__footer-text">
            {isArabic
              ? '© ٢٠٢٦ بصيرة — جميع الحقوق محفوظة'
              : '© 2026 Basira — All Rights Reserved'}
          </p>
        </div>
      </aside>
    </>
  );
}

/**
 * Mobile toggle button for the sidebar.
 */
export function SidebarMobileToggle({ isOpen, onToggle }) {
  return (
    <button
      className="sidebar__mobile-toggle"
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
    </button>
  );
}
