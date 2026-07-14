import os
import json
import httpx
from dotenv import load_dotenv
load_dotenv()

def get_fallback_recommendation(lang: str = 'ar') -> dict:
    if lang == 'en':
        return {
            "analytics_insight": {
                "title": "Liquidity Analysis",
                "description": "Unable to connect to AI — please review the data manually and take appropriate actions."
            },
            "dashboard_actions": [
                {
                    "title": "Review Overdue Receivables",
                    "description": "Check late invoices and follow up with key clients to improve cash flow.",
                    "primary_tag": "High Priority"
                },
                {
                    "title": "Review Credit Limits",
                    "description": "Review credit terms with key suppliers to reduce financial risk.",
                    "primary_tag": "Risk Mgmt"
                },
                {
                    "title": "Invest Surplus",
                    "description": "Invest any cash surplus in short-term instruments for additional yield.",
                    "primary_tag": "Saving"
                }
            ]
        }
    return {
        "analytics_insight": {
            "title": "تحليل السيولة",
            "description": "تعذّر الاتصال بالذكاء الاصطناعي — يرجى مراجعة البيانات يدوياً واتخاذ الإجراءات المناسبة."
        },
        "dashboard_actions": [
            {
                "title": "مراجعة المستحقات المتأخرة",
                "description": "تحقق من الفواتير المتأخرة وتابع التحصيل مع العملاء الرئيسيين لتحسين التدفق النقدي.",
                "primary_tag": "أولوية عالية"
            },
            {
                "title": "مراجعة حدود الائتمان",
                "description": "راجع شروط الائتمان مع الموردين الرئيسيين لتقليل المخاطر المالية.",
                "primary_tag": "إدارة مخاطر"
            },
            {
                "title": "تحويل الفائض للاستثمار",
                "description": "استثمر أي فائض نقدي في أدوات قصيرة الأجل لتحقيق عائد إضافي.",
                "primary_tag": "توفير"
            }
        ]
    }


import traceback

async def generate_recommendation(alert: dict, forecast_summary: dict, lang: str = 'ar') -> dict:
    """
    Calls Gemini to generate structured JSON recommendations.
    Returns a dict with 'analytics_insight' and 'dashboard_actions' localized based on 'lang'.
    """
    color = alert['color']
    days = alert['days_to_risk']
    worst_cf = alert['worst_expected_cashflow']
    reasons = " | ".join(alert['reasons'])
    
    language_instruction = "English" if lang == 'en' else "Arabic"

    prompt = f"""أنت مستشار مالي متخصص في المنشآت الصغيرة والمتوسطة في السعودية.

المعطيات:
- حالة السيولة: {"خطر عالي" if color == "red" else "تحذير" if color == "yellow" else "مستقرة"}
- احتمالية نقص السيولة: {alert['risk_probability']}%
- أسوأ تدفق نقدي متوقع: {worst_cf} ريال خلال {days} يوماً
- الأسباب: {reasons}

المطلوب: أرجع JSON خام فقط (بدون أي markdown أو ```json) يحتوي على:

1. "analytics_insight": كائن فيه "title" (عنوان قصير يلخص حالة السيولة) و "description" (وصف تفصيلي بـ 2-3 جمل عن الوضع المالي والتوقعات).

2. "dashboard_actions": مصفوفة من 3 عناصر بالضبط، كل عنصر فيه:
   - "title": عنوان إجراء عملي قصير
   - "description": شرح مختصر بجملة أو جملتين
   - "primary_tag": واحد من: "أولوية عالية" أو "إدارة مخاطر" أو "توفير" (أو ما يعادلها بالإنجليزية إذا طُلب ذلك)

IMPORTANT INSTRUCTION: You MUST generate the ENTIRE JSON response and all string values strictly in {language_instruction}.

أرجع JSON خام فقط. لا تكتب أي نص قبله أو بعده."""

    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    print("GEMINI API KEY STATUS (recommender):", bool(GEMINI_API_KEY))

    if not GEMINI_API_KEY:
        return get_fallback_recommendation(lang)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                },
                timeout=30
            )
            data = response.json()

            if 'candidates' not in data:
                print("--- RAW GEMINI ERROR RESPONSE ---", data)
                print(f"Gemini error: {data.get('error', {}).get('message', 'Unknown')}")
                return get_fallback_recommendation(lang)

            raw_text = data['candidates'][0]['content']['parts'][0]['text']
            print("--- RAW GEMINI RESPONSE (recommender) ---")
            print(raw_text)

            # Strip markdown code fences if Gemini wraps them anyway
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

            result = json.loads(raw_text)

            # Validate structure
            if 'analytics_insight' not in result or 'dashboard_actions' not in result:
                print(f"Gemini returned incomplete JSON: {raw_text[:200]}")
                return get_fallback_recommendation(lang)

            if not isinstance(result['dashboard_actions'], list) or len(result['dashboard_actions']) < 3:
                print(f"Gemini returned < 3 dashboard_actions")
                return get_fallback_recommendation(lang)

            return result

    except (json.JSONDecodeError, KeyError, Exception) as e:
        print(f"Recommendation generation error: {e}")
        traceback.print_exc()
        return get_fallback_recommendation(lang)