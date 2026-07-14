# Refactor Analytics Page KPI Cards to Match HTML Reference

## Overview
The Analytics page currently uses generic `MetricCard` components with inline styles. The reference design (`Basira1/`) uses styled `kpi-card` containers with gradient backgrounds, ring indicators, sparkline charts, and priority dots.

## Key Differences (Current vs Reference)

| Feature | Current | Reference |
|---------|---------|-----------|
| Grid columns | `4` → too wide for content | `3` with spacious gap |
| Card style | Flat `metric-card` with accent border | Gradient background cards with `kpi-card` class |
| Indicators | Plain text values | Ring chart (`kpi-ring`), spark bars (`kpi-card__spark`) |
| Priority | No marker | Red dot (`kpi-priority-dot`) for warning cards |
| Insight card | Inline `div` with hardcoded color | Tailwind-styled card with `bg-white dark:bg-[#131E2C]` |
| Spark charts | None | Mini bar charts showing trends |

## Required Changes

### 1. Replace 4-card Grid with 6-card Grid in `AnalyticsPage.jsx`

Remove:
```jsx
<div className="kpi-grid">
  <MetricCard ... />
  <MetricCard ... />
  <MetricCard ... />
  <MetricCard ... />
</div>
```

Replace with:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 kpi-grid">
  {/* 6 kpi-card articles */}
</div>
```

### 2. Six KPI Card Designs (from reference HTML)

Use the exact structure from the reference files:

**Card 1: Liquidity Runway** — `kpi-card kpi-card--ring`
- Ring chart showing days remaining
- Value + unit inside the ring
- Note below

**Card 2: Overdue Payments** — `kpi-card kpi-card--warning`
- Priority dot, label, value
- Spark chart
- Action arrow

**Card 3: Average Collection Period** — `kpi-card`
- Plain value, note, spark chart

**Card 4: Operating Cash Flow** — `kpi-card kpi-card--positive`
- Positive value in green, spark chart

**Card 5: Monthly Change Ratio** — `kpi-card kpi-card--warning`
- Priority dot, change arrow (up/down), spark chart

**Card 6: Highest Upcoming Risk** — `kpi-card kpi-card--danger`
- Priority dot, risk label, value, spark chart

### 3. Spark Chart Data

Each `kpi-card__spark` needs an array of 6 percentage values:
```html
<div class="kpi-card__spark">
  <span style="height: 40%" />
  <span style="height: 60%" />
  <span style="height: 35%" />
  <span class="is-peak" style="height: 90%" />
  <span style="height: 50%" />
  <span style="height: 70%" />
</div>
```

### 4. AI Insight Card

Replace the inline-styled insight with:
```jsx
<div className="bg-white dark:bg-[#131E2C] rounded-2xl p-6 my-8 shadow-sm flex items-start gap-5">
  <div className="text-3xl flex-shrink-0 leading-none mt-0.5">💡</div>
  <div className="min-w-0 flex-1">
    <h3 className="text-lg m-0 font-bold text-gray-800 dark:text-gray-100 leading-snug">
      {recommendation.analytics_insight.title}
    </h3>
    <p className="m-0 leading-relaxed text-gray-500 dark:text-gray-400 font-medium mt-1.5 text-sm">
      {recommendation.analytics_insight.description}
    </p>
  </div>
</div>
```

### 5. CSS Classes Needed (add to `index.css`)

```css
.kpi-card { background: var(--gradient-card); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; position: relative; overflow: hidden; border: 1px solid var(--color-border); }
.kpi-card--ring { --accent: #3b82f6; }
.kpi-card--warning { --accent: #f59e0b; }
.kpi-card--positive { --accent: #10b981; }
.kpi-card--danger { --accent: #ef4444; }
.kpi-card__label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; }
.kpi-card__value { font-size: 1.75rem; font-weight: 700; margin: 0; line-height: 1.1; }
.kpi-card__note { font-size: 0.8rem; opacity: 0.65; margin: 0; line-height: 1.4; }
.kpi-card__action { position: absolute; top: 1.25rem; right: 1.25rem; opacity: 0.3; transition: opacity 0.2s; }
.kpi-card:hover .kpi-card__action { opacity: 0.7; }
.kpi-priority-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent, #ef4444); position: absolute; top: 1.25rem; left: 1.25rem; }
.kpi-card__spark { display: flex; align-items: flex-end; gap: 3px; height: 40px; margin-top: auto; }
.kpi-card__spark span { flex: 1; background: var(--accent, var(--color-border)); border-radius: 2px 2px 0 0; opacity: 0.3; transition: opacity 0.2s; min-height: 4px; }
.kpi-card__spark span.is-peak { opacity: 0.8; }
.kpi-ring { --ring-size: 80px; width: var(--ring-size); height: var(--ring-size); border-radius: 50%; background: conic-gradient(var(--accent, #3b82f6) var(--ring-percentage, 0%), transparent var(--ring-percentage, 0%)); display: flex; align-items: center; justify-content: center; position: relative; }
.kpi-ring__inner { width: calc(var(--ring-size) - 12px); height: calc(var(--ring-size) - 12px); border-radius: 50%; background: var(--color-surface); display: flex; flex-direction: column; align-items: center; justify-content: center; }
.kpi-ring__value { font-size: 1.3rem; font-weight: 700; line-height: 1; }
.kpi-ring__unit { font-size: 0.6rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
```

## Verification
- Build should pass with no errors
- Analytics page should show 6 styled cards in a 3-column grid
- Each card should have proper spacing, colors, and interactive hover effects
- The insight card should be clean and spacious
