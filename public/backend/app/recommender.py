import os
import httpx
from dotenv import load_dotenv
load_dotenv()

async def generate_recommendation(alert: dict, forecast_summary: dict) -> str:
    color = alert['color']
    days = alert['days_to_risk']
    worst_cf = alert['worst_expected_cashflow']
    reasons = " | ".join(alert['reasons'])

    prompt = f"""أنت مستشار مالي متخصص في المنشآت الصغيرة والمتوسطة في السعودية.

المعطيات:
- حالة السيولة: {"خطر عالي" if color == "red" else "تحذير" if color == "yellow" else "مستقرة"}
- احتمالية نقص السيولة: {alert['risk_probability']}%
- أسوأ تدفق نقدي متوقع: {worst_cf} ريال خلال {days} يوماً
- الأسباب: {reasons}

المطلوب: اكتب توصية واحدة عملية وواضحة بالعربي لصاحب منشأة صغيرة.
- قصيرة ومباشرة لا تزيد عن 3 جمل
- ركّز على إجراء واحد أو اثنين فوريين"""

    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    if not GEMINI_API_KEY:
        return "تعذّر الاتصال بالذكاء الاصطناعي — تأكد من مفتاح Gemini API"
    
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
        
        print("Gemini response:", data)
        
        if 'candidates' not in data:
            error_msg = data.get('error', {}).get('message', 'خطأ غير معروف')
            return f"خطأ من Gemini: {error_msg}"
        
        return data['candidates'][0]['content']['parts'][0]['text'].strip()