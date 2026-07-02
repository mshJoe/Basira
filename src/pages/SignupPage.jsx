import React from 'react';
import { useThemeLang } from '../context/ThemeLangProvider';
import logoBlue from '../assets/Basira logo blue.png';
import logoWhite from '../assets/Basira logo white.png';

export default function SignupPage({ onNavigate }) {
  const { theme } = useThemeLang();
  const isDark = theme === 'dark';
  const logoSrc = isDark ? logoWhite : logoBlue;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-4 font-sans" dir="rtl">
      {/* Main Card */}
      <div className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-[#131825] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-8">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* LOGO CONTAINER: Must be large */}
          <div className="w-16 h-16 flex items-center justify-center bg-transparent mb-2">
             <img src={logoSrc} alt="Basira Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إنشاء حساب جديد</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">أنشئ حسابك للبدء في استخدام بصيرة</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5 w-full">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">الاسم الكامل</label>
            <input 
              type="text" 
              placeholder="أدخل اسمك الكامل" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">البريد الإلكتروني</label>
            <input 
              type="email" 
              placeholder="أدخل بريدك الإلكتروني" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">كلمة المرور</label>
            <input 
              type="password" 
              placeholder="أدخل كلمة المرور" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="button" 
            onClick={() => onNavigate('dashboard')}
            className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            إنشاء الحساب
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
          لديك حساب بالفعل؟ <button onClick={() => onNavigate('login')} className="text-blue-500 hover:underline font-bold mr-1 transition-colors">تسجيل الدخول</button>
        </div>
      </div>
    </div>
  );
}
