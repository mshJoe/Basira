# Dashboard Refinements: Dynamic Alert Banner + Spacing

## Overview
The Dashboard page needs two refinements:
1. The main alert indicator should use `days_to_risk` thresholds instead of `alert.color`
2. Spacing around the warning banner should be consistent

## Changes Required

### 1. Replace `alert.color` with `days_to_risk` Logic

**Current approach in `DashboardPage.jsx`:**
```javascript
const alertColor = alert.color === 'green' ? '#10b981'
  : alert.color === 'yellow' ? '#f59e0b' : '#ef4444';
```

**Required approach:**
```javascript
const days = alert.days_to_risk || 30;

const getLevelFromDays = (days) => {
  if (days > 30) return 'green';
  if (days >= 15) return 'yellow';
  return 'red';
};

const computedLevel = getLevelFromDays(days);

const alertColor = computedLevel === 'green' ? '#10b981'
  : computedLevel === 'yellow' ? '#f59e0b'
  : '#ef4444';

const bannerColors = computedLevel === 'green'
  ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
  : computedLevel === 'yellow'
    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
    : 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
```

### 2. Add Warning Banner

Insert before the KPI grid:
```jsx
{/* Liquidity Alert Banner */}
{alert && alert.days_to_risk && (
  <div className={`p-6 mb-8 rounded-xl flex items-center gap-4 border ${bannerColors}`}>
    <ShieldAlert size={28} className="flex-shrink-0" />
    <p className="font-semibold m-0 text-sm md:text-base leading-relaxed">
      {isArabic 
        ? `سيولتك تكفي ${alert.days_to_risk} يوماً فقط قبل دخول الرصيد للمنطقة السالبة إذا استمر الوضع الحالي`
        : `Your liquidity is sufficient for only ${alert.days_to_risk} days before entering negative balance if the current situation continues`}
    </p>
  </div>
)}
```

### 3. Spacing Values

| Element | Property | Value |
|---------|----------|-------|
| Warning banner | `padding` | `p-6` (1.5rem) |
| Warning banner | `margin-bottom` | `mb-8` (2rem) |
| KPI grid | `gap` | `gap-6` (1.5rem) |
| KPI grid | `margin-bottom` | `mb-12` (3rem) |

### 4. Remove Hardcoded CSS

In `index.css`, remove `gap: 1rem;` and `margin-bottom: 1.5rem;` from `.kpi-grid` — these will be handled by Tailwind utility classes instead.
