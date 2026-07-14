import numpy as np

import numpy as np

def calculate_alert(forecast_df, historical_df, lang: str = 'ar') -> dict:
    forecast_values = forecast_df['yhat'].values
    lower_bound = forecast_df['yhat_lower'].values
    
    negative_days = sum(1 for v in lower_bound if v < 0)
    total_days = len(lower_bound)
    risk_probability = negative_days / total_days
    
    worst_day_idx = int(np.argmin(forecast_values))
    worst_day_value = float(forecast_values[worst_day_idx])
    days_to_worst = worst_day_idx + 1
    
    if risk_probability > 0.70 or (worst_day_value < 0 and days_to_worst <= 18):
        color = "red"
        message = f"خطر سيولة متوقع خلال {days_to_worst} يوماً — تصرف فوراً" if lang == 'ar' else f"Expected liquidity risk in {days_to_worst} days — act immediately"
    elif risk_probability > 0.40 or worst_day_value < 2000:
        color = "yellow"
        message = "ضغط على السيولة محتمل خلال 30 يوماً — راقب الوضع" if lang == 'ar' else "Potential liquidity pressure in 30 days — monitor closely"
    else:
        color = "green"
        message = "السيولة مستقرة — لا مخاوف خلال الشهر القادم" if lang == 'ar' else "Liquidity is stable — no concerns for the next month"
    
    reasons = detect_reasons(historical_df, lang)
    
    return {
        "color": color,
        "message": message,
        "risk_probability": round(risk_probability * 100, 1),
        "days_to_risk": days_to_worst,
        "worst_expected_cashflow": round(worst_day_value, 2),
        "reasons": reasons
    }

def detect_reasons(df, lang: str = 'ar') -> list:
    reasons = []
    
    if len(df) >= 60:
        last_30 = df.tail(30)
        prev_30 = df.iloc[-60:-30]
        
        expense_change = (last_30['expenses'].mean() - prev_30['expenses'].mean()) / prev_30['expenses'].mean()
        if expense_change > 0.10:
            pct = round(expense_change*100)
            reasons.append(f"ارتفاع تكاليف التشغيل بنسبة {pct}% هذا الشهر" if lang == 'ar' else f"Operating costs increased by {pct}% this month")
        
        sales_change = (last_30['sales'].mean() - prev_30['sales'].mean()) / prev_30['sales'].mean()
        if sales_change < -0.10:
            pct = round(abs(sales_change)*100)
            reasons.append(f"انخفاض المبيعات بنسبة {pct}% مقارنة بالشهر الماضي" if lang == 'ar' else f"Sales decreased by {pct}% compared to last month")
    
    reasons.append("موعد دفع الإيجار والرواتب خلال أسبوعين" if lang == 'ar' else "Rent and payroll due in two weeks")
    
    return reasons