import os
import json
import httpx
import numpy as np
import traceback
from dotenv import load_dotenv
load_dotenv()


def _py(value):
    """Convert numpy/pandas scalars to native Python types for JSON serialization."""
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    return value


def compute_financial_metrics(historical_data: list, forecast_data: list, alert: dict, lang: str = 'ar') -> dict:
    """Deterministic fallback that computes all financial metrics from raw data."""
    import pandas as pd

    result = {}

    # --- overdue_receivables (from historical) ---
    overdue_receivables = 0
    if historical_data and len(historical_data) > 0:
        df = pd.DataFrame(historical_data)
        if 'cashflow' in df.columns:
            recent = df.tail(60)
            overdue_receivables = float(abs(recent[recent['cashflow'] < 0]['cashflow'].sum()))
            overdue_receivables = round(overdue_receivables, 2)
    result['overdue_receivables'] = overdue_receivables
    result['overdue_payments'] = overdue_receivables

    # --- DSO (from historical) ---
    dso = 30
    if historical_data and len(historical_data) >= 30:
        df = pd.DataFrame(historical_data)
        if 'cashflow' in df.columns:
            recent_30 = df.tail(30)['cashflow']
            avg_daily_cf = float(abs(recent_30.mean()))
            positive_cf = recent_30[recent_30 > 0]
            avg_revenue = float(positive_cf.mean()) if len(positive_cf) > 0 else avg_daily_cf
            negative_cf = recent_30[recent_30 < 0]
            total_receivables = float(abs(negative_cf.sum())) if len(negative_cf) > 0 else 0
            dso = round(total_receivables / avg_revenue, 1) if avg_revenue > 0 else 30
            dso = max(dso, 0)
    dso = _py(dso)
    result['dso'] = dso
    result['collection_period'] = dso
    result['average_collection_days'] = dso

    # --- highest_risk_value (from forecast) ---
    highest_risk_value = 0
    highest_risk_title = ""
    if forecast_data and len(forecast_data) > 0:
        values = [p.get('predicted', 0) for p in forecast_data]
        if values:
            worst = min(values)
            highest_risk_value = round(float(abs(worst)), 2)
    if lang == 'ar':
        highest_risk_title = "انخفاض متوقع في التدفق النقدي"
    else:
        highest_risk_title = "Expected cash flow decline"
    result['highest_risk_value'] = highest_risk_value
    result['highest_upcoming_risk'] = highest_risk_value
    result['highest_risk'] = highest_risk_title

    # --- breakdown_items ---
    avg_revenue = 0.0
    avg_expenses = 0.0
    if historical_data and len(historical_data) > 0:
        df = pd.DataFrame(historical_data)
        if 'sales' in df.columns:
            avg_revenue = float(round(float(df['sales'].mean()), 2))
        if 'expenses' in df.columns:
            avg_expenses = float(round(float(df['expenses'].mean()), 2))

    net_cash = _py(avg_revenue - avg_expenses)
    risk_prob = float(alert.get('risk_probability', 0)) if alert else 0
    days_to_risk = _py(alert.get('days_to_risk', 0) if alert else 0)
    worst_cf = float(alert.get('worst_expected_cashflow', 0)) if alert else 0

    rev_status = 'positive' if avg_revenue > 0 else 'warning'
    exp_status = 'critical' if avg_expenses > avg_revenue > 0 else ('warning' if avg_expenses > avg_revenue * 0.8 else 'positive')
    net_status = 'positive' if net_cash > 0 else ('warning' if net_cash > -1000 else 'critical')
    risk_status = 'critical' if risk_prob > 70 else ('warning' if risk_prob > 40 else 'positive')
    runway_status = 'critical' if days_to_risk < 15 else ('warning' if days_to_risk < 30 else 'positive')
    worst_status = 'critical' if worst_cf < 0 else ('warning' if worst_cf < 2000 else 'positive')

    currency = "ر.س" if lang == 'ar' else "SAR"
    days_unit = f" {('يوم' if lang == 'ar' else 'Days')}"

    labels_ar = ["متوسط الإيرادات اليومية", "متوسط المصروفات اليومية", "صافي التدفق النقدي",
                 "احتمالية المخاطر", "فترة الأمان المتبقية", "أسوأ يوم متوقع"]
    labels_en = ["Average Daily Revenue", "Average Daily Expenses", "Net Cash Flow",
                 "Risk Probability", "Remaining Safety Runway", "Worst Projected Day"]
    labels = labels_ar if lang == 'ar' else labels_en

    result['breakdown_items'] = [
        {"label": labels[0], "value": _py(avg_revenue), "suffix": currency, "status": rev_status, "change": None},
        {"label": labels[1], "value": _py(avg_expenses), "suffix": currency, "status": exp_status, "change": None},
        {"label": labels[2], "value": net_cash, "suffix": currency, "status": net_status, "change": None},
        {"label": labels[3], "value": _py(risk_prob), "suffix": "%", "status": risk_status, "change": None},
        {"label": labels[4], "value": days_to_risk, "suffix": days_unit, "status": runway_status, "change": None},
        {"label": labels[5], "value": _py(abs(worst_cf) if worst_cf < 0 else worst_cf), "suffix": currency, "status": worst_status, "change": None},
    ]

    return result


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


async def generate_recommendation(alert: dict, forecast_summary: dict, lang: str = 'ar',
                                   historical_data: list = None, forecast_data: list = None) -> dict:
    """
    Calls Gemini to generate structured JSON recommendations AND computes
    financial metrics (overdue_receivables, dso, highest_risk_value, breakdown_items).

    Returns a dict with:
      - analytics_insight, dashboard_actions (from AI)
      - overdue_receivables, overdue_payments, dso, collection_period,
        average_collection_days, highest_risk_value, highest_upcoming_risk,
        highest_risk, breakdown_items (AI-preferred, deterministic fallback)
    """
    # Compute deterministic fallback first
    fallback_metrics = compute_financial_metrics(historical_data, forecast_data, alert, lang)

    color = alert['color']
    days = alert['days_to_risk']
    worst_cf = alert['worst_expected_cashflow']
    reasons = " | ".join(alert['reasons'])

    language_instruction = "English" if lang == 'en' else "Arabic"

    # Build a summary of historical + forecast data for the AI
    hist_summary = ""
    if historical_data:
        revenues = [d.get('sales', 0) for d in historical_data if 'sales' in d]
        expenses = [d.get('expenses', 0) for d in historical_data if 'expenses' in d]
        cashflows = [d.get('cashflow', 0) for d in historical_data if 'cashflow' in d]
        if revenues:
            hist_summary += f"- متوسط الإيرادات اليومية: {np.mean(revenues):.0f}\n"
        if expenses:
            hist_summary += f"- متوسط المصروفات اليومية: {np.mean(expenses):.0f}\n"
        if cashflows:
            neg_60d = sum(c for c in cashflows[-60:] if c < 0)
            hist_summary += f"- إجمالي التدفقات السالبة (آخر 60 يوم): {abs(neg_60d):.0f}\n"
            pos_30d = [c for c in cashflows[-30:] if c > 0]
            if pos_30d:
                hist_summary += f"- متوسط التدفق الإيجابي اليومي (آخر 30 يوم): {np.mean(pos_30d):.0f}\n"

    forecast_summary_text = ""
    if forecast_data:
        preds = [d.get('predicted', 0) for d in forecast_data if 'predicted' in d]
        if preds:
            forecast_summary_text += f"- أسوأ تدفق متوقع: {min(preds):.0f}\n"
            forecast_summary_text += f"- متوسط التدفق المتوقع: {np.mean(preds):.0f}\n"

    prompt = f"""أنت مستشار مالي متخصص في المنشآت الصغيرة والمتوسطة في السعودية. تقوم بتحليل بيانات مالية حقيقية من ملف CSV مرفوع.

المعطيات:
- حالة السيولة: {"خطر عالي" if color == "red" else "تحذير" if color == "yellow" else "مستقرة"}
- احتمالية نقص السيولة: {alert['risk_probability']}%
- أسوأ تدفق نقدي متوقع: {worst_cf} ريال خلال {days} يوماً
- الأسباب: {reasons}

ملخص البيانات التاريخية:
{hist_summary}
ملخص التوقعات:
{forecast_summary_text}
المطلوب: أرجع JSON خام فقط (بدون أي markdown أو ```json) يحتوي على الحقول التالية بالضبط:

1. "analytics_insight": كائن فيه "title" (عنوان قصير يلخص حالة السيولة) و "description" (وصف تفصيلي بـ 2-3 جمل عن الوضع المالي والتوقعات).

2. "dashboard_actions": مصفوفة من 3 عناصر بالضبط، كل عنصر فيه:
   - "title": عنوان إجراء عملي قصير
   - "description": شرح مختصر بجملة أو جملتين
   - "primary_tag": واحد من: "أولوية عالية" أو "إدارة مخاطر" أو "توفير"

3. "overdue_receivables": رقم (إجمالي المستحقات المتأخرة بالريال من البيانات)
4. "dso": رقم (متوسط أيام التحصيل المقدر)
5. "average_collection_days": رقم (نفس قيمة dso)
6. "highest_risk_value": رقم (قيمة أعلى خطر قادم)
7. "highest_risk": نص (وصف المخاطرة)
8. "breakdown_items": مصفوفة من 6 عناصر بالضبط، كل عنصر:
   - "label": نص (اسم البند)
   - "value": رقم (القيمة الحالية)
   - "suffix": نص (الوحدة: "ر.س" أو "%" أو " يوم")
   - "status": واحد من "positive", "warning", "critical"
   - "change": نص أو null (نسبة التغير إن وجد)

IMPORTANT INSTRUCTION: You MUST generate the ENTIRE JSON response and all string values strictly in {language_instruction}.

أرجع JSON خام فقط. لا تكتب أي نص قبله أو بعده."""

    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    print("GEMINI API KEY STATUS (recommender):", bool(GEMINI_API_KEY))

    if not GEMINI_API_KEY:
        # Merge fallback recommendation with deterministic metrics
        fb = get_fallback_recommendation(lang)
        return {**fb, **fallback_metrics}

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
                fb = get_fallback_recommendation(lang)
                return {**fb, **fallback_metrics}

            raw_text = data['candidates'][0]['content']['parts'][0]['text']
            print("--- RAW GEMINI RESPONSE (recommender) ---")
            print(raw_text)

            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

            result = json.loads(raw_text)

            # Validate core structure
            if 'analytics_insight' not in result or 'dashboard_actions' not in result:
                print(f"Gemini returned incomplete JSON: {raw_text[:200]}")
                fb = get_fallback_recommendation(lang)
                return {**fb, **fallback_metrics}

            if not isinstance(result['dashboard_actions'], list) or len(result['dashboard_actions']) < 3:
                print(f"Gemini returned < 3 dashboard_actions")
                fb = get_fallback_recommendation(lang)
                return {**fb, **fallback_metrics}

            # Merge AI result with deterministic metrics (AI values preferred, but fallback fills gaps)
            merged = {
                **fallback_metrics,
                'analytics_insight': result.get('analytics_insight', fallback_metrics.get('analytics_insight')),
                'dashboard_actions': result.get('dashboard_actions', fallback_metrics.get('dashboard_actions')),
            }

            # Override with AI-provided metric values if they exist and are sensible
            for key in ['overdue_receivables', 'dso', 'average_collection_days', 'highest_risk_value', 'highest_risk', 'breakdown_items']:
                if key in result and result[key] is not None:
                    merged[key] = result[key]
                    # Sync aliases
                    if key == 'overdue_receivables':
                        merged['overdue_payments'] = result[key]
                    if key == 'dso':
                        merged['collection_period'] = result[key]
                        merged['average_collection_days'] = result[key]
                    if key == 'highest_risk_value':
                        merged['highest_upcoming_risk'] = result[key]

            return merged

    except (json.JSONDecodeError, KeyError, Exception) as e:
        print(f"Recommendation generation error: {e}")
        traceback.print_exc()
        fb = get_fallback_recommendation(lang)
        return {**fb, **fallback_metrics}