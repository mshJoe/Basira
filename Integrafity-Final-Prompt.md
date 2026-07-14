# Final Prompt: Spacing + Alert Card Fixes

## Root Cause (Already Diagnosed)

The file `src/index.css` lines 610-627 defines `.kpi-grid` with hardcoded properties:

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;          /* ← overrides Tailwind gap-6 */
  margin-bottom: 1.5rem; /* ← overrides Tailwind mb-* */
}
```

Because this CSS class is loaded **after** Tailwind utilities (it is imported in `src/main.jsx` via `import './index.css'`), its properties always win over Tailwind utility classes applied on the JSX elements. This is why adding `mb-12` or `gap-6` to the grid divs had no visible effect.

## Changes Required

### 1. Fix `.kpi-grid` in `src/index.css` (Critical)

Delete the hardcoded `gap` and `margin-bottom` from `.kpi-grid`:

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  /* REMOVED: gap: 1rem; */
  /* REMOVED: margin-bottom: 1.5rem; */
}
```

Keep only `display`, `grid-template-columns`, and the media queries. All spacing will be controlled via Tailwind utility classes on the JSX elements instead.

### 2. Fix `src/pages/DashboardPage.jsx` — Add Warning Banner + Fix Spacing

#### 2a. Replace the first card with a full-width warning banner

The current first card (`مؤشر الإنذار الرئيسي` / `Main Alert Status`) should become a **full-width status banner** that spans the entire row above the 4-column KPI grid. It is NOT inside the grid.

**Current code (lines 111-202):**
```jsx
<div className="kpi-grid">
  {/* Card 1: مؤشر الإنذار — this is inside the grid */}
  ...
  {/* Card 2-4: MetricCard */}
  ...
</div>
```

**Required change:**

```jsx
{/* WARNING BANNER — full width, outside the grid */}
<div className="rounded-xl p-6 mb-8" style={{ ... }}>
  ...banner content...
</div>

{/* KPI GRID — 4 cards with Tailwind spacing */}
<div className="kpi-grid gap-6 mb-12">
  {/* Card 1: الرصيد التشغيلي */}
  {/* Card 2: نسبة التغير */}
  {/* Card 3: أعلى خطر */}
  {/* Card 4: (unchanged) */}
</div>
```

#### 2b. Warning banner dynamic color based on `days_to_risk`

Change the banner from showing `alert.color` values to showing thresholds based on `days_to_risk`:

```javascript
const bannerColors = alert.days_to_risk > 15
  ? { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981', dot: '#10b981' }
  : alert.days_to_risk > 5
  ? { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', text: '#f59e0b', dot: '#f59e0b' }
  : { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444', dot: '#ef4444' };

const statusNote = alert.days_to_risk > 15
  ? (isArabic ? 'السيولة في مستوى مستقر وآمن' : 'Liquidity is at a stable, safe level')
  : alert.days_to_risk > 5
  ? (isArabic ? 'انخفاض ملحوظ في مستوى السيولة' : 'Noticeable decline in liquidity level')
  : (isArabic ? 'مستوى حرج — تدخل فوري مطلوب' : 'Critical level — immediate action required');
```

#### 2c. Warning banner HTML structure

```jsx
<div className="rounded-xl p-6 mb-8" style={{
  background: bannerColors.bg,
  border: `1px solid ${bannerColors.border}`,
  borderRadius: '12px'
}}>
  <div className="flex items-center gap-6">
    {/* Circle with days_to_risk number */}
    <div className="flex-shrink-0" style={{
      width: '64px', height: '64px',
      borderRadius: '50%',
      border: `2.5px solid ${bannerColors.text}`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      lineHeight: '1.2',
      boxShadow: `0 0 12px ${bannerColors.text}30`
    }}>
      <span style={{ color: bannerColors.text, fontSize: '1.3rem', fontWeight: 'bold' }}>
        {alert.days_to_risk}
      </span>
      <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>
        {isArabic ? 'متبقي' : 'left'}
      </span>
    </div>
    {/* Text content */}
    <div className="flex-1 flex flex-col gap-2">
      <span className="status-pill" style={{
        background: `${bannerColors.text}18`,
        color: bannerColors.text,
        padding: '0.2rem 0.75rem',
        fontSize: '0.75rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        width: 'fit-content',
        borderRadius: '999px'
      }}>
        <span style={{
          width: '7px', height: '7px',
          borderRadius: '50%',
          background: bannerColors.dot,
          display: 'inline-block'
        }} />
        {isArabic
          ? (alert.days_to_risk > 15 ? 'آمنة' : alert.days_to_risk > 5 ? 'متوسطة' : 'حرجة')
          : (alert.days_to_risk > 15 ? 'Safe' : alert.days_to_risk > 5 ? 'Moderate' : 'Critical')}
      </span>
      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.85 }}>
        {statusNote}
      </p>
    </div>
  </div>
</div>
```

#### 2d. Remove `alert.color` based variables

Delete or comment out lines 91-97 in the original file:

```javascript
// REMOVED — no longer used
// const alertColor = alert.color === 'green' ? '#10b981' ...
// const liquidityStatus = { ar: ..., en: ... };
```

Keep `alertColor` only if still referenced elsewhere (it is used in Cards 2-4). Actually Card 2 (`الرصيد التشغيلي`) uses `accentColor="#3B82F6"`, Card 3 uses `#10b981`/`#ef4444`, Card 4 uses `#f59e0b` — none use `alertColor`. So `alertColor` can be fully removed.

#### 2e. Change status text on Card 4 (`أعلى خطر`)

Currently Card 4 displays `alert.reasons?.[0]` as the value + `alert.risk_probability` as subtitle. This is fine — no changes needed.

### 3. Fix `src/pages/AnalyticsPage.jsx` — Fix AI Insight Card Spacing

The AI insight card (lines 174-197) currently uses inline styles:

```jsx
<div style={{
  marginTop: '1.5rem',   // → should be larger
  marginBottom: '2.5rem', // → should be larger
  padding: '1.5rem',      // → should be larger
  ...
}}>
```

**Required changes:**

```jsx
<div style={{
  marginTop: '2.5rem',    // increased from 1.5rem to 2.5rem
  marginBottom: '4rem',   // increased from 2.5rem to 4rem (to match Tailwind mb-16)
  padding: '2rem',        // increased from 1.5rem to 2rem (to match Tailwind p-8)
  borderRadius: '12px',
  background: alertColor === '#10b981'
    ? 'rgba(16, 185, 129, 0.08)'  // slightly more transparent for a cleaner look
    : alertColor === '#f59e0b'
    ? 'rgba(245, 158, 11, 0.08)'
    : 'rgba(239, 68, 68, 0.08)',
  border: `1px solid ${alertColor}30`  // use 30 opacity for border to match banner style
}}>
```

**Alternatively** (if preferred): convert the insight card to use Tailwind + inline style for dynamic color only:

```jsx
<div className="rounded-xl" style={{
  marginTop: '2.5rem',
  marginBottom: '4rem',
  padding: '2rem',
  borderRadius: '12px',
  background: ...,
  border: `1px solid ${alertColor}30`
}}>
```

### 4. Fix `src/pages/AnalyticsPage.jsx` — KPI Grid Spacing

The `.kpi-grid` on the Analytics page (line 83) currently gets no Tailwind spacing classes because `.kpi-grid` CSS handles it. After removing `gap` and `margin-bottom` from `.kpi-grid` CSS, the grid will have zero spacing.

**Required change (line 83):**

```jsx
<div className="kpi-grid gap-6 mb-16">
```

This applies `gap-6` (1.5rem) instead of the previous `1rem` from CSS, and `mb-16` (4rem) instead of the previous `1.5rem`.

## Verification Steps

1. **Build the CSS** — Run `npx @tailwindcss/cli -i src/index.css -o dist/output.css` or `npm run build` to ensure Tailwind compiles with the new classes.

2. **Check the Dashboard** — Open `http://localhost:5174/`. Verify:
   - The warning banner is full-width, above the KPI grid, with `padding` ~1.5rem inside, `margin-bottom` ~2rem below it to the grid.
   - The 4 metric cards are in a 4-column grid with visible gap between them and margin below.

3. **Check the Analytics page** — Open the Analytics tab. Verify:
   - The AI insight card has generous internal padding (~2rem) and clear margin separation from the grid above (at least 2.5rem) and chart below (at least 4rem).
   - The 4 KPI cards have visible gap between them.

4. **Confirm Tailwind classes are not overridden** — Use browser DevTools to inspect the grid elements. The computed `gap` and `margin-bottom` should come from Tailwind classes (`.gap-6`, `.mb-16`), NOT from `.kpi-grid` in `index.css`. If `.kpi-grid` still shows `gap: 1rem`, the CSS was not properly edited.

5. **Border-radius check** — Confirm the warning banner has `border-radius: 12px` and consistent visual style.

## Summary of All File Changes

| File | Change |
|------|--------|
| `src/index.css` lines 610-614 | Remove `gap: 1rem; margin-bottom: 1.5rem;` from `.kpi-grid` |
| `src/pages/DashboardPage.jsx` | Extract Card 1 as full-width banner above the grid; use `days_to_risk` thresholds for colors/text; add Tailwind spacing to grid |
| `src/pages/AnalyticsPage.jsx` line 83 | Change `<div className="kpi-grid">` to `<div className="kpi-grid gap-6 mb-16">` |
| `src/pages/AnalyticsPage.jsx` lines 175-185 | Increase `marginTop`, `marginBottom`, `padding` values on AI insight card |
