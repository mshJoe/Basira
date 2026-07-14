import { useState } from 'react';
import { Sun, Moon, User, Bell } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import Sidebar, { SidebarMobileToggle } from './Sidebar';
import logoWhite from '../assets/Basira logo white.png';
import logoBlue from '../assets/Basira logo blue.png';
import logoWhiteEng from '../assets/Basira logo white eng.png';
import logoBlueEng from '../assets/Basira logo blue eng.png';

/* ─── Pages ─── */
import DashboardPage from '../pages/DashboardPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import FileUploadPage from '../pages/FileUploadPage';
import SimulationPage from '../pages/SimulationPage';
import AIChatPage from '../pages/AIChatPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';

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
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
        return <AnalyticsPage />;
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

  const isFullScreenPage = activePage === 'login' || activePage === 'signup';

  if (isFullScreenPage) {
    return (
      <div className="bg-slate-50 dark:bg-[#0B0F19]">
        {activePage === 'login' ? <LoginPage onNavigate={setActivePage} /> : <SignupPage onNavigate={setActivePage} />}
      </div>
    );
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
            {/* Notification Bell Button */}
            <button
              className="toggle-btn w-[38px] h-[38px] relative flex items-center justify-center border border-gray-200/50 dark:border-slate-800 rounded-2xl bg-transparent hover:bg-gray-50 dark:hover:bg-[#1B2836] transition-all cursor-pointer text-gray-700 dark:text-gray-200"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label={isArabic ? 'التنبيهات' : 'Notifications'}
              title={isArabic ? 'التنبيهات' : 'Notifications'}
            >
              <Bell size={18} strokeWidth={1.8} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm z-10">1</span>
            </button>

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

            {/* User Profile Button */}
            <button
              className="toggle-btn w-[38px] h-[38px]"
              onClick={() => setActivePage('login')}
              aria-label={isArabic ? 'حساب المستخدم' : 'User Profile'}
              title={isArabic ? 'حساب المستخدم' : 'User Profile'}
            >
              <span className="flex items-center justify-center">
                <User size={18} strokeWidth={1.8} />
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

      {/* Notifications Sidebar Overlay */}
      <div className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-50 transition-opacity duration-300 ${isNotifOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsNotifOpen(false)}>
        <div className={`fixed top-0 right-0 h-full w-[340px] bg-white dark:bg-[#131E2C] shadow-2xl p-6 transition-transform duration-300 z-50 ${isNotifOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">التنبيهات</h3>
            <button className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all cursor-pointer" onClick={() => setIsNotifOpen(false)}>✕</button>
          </div>
          {/* Sidebar Content */}
          <div className="overflow-y-auto flex-1 max-h-[calc(100vh-120px)] pr-1 space-y-4">
            <div className="bg-red-50/40 dark:bg-red-950/10 border border-red-100/60 dark:border-red-900/20 rounded-2xl p-5 relative overflow-hidden shadow-sm before:absolute before:top-0 before:right-0 before:w-1.5 before:h-full before:bg-red-500">
              <span className="text-red-600 dark:text-red-400 font-bold text-[13.5px] mb-2 block">تنبيه سيولة حرج</span>
              <p className="text-gray-600 dark:text-gray-300 text-[12px] leading-relaxed">سيولتك تكفي 3 يوماً فقط قبل دخول الرصيد للمنطقة السالبة إذا استمر الوضع الحالي.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
