import { useState } from 'react';
import { Send, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';

function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

export default function AIChatPage() {
  const { lang, theme } = useThemeLang();
  const isArabic = lang === 'ar';
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAnalysisContext = () => {
    const saved = localStorage.getItem('basira_analysis');
    if (!saved) return null;
    return JSON.parse(saved);
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { sender: isArabic ? 'أنت' : 'You', type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const analysisData = getAnalysisContext();

      let context = '';
      if (analysisData) {
        const alert = analysisData.alert;
        const historical = analysisData.historical_data || [];
        const forecast = analysisData.forecast_data || [];

        const avgCashflow = historical.length > 0
          ? Math.round(historical.reduce((s, d) => s + (d.cashflow || 0), 0) / historical.length)
          : 0;

        const maxCashflow = historical.length > 0
          ? Math.round(Math.max(...historical.map(d => d.cashflow)))
          : 0;

        const minCashflow = historical.length > 0
          ? Math.round(Math.min(...historical.map(d => d.cashflow)))
          : 0;

        const avgForecast = forecast.length > 0
          ? Math.round(forecast.reduce((s, d) => s + d.predicted, 0) / forecast.length)
          : 0;

        context = `
أنت تتحدث مع صاحب منشأة — هذه بياناته الحقيقية الكاملة:

📊 البيانات التاريخية (${historical.length} يوم):
- متوسط التدفق النقدي اليومي: ${avgCashflow} ريال
- أعلى تدفق نقدي: ${maxCashflow} ريال
- أدنى تدفق نقدي: ${minCashflow} ريال

🔮 التنبؤات (30 يوم قادم):
- متوسط التدفق المتوقع: ${avgForecast} ريال
- أسوأ يوم متوقع: ${alert.worst_expected_cashflow} ريال بعد ${alert.days_to_risk} يوماً

🚨 حالة الإنذار:
- اللون: ${alert.color === 'green' ? 'أخضر — آمن' : alert.color === 'yellow' ? 'أصفر — تحذير' : 'أحمر — خطر'}
- احتمالية الخطر: ${alert.risk_probability}%
- الأسباب: ${alert.reasons.join('، ')}

💡 التوصية الحالية: ${analysisData.recommendation}
        `;
      }

      const prompt = `أنت مساعد مالي ذكي اسمك بصيرة AI، متخصص في مساعدة أصحاب المنشآت الصغيرة والمتوسطة في السعودية.

${context}

سؤال المستخدم: ${text}

أجب بالعربي بشكل مختصر وعملي ومباشر. استخدم الأرقام المحددة من بيانات المستخدم. لا تزيد عن 5 جمل.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || (isArabic ? 'عذراً، حدث خطأ. حاول مرة ثانية.' : 'Sorry, an error occurred. Please try again.');

      setMessages(prev => [...prev, { sender: 'BasiraAI', type: 'ai', text: aiText }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'BasiraAI',
        type: 'ai',
        text: isArabic ? 'تعذّر الاتصال. تأكد من اتصالك بالإنترنت.' : 'Connection failed. Please check your internet.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputBar = (isCentered = false) => (
    <div className={`chat-input-bar ${isCentered ? `w-full max-w-2xl mx-auto rounded-2xl !py-2 border ${isDark ? 'bg-[#131825] border-gray-800' : 'bg-white border-gray-300'}` : ''}`}>
      <input
        type="text"
        className={`chat-input-bar__input ${isCentered ? (isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-gray-400') : ''}`}
        style={isCentered ? { border: 'none', background: 'transparent', boxShadow: 'none' } : {}}
        placeholder={isArabic ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(inputValue); } }}
        disabled={isLoading}
      />
      <button
        className="chat-input-bar__send"
        onClick={() => handleSend(inputValue)}
        disabled={isLoading}
        aria-label={isArabic ? 'إرسال' : 'Send'}
      >
        {isLoading ? '...' : <Send size={18} strokeWidth={2} />}
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      {messages.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Sparkles size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {isArabic ? 'المساعد الذكي بصيرة' : 'BasiraAI Assistant'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-basira-text-muted)' }}>
              {isArabic ? 'اسأل بصيرة عن أي استفسار مالي' : 'Ask Basira about any financial inquiry'}
            </p>
          </div>
        </div>
      )}

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full min-h-[70vh] mx-auto px-4 gap-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white">
              {isArabic ? 'ابدأ التحدث مع ' : 'Start chatting with '}
              <span className="text-blue-500">BasiraAI</span>
            </h1>

            <div className="flex items-center w-full max-w-2xl bg-white dark:bg-[#131825] border border-gray-300 dark:border-gray-700 rounded-full shadow-sm px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all mx-auto">
              <button className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0">
                <Plus size={20} />
              </button>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none px-4 text-center text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={isArabic
                  ? 'اسأل بصيرة عن السيولة، التحصيل، والمخاطر...'
                  : 'Ask Basira about liquidity, collection, and risk...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(inputValue); } }}
                disabled={isLoading}
              />
              <button
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shrink-0"
                onClick={() => handleSend(inputValue)}
                disabled={isLoading}
              >
                {isLoading ? '...' : <ArrowLeft size={18} />}
              </button>
            </div>

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
          <>
            <div className="chat-messages fade-in">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.type === 'ai' ? 'chat-bubble--ai' : 'chat-bubble--user'}`}>
                  <p className="chat-bubble__sender">{msg.sender}</p>
                  <div>{renderText(msg.text)}</div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-bubble chat-bubble--ai">
                  <p className="chat-bubble__sender">BasiraAI</p>
                  <div style={{ opacity: 0.6 }}>
                    {isArabic ? 'جاري التفكير...' : 'Thinking...'}
                  </div>
                </div>
              )}
            </div>
            {renderInputBar(false)}
          </>
        )}
      </div>
    </div>
  );
}