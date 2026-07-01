import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import Sidebar, { SidebarMobileToggle } from './Sidebar';
import logoWhite from '../assets/Basira logo white.png';
import logoBlue from '../assets/Basira logo blue.png';
import logoWhiteEng from '../assets/Basira logo white eng.png';
import logoBlueEng from '../assets/Basira logo blue eng.png';

/* ─── Pages ─── */
import DashboardPage from '../pages/DashboardPage';
import FileUploadPage from '../pages/FileUploadPage';
import SimulationPage from '../pages/SimulationPage';
import AIChatPage from '../pages/AIChatPage';

/* ═══════════════════════════════════════════════════════
   Page title/subtitle definitions
   ═══════════════════════════════════════════════════════ */
const PAGE_META = {
  dashboard: {
    titleAr: 'الصفحة الرئيسة',
    titleEn: 'Dashboard',
    subtitleAr: 'هنا ستتعرف على مختصر الأشهر الماضية مع تنبؤ لإحصائيات الأشهر ٦ القادمة',
    subtitleEn: 'Overview of recent months with AI-powered forecast for the next 6 months',
  },
  analytics: {
    titleAr: 'الاحصائيات',
    titleEn: 'Analytics',
    subtitleAr: 'تحليل معمق للتدفقات النقدية والمؤشرات المالية',
    subtitleEn: 'Deep analysis of cash flows and financial indicators',
  },
  upload: {
    titleAr: 'الربط ورفع الملفات',
    titleEn: 'Upload & Connect',
    subtitleAr: 'ارفع بياناتك المالية أو اربط أنظمتك مع بصيرة',
    subtitleEn: 'Upload your financial data or connect your systems to Basira',
  },
  simulation: {
    titleAr: 'محاكاة السيولة',
    titleEn: 'Liquidity Simulation',
    subtitleAr: 'جرّب سيناريوهات مختلفة وشاهد تأثيرها على السيولة فوراً',
    subtitleEn: 'Try different scenarios and see the immediate impact on liquidity',
  },
  chat: {
    titleAr: 'تحدث مع BasiraAI',
    titleEn: 'BasiraAI Chat',
    subtitleAr: 'اسأل المساعد الذكي عن أي استفسار مالي',
    subtitleEn: 'Ask the AI assistant about any financial inquiry',
  },
};

/**
 * AppLayout — Top-level layout with persistent sidebar and page content.
 */
export default function AppLayout() {
  const { theme, lang, toggleTheme, toggleLang } = useThemeLang();
  const isDark = theme === 'dark';
  const isArabic = lang === 'ar';

  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ─── Determine the correct logo ─── */
  const logoSrc = !isArabic
    ? isDark ? logoWhiteEng : logoBlueEng
    : isDark ? logoWhite : logoBlue;

  /* ─── Current page meta ─── */
  const meta = PAGE_META[activePage] || PAGE_META.dashboard;

  /* ─── Render the active page component ─── */
  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'analytics':
        // Analytics shares the dashboard view for now
        return <DashboardPage />;
      case 'upload':
        return <FileUploadPage />;
      case 'simulation':
        return <SimulationPage />;
      case 'chat':
        return <AIChatPage />;
      default:
        return <DashboardPage />;
    }
  }

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <SidebarMobileToggle
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logoSrc={logoSrc}
      />

      {/* Main Content Area */}
      <div className="app-layout__main">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="top-header__info">
            <h1>{isArabic ? meta.titleAr : meta.titleEn}</h1>
            <p>{isArabic ? meta.subtitleAr : meta.subtitleEn}</p>
          </div>

          <div className="top-header__controls">
            {/* Language Toggle */}
            <button
              className="toggle-btn lang-toggle"
              onClick={toggleLang}
              aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
              title={isArabic ? 'English' : 'عربي'}
            >
              <span className="lang-toggle__label">
                {isArabic ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              className="toggle-btn theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              <span className="theme-toggle__icon">
                {isDark
                  ? <Sun size={18} strokeWidth={1.8} />
                  : <Moon size={18} strokeWidth={1.8} />}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
