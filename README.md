<div align="center">
  <img src="src/assets/Basira%20logo%20white.png" alt="Basira Logo" width="400" />

# 👁️‍🗨️ Basira — Early Warning System

> A full-stack AI-powered financial early warning dashboard built for the Amd Hackathon (Alinma Bank & Tuwaiq Academy). Upload your financial data, get Prophet-powered forecasts, AI-generated recommendations, simulate liquidity scenarios, and chat with BasiraAI.

<br>

[![Live Demo](https://img.shields.io/badge/Live_Preview-Website-blue?style=for-the-badge&logo=vercel)](https://basira-kappa.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)]()
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)]()
[![Prophet](https://img.shields.io/badge/Prophet-FF6F00?style=for-the-badge&logo=meta&logoColor=white)]()
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)]()

## 🌐 Live Website
**[basira-kappa.vercel.app](https://basira-kappa.vercel.app/)**

</div>

---

## ✨ Key Features

*   **📊 AI-Powered Forecasting:** Upload CSV or Excel files — the backend automatically detects date/sales/expense columns and trains a **Meta Prophet** model to generate 30-day cash flow forecasts with confidence intervals.
*   **🚦 Intelligent Alert System:** Real-time risk assessment with **Green (Safe) / Yellow (Warning) / Red (Critical)** levels. Get early warnings about liquidity pressure, operating cost spikes, and sales drops with a countdown to risk.
*   **💡 AI Recommendations:** Structured, actionable recommendations powered by **Google Gemini** — both as detailed analytics insights and dashboard action cards, fully localized to Arabic or English.
*   **🎮 Liquidity Simulation (What-If):** Drag a slider to adjust collection rates and see instant updates to your runway, cash position impact, risk level, and liquidity status — all computed server-side in real time.
*   **🤖 BasiraAI Chat Assistant:** A bilingual (AR/EN) AI financial assistant that understands your uploaded data context — ask about liquidity, collection, costs, and risks with smart suggested questions.
*   **🌙 Dark / Light Mode:** Toggle seamlessly between themes with a persistent preference saved across sessions.
*   **🌍 Full Bilingual Support:** Complete Arabic (RTL) and English (LTR) interface with one-click switching. All charts, alerts, and AI responses adapt to the selected language.
*   **📱 Fully Responsive:** Clean, component-based layout that adapts perfectly to desktop, tablet, and mobile devices.
*   **🔗 Integrations (Coming Soon):** Open Banking, POS & Cashier, Payment Gateways, Delivery Apps, E-commerce, and Inventory — displayed in a dedicated integration grid.

## 🖥️ Pages Overview

| Page | Description |
|------|-------------|
| **Dashboard** | KPI cards (alert status, operational balance, change ratio, top risk), AI recommendations section, and predictive cash flow chart |
| **Analytics** | Deep financial analysis with same KPI cards + AI-powered analytics insight + full historical/forecast chart |
| **Upload & Connect** | Drag-and-drop CSV/Excel uploader with processing animation, file info pill, and coming-soon integrations grid |
| **Liquidity Simulation** | Collection rate slider driving real-time backend simulation — 4 metric cards (runway, cash delta, risk, status) + updated forecast chart |
| **BasiraAI Chat** | Context-aware AI chat with suggested questions, chat history (session storage), and clear chat option |
| **Login / Signup** | Full-screen bilingual authentication forms |

## 🧠 Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/analyze` | POST | Upload CSV/Excel → auto-detect columns → Prophet forecast → alert → AI recommendation |
| `/api/whatif` | POST | Simulate collection rate impact on forecast and risk |
| `/api/chat` | POST | Ask BasiraAI with full financial context |
| `/api/refresh_analysis` | POST | Re-generate alerts & recommendations in another language |

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite 8 + Tailwind CSS 4
- Recharts (interactive area charts with gradients & tooltips)
- Lucide React (icon library)
- React Dropzone (file upload)
- localStorage for data persistence across pages

**Backend:**
- FastAPI (Python) with CORS middleware
- Meta Prophet (time-series forecasting with seasonality)
- Pandas & NumPy (data processing & outlier clipping)
- Google Gemini API (AI recommendations & chat)
- SQLite / CSV

## 🚀 How to Use

1.  **Visit** the live website or run locally.
2.  **Upload** a CSV or Excel file containing date, sales, and/or expense columns.
3.  **View** the Dashboard for an instant AI-powered financial snapshot.
4.  **Explore** Analytics for deeper insights.
5.  **Simulate** different collection rate scenarios in the Simulation page.
6.  **Chat** with BasiraAI for personalised financial advice.

## 🛠️ Local Setup & Installation

### Frontend
```bash
git clone https://github.com/mshJoe/basira.git
cd basira
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
> **Note:** The backend requires a `GEMINI_API_KEY` environment variable (set in `.env`) for AI features. Without it, fallback recommendations and chat data will be used.

## 📁 File Structure

```
basira/
├── src/
│   ├── components/        # Reusable UI components (MetricCard, CashFlowChart,
│   │                      # RecommendationCard, AlertBadge, WhatIfSlider, etc.)
│   ├── pages/             # Page-level components (Dashboard, Analytics, Upload,
│   │                      # Simulation, Chat, Login, Signup)
│   ├── context/           # Theme & language provider (dark/light, ar/en)
│   ├── assets/            # Images and static assets
│   ├── App.jsx            # Root component with AppLayout
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles + Tailwind
├── backend/
│   ├── app/
│   │   ├── model.py       # Prophet forecasting & data preparation
│   │   ├── alert.py       # Risk detection & reason analysis
│   │   └── recommender.py # Gemini-powered recommendation generation
│   ├── main.py            # FastAPI server with all API endpoints
│   ├── requirements.txt   # Python dependencies
│   ├── .env               # Environment variables (GEMINI_API_KEY)
│   └── data/              # Demo data files
├── public/                # Static assets (favicon, fonts, icons)
├── package.json           # Frontend dependencies & scripts
├── vite.config.js         # Vite bundler configuration
├── eslint.config.js       # Linting rules
├── LICENSE.md             # License file
└── README.md              # This file
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/mshJoe/basira/issues) if you want to contribute.

## 📜 License & Copyright

Copyright &copy; 2026 Youssef Almghraby. All rights reserved.
