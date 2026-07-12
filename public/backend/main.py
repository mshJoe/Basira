from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
from app.model import load_and_prepare_data, train_and_forecast
from app.alert import calculate_alert
from app.recommender import generate_recommendation

app = FastAPI(title="Basira API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Basira API is running"}

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        df.columns = df.columns.str.strip().str.lower()

        date_col = next((c for c in df.columns if any(x in c for x in ['date','تاريخ','day','time','month'])), None)

        sales_col = next((c for c in df.columns if any(x in c for x in ['sale','revenue','مبيعات','income','دخل','وارد'])), None)

        expense_col = next((c for c in df.columns if any(x in c for x in ['expense','cost','مصروف','تكلفة','صادر','spend'])), None)

        if not date_col:
            raise HTTPException(status_code=400, detail="ما وجدنا عمود تاريخ في الملف")
        if not sales_col and not expense_col:
            raise HTTPException(status_code=400, detail="ما وجدنا أعمدة مبيعات أو مصروفات في الملف")

        rename_map = {}
        if date_col: rename_map[date_col] = 'date'
        if sales_col: rename_map[sales_col] = 'sales'
        if expense_col: rename_map[expense_col] = 'expenses'
        df = df.rename(columns=rename_map)

        if 'sales' in df.columns and 'expenses' not in df.columns:
            df['expenses'] = 0

        if 'expenses' in df.columns and 'sales' not in df.columns:
            df['sales'] = 0

        df = load_and_prepare_data(df)

        return {
            "success": True,
            "alert": alert,
            "recommendation": recommendation,
            "historical_data": historical.to_dict('records'),
            "forecast_data": forecast_output.rename(columns={
                'ds': 'date',
                'yhat': 'predicted',
                'yhat_lower': 'lower',
                'yhat_upper': 'upper'
            }).to_dict('records')
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class WhatIfRequest(BaseModel):
    collection_rate: float
    forecast_data: list

@app.post("/api/whatif")
async def whatif(request: WhatIfRequest):
    adjustment_factor = request.collection_rate / 100

    adjusted_forecast = []
    for point in request.forecast_data:
        extra_cash = point['predicted'] * adjustment_factor * 0.3
        adjusted_forecast.append({
            **point,
            'predicted': point['predicted'] + extra_cash
        })

    negative_days = sum(1 for p in adjusted_forecast if p['predicted'] < 0)
    risk_prob = negative_days / len(adjusted_forecast) * 100

    if risk_prob > 70:
        color = "red"
    elif risk_prob > 40:
        color = "yellow"
    else:
        color = "green"

    return {
        "color": color,
        "risk_probability": round(risk_prob, 1),
        "adjusted_forecast": adjusted_forecast
    }