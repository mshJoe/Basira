import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range(start='2024-01-01', periods=180, freq='D')

sales = []
expenses = []

for date in dates:
    base_sales = 8000
    base_expense = 5000

    # موسمية رمضان
    if date.month == 3 and date.day >= 10:
        base_sales *= 1.8
        base_expense *= 1.4
    elif date.month == 4 and date.day <= 9:
        base_sales *= 1.6
        base_expense *= 1.3

    # إجازة الصيف
    if date.month in [6, 7]:
        base_sales *= 1.3
        base_expense *= 1.1

    # نهاية الشهر
    if date.day >= 28:
        base_expense *= 1.5

    sales.append(max(0, base_sales + np.random.normal(0, 800)))
    expenses.append(max(0, base_expense + np.random.normal(0, 400)))

df = pd.DataFrame({
    'date': dates,
    'sales': sales,
    'expenses': expenses
})
df['cashflow'] = df['sales'] - df['expenses']
df.to_csv('data/demo_restaurant.csv', index=False)
print("✅ Demo data created successfully!")