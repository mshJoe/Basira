import pandas as pd
from prophet import Prophet
import numpy as np

def load_and_prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    df['date'] = pd.to_datetime(df['date'])
    
    for col in ['sales', 'expenses']:
        if col in df.columns:
            mean = df[col].mean()
            std = df[col].std()
            df[col] = df[col].clip(mean - 3*std, mean + 3*std)
    
    if 'cashflow' not in df.columns:
        df['cashflow'] = df['sales'] - df['expenses']
    
    return df

def train_and_forecast(df: pd.DataFrame, periods: int = 30):
    prophet_df = df[['date', 'cashflow']].rename(columns={
        'date': 'ds',
        'cashflow': 'y'
    })
    
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode='multiplicative',
        changepoint_prior_scale=0.05,
        interval_width=0.80
    )
    
    model.fit(prophet_df)
    
    future = model.make_future_dataframe(periods=periods, freq='D')
    forecast = model.predict(future)
    
    future_forecast = forecast.tail(periods)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    
    return future_forecast, model