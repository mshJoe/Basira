# Spacing Root Cause Analysis

## The Problem
Adding Tailwind spacing classes (e.g., `mb-12`, `gap-6`) to the KPI grid elements had no visible effect. The spacing did not change regardless of which Tailwind utility was used.

## Root Cause
The `index.css` file defines:

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;           /* ← overrides Tailwind gap-* */
  margin-bottom: 1.5rem; /* ← overrides Tailwind mb-* */
}
```

This CSS is loaded **after** Tailwind's utility classes via `import './index.css'` in `src/main.jsx`. Because of CSS specificity and source order, the `.kpi-grid` class properties always win over the Tailwind utility classes applied on the same element.

## Why This Happens
- Both `.kpi-grid` and Tailwind utilities (`.gap-6`, `.mb-12`) target the **same** DOM element.
- In CSS cascade, when two rules have equal specificity, the **later** rule wins.
- Since `index.css` is imported after Tailwind, `.kpi-grid` takes precedence over `.gap-6` and `.mb-12`.

## The Fix

### In `src/index.css`:
Remove the conflicting properties:
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  /* REMOVED: gap: 1rem; */
  /* REMOVED: margin-bottom: 1.5rem; */
}
```

### In `src/pages/DashboardPage.jsx`:
Add Tailwind utilities directly on the grid element:
```jsx
<div className="kpi-grid gap-6 mb-12">
```

### In `src/pages/AnalyticsPage.jsx`:
Already has `gap-6 mb-8` on the grid — ensure `.kpi-grid` is not overriding them:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 kpi-grid">
```

## Verification
1. Open DevTools and inspect the grid element
2. The computed `gap` and `margin-bottom` should come from Tailwind classes, NOT from `.kpi-grid`
3. If `.kpi-grid` still shows `gap: 1rem`, the CSS import order needs further investigation

## Alternative Approach (if fix doesn't work)
If CSS cascade still causes issues, rename the CSS class or use `!important` on Tailwind utilities as a last resort. Better approach: move the grid layout entirely to Tailwind and remove `.kpi-grid` from CSS.
