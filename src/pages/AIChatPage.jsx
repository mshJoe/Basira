import { useState } from 'react';
import { Send, Sparkles, Plus, ArrowLeft } from 'lucide-react';
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
  const { lang, theme } = useThemeLang();
  const isArabic = lang === 'ar';
  const isDark = theme === 'dark';
  
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
      className={`chat-input-bar ${isCentered ? `w-full max-w-2xl mx-auto rounded-2xl !py-2 border ${isDark ? 'bg-[#131825] border-gray-800' : 'bg-white border-gray-300'}` : ''}`}
    >
      <input
        type="text"
        className={`chat-input-bar__input ${isCentered ? (isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-gray-400') : ''}`}
        style={isCentered ? { border: 'none', background: 'transparent', boxShadow: 'none' } : {}}
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
          <div className="flex flex-col items-center justify-center w-full min-h-[70vh] mx-auto px-4 gap-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white">
              {isArabic ? 'ابدأ التحدث مع ' : 'Start chatting with '}<span className="text-blue-500">BasiraAI</span>
            </h1>

            {/* Input Bar Container */}
            <div className="flex items-center w-full max-w-2xl bg-white dark:bg-[#131825] border border-gray-300 dark:border-gray-700 rounded-full shadow-sm px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all mx-auto">
              
              {/* Plus Button */}
              <button className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0">
                <Plus size={20} />
              </button>

              {/* Input Field */}
              <input
                type="text"
                className="flex-1 bg-transparent outline-none px-4 text-center text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={isArabic 
                  ? 'اسأل بصيرة عن السيولة، التحصيل، والمخاطر، واحصل على اقتراحات سريعة للتنفيذ...' 
                  : 'Ask Basira about liquidity, collection, and risk, and get quick actionable suggestions...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
              />

              {/* Send Button */}
              <button 
                className="flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-600 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shrink-0"
                onClick={() => handleSend(inputValue)}
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-3xl mt-6 mx-auto">
              {(isArabic ? [
                "ما هي أول خطوة تنصحني بها الآن؟",
                "ما هو أفضل قرار خلال الأيام السبعة القادمة؟",
                "كيف يمكنني رفع نسبة السيولة؟",
                "ما هو أكثر بند يسبب ضغطاً على السيولة؟"
              ] : [
                "What is the first step you recommend right now?",
                "What is the best decision for the next 7 days?",
                "How can I increase the liquidity ratio?",
                "Which item puts the most pressure on liquidity?"
              ]).map((suggestion, index) => (
                <button 
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  className="!px-6 !py-3 !inline-flex items-center justify-center whitespace-nowrap box-border bg-transparent dark:bg-[#131825] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium shadow-sm transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-md hover:!border-blue-500 hover:text-blue-600 dark:hover:!border-blue-400 dark:hover:text-blue-400 dark:hover:bg-slate-800"
                >
                  {suggestion}
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
