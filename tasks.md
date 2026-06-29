# Basira App — Tasks

## Completed

- [x] Install `lucide-react` dependency
- [x] Create `ThemeLangProvider.jsx` — React Context for dark/light theme and ar/en language
  - [x] HTML `dir` attribute updates dynamically (rtl/ltr)
  - [x] HTML `lang` attribute updates dynamically
  - [x] `data-theme` attribute on `<html>` for CSS theming
  - [x] Persists preferences to `localStorage`
- [x] Create `Dashboard.jsx` — Main layout with minimalist navbar
  - [x] Sun/Moon toggle icon (lucide-react) for theme
  - [x] AR/EN toggle button for language
  - [x] Glassmorphism navbar with backdrop blur
  - [x] Dashboard cards grid with accent indicators
- [x] Update `index.css` with full design system (dark/light tokens, transitions, RTL)
- [x] Wire `App.jsx` and `main.jsx` with `ThemeLangProvider`
- [x] Verify in browser — all toggles and transitions working
