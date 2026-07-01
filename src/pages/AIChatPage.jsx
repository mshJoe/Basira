import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Demo Conversation Messages
   ═══════════════════════════════════════════════════════ */
const DEMO_MESSAGES = {
  ar: [
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'مرحباً! أنا بصيرة، مساعدك الذكي لإدارة السيولة المالية. كيف أستطيع مساعدتك اليوم؟',
    },
    {
      sender: 'أنت',
      type: 'user',
      text: 'ما هي حالة السيولة الحالية لشركتي؟',
    },
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'بناءً على تحليل بياناتك المالية:\n\n📊 **الرصيد التشغيلي الحالي**: ٣,٢٠٠ ﷼\n⏰ **المدرج التشغيلي**: ١٠ أيام\n⚠️ **مستوى المخاطر**: متوسط\n\nأنصحك بتحصيل المستحقات المتأخرة من العميل الرئيسي خلال هذا الأسبوع لتحسين وضع السيولة بنسبة ١٥٪.',
    },
    {
      sender: 'أنت',
      type: 'user',
      text: 'ما هي أهم المخاطر المتوقعة الشهر القادم؟',
    },
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'تحليل المخاطر للشهر القادم:\n\n🔴 **إيجار المقر** — مستحق خلال ١٤ يوم (٤٥,٠٠٠ ﷼)\n🟡 **رواتب الموظفين** — مستحق خلال ٢٥ يوم (١٢٠,٠٠٠ ﷼)\n🟢 **فاتورة الاتصالات** — مستحق خلال ٣٠ يوم (٣,٥٠٠ ﷼)\n\nأقترح تأجيل المصروفات غير الضرورية وتسريع عملية التحصيل.',
    },
  ],
  en: [
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'Hello! I\'m Basira, your AI-powered liquidity management assistant. How can I help you today?',
    },
    {
      sender: 'You',
      type: 'user',
      text: 'What\'s the current liquidity status of my company?',
    },
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'Based on your financial data analysis:\n\n📊 **Current Operational Balance**: 3,200 SAR\n⏰ **Operational Runway**: 10 days\n⚠️ **Risk Level**: Moderate\n\nI recommend collecting overdue receivables from the key client this week to improve liquidity by 15%.',
    },
    {
      sender: 'You',
      type: 'user',
      text: 'What are the main risks for next month?',
    },
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'Risk analysis for next month:\n\n🔴 **Office Rent** — Due in 14 days (45,000 SAR)\n🟡 **Employee Salaries** — Due in 25 days (120,000 SAR)\n🟢 **Telecom Bill** — Due in 30 days (3,500 SAR)\n\nI suggest deferring non-essential expenses and accelerating collections.',
    },
  ],
};

/**
 * Simple markdown-like bold renderer for chat bubbles.
 */
function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle newlines
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

/**
 * AIChatPage — Demo AI chat interface with BasiraAI.
 */
export default function AIChatPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';
  const [inputValue, setInputValue] = useState('');

  const messages = DEMO_MESSAGES[lang] || DEMO_MESSAGES.ar;

  return (
    <div className="fade-in">
      {/* Welcome header */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8b5cf6',
          }}
        >
          <Sparkles size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {isArabic ? 'المساعد الذكي بصيرة' : 'BasiraAI Assistant'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-basira-text-muted)' }}>
            {isArabic
              ? 'اسأل بصيرة عن أي استفسار مالي'
              : 'Ask Basira about any financial inquiry'}
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${
                msg.type === 'ai' ? 'chat-bubble--ai' : 'chat-bubble--user'
              }`}
            >
              <p className="chat-bubble__sender">{msg.sender}</p>
              <div>{renderText(msg.text)}</div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-input-bar__input"
            placeholder={
              isArabic
                ? 'اكتب سؤالك هنا...'
                : 'Type your question here...'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setInputValue('');
              }
            }}
          />
          <button
            className="chat-input-bar__send"
            onClick={() => setInputValue('')}
            aria-label={isArabic ? 'إرسال' : 'Send'}
          >
            <Send size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
