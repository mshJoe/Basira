import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';

/* ═══════════════════════════════════════════════════════
   Demo Conversation Messages (Optional mock logic)
   ═══════════════════════════════════════════════════════ */
// Keeping the original format just in case
const DEMO_MESSAGES = {
  ar: [
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'بناءً على تحليل بياناتك المالية:\n\n📊 **الرصيد التشغيلي الحالي**: ٣,٢٠٠ ﷼\n⏰ **المدرج التشغيلي**: ١٠ أيام\n⚠️ **مستوى المخاطر**: متوسط\n\nأنصحك بتحصيل المستحقات المتأخرة من العميل الرئيسي خلال هذا الأسبوع لتحسين وضع السيولة بنسبة ١٥٪.',
    }
  ],
  en: [
    {
      sender: 'BasiraAI',
      type: 'ai',
      text: 'Based on your financial data analysis:\n\n📊 **Current Operational Balance**: 3,200 SAR\n⏰ **Operational Runway**: 10 days\n⚠️ **Risk Level**: Moderate\n\nI recommend collecting overdue receivables from the key client this week to improve liquidity by 15%.',
    }
  ]
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
  
  // Start with empty messages to trigger the new Initial Empty State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    // Add User Message
    const newMsg = { sender: isArabic ? 'أنت' : 'You', type: 'user', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    // Mock an AI response after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'BasiraAI',
          type: 'ai',
          text: DEMO_MESSAGES[lang][0].text
        }
      ]);
    }, 1000);
  };

  const suggestions = isArabic 
    ? [
        "وش أول خطوة تنصحني فيها الآن؟",
        "وش أفضل قرار خلال 7 أيام القادمة؟",
        "كيف أرفع نسبة السيولة؟",
        "وش أكثر بند سبب ضغط على السيولة؟"
      ]
    : [
        "What's the first step you recommend now?",
        "What's the best decision for the next 7 days?",
        "How can I increase the liquidity ratio?",
        "Which item caused the most pressure on liquidity?"
      ];

  const renderInputBar = (isCentered = false) => (
    <div 
      className={`chat-input-bar ${isCentered ? 'w-full max-w-2xl mx-auto rounded-2xl' : ''}`}
      style={isCentered ? { border: '1px solid rgba(51, 65, 85, 0.4)', background: 'rgba(15, 23, 42, 0.4)' } : {}}
    >
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
            handleSend(inputValue);
          }
        }}
      />
      <button
        className="chat-input-bar__send"
        onClick={() => handleSend(inputValue)}
        aria-label={isArabic ? 'إرسال' : 'Send'}
      >
        <Send size={18} strokeWidth={2} />
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Welcome header - Only show in Active Chat State to maximize empty state real estate */}
      {messages.length > 0 && (
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
      )}

      {/* Chat Container */}
      <div className="chat-container">
        {messages.length === 0 ? (
          /* Initial Empty State */
          <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center fade-in">
            <div className="mb-6 rounded-full p-4 bg-slate-800/30 text-blue-400 ring-1 ring-slate-700/50">
              <Sparkles size={36} strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {isArabic ? 'كيف أستطيع مساعدتك اليوم، يوسف؟' : 'How can I help you today, Youssef?'}
            </h1>

            {/* Centered Input Bar */}
            {renderInputBar(true)}

            {/* Suggestion Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-3xl">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="px-5 py-2.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-[0.85rem] text-slate-300 hover:bg-slate-700/80 hover:border-slate-600 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat State */
          <>
            <div className="chat-messages fade-in">
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
            {/* Fixed Bottom Input Bar */}
            {renderInputBar(false)}
          </>
        )}
      </div>
    </div>
  );
}
