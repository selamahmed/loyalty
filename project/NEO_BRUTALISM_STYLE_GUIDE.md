# Neo-Brutalism (Cartoonish) Style Guide

This document provides all the CSS variables, patterns, and component styling rules for the NexReward platform's playful Neo-Brutalism design.

## CSS Color Variables

### Light Mode (Default)
```css
:root {
  --bg-color: #f0f6ff;
  --card-bg: #ffffff;
  --primary-blue: #4d90ff;
  --gradient-start: #8ebbff;
  --gradient-end: #357ae8;
  --dark-border: #0b0c10;
  --text-dark: #1a1e29;
  --text-muted: #5c6475;
  --input-bg: #ffffff;
  --tab-bg: #e2eeff;
  --divider-dash: #cbdfff;
}
```

### Dark Mode (`[data-theme="dark"]`)
```css
[data-theme="dark"] {
  --bg-color: #0d111a;
  --card-bg: #161b26;
  --primary-blue: #3a7be0;
  --gradient-start: #5191f5;
  --gradient-end: #2563c4;
  --dark-border: #000000;
  --text-dark: #ffffff;
  --text-muted: #94a1b8;
  --input-bg: #1f2635;
  --tab-bg: #0f141f;
  --divider-dash: #38445a;
}
```

## Typography
- **Font Family:** `Fredoka` (sans-serif)
- **Font Weights:** 400 (regular), 600 (semibold), 700 (bold), 800+ (black)
- **All Transitions:** `transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;`

## Component Patterns

### Cards & Containers
```jsx
<div
  className="card"
  style={{
    backgroundColor: 'var(--card-bg)',
    border: '3px solid var(--dark-border)',
    borderRadius: '32px',
    boxShadow: '0px 8px 0px var(--dark-border)',
  }}
/>
```

### Primary Buttons
```jsx
<button
  className="btn-primary"
  style={{
    background: 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
    color: 'white',
    fontWeight: '700',
    border: '2.5px solid var(--dark-border)',
    borderRadius: '16px',
    padding: '0.75rem 1.5rem',
    boxShadow: '0px 5px 0px var(--dark-border)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  }}
  onClick={() => {}}
>
  Click Me
</button>
```

**On :active state:**
```jsx
// Apply via JS or CSS
style={{
  transform: 'translateY(3px)',
  boxShadow: '0px 2px 0px var(--dark-border)',
}}
```

### Secondary Buttons
```jsx
<button
  className="btn-secondary"
  style={{
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-dark)',
    fontWeight: '600',
    border: '2.5px solid var(--dark-border)',
    borderRadius: '16px',
    padding: '0.75rem 1.5rem',
    boxShadow: '0px 5px 0px var(--dark-border)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  }}
>
  Secondary
</button>
```

**On :hover state:**
```jsx
style={{ backgroundColor: 'var(--tab-bg)' }}
```

### Input Fields
```jsx
<input
  className="input-field"
  style={{
    width: '100%',
    backgroundColor: 'var(--input-bg)',
    border: '2.5px solid var(--dark-border)',
    borderRadius: '16px',
    padding: '0.75rem 1rem',
    color: 'var(--text-dark)',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: '1rem',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  }}
  placeholder="Enter text..."
/>
```

**On :focus state:**
```jsx
style={{
  transform: 'translateY(-2px)',
  boxShadow: '0px 4px 0px var(--dark-border)',
  borderColor: 'var(--primary-blue)',
}}
```

### Badges
```jsx
<span
  className="badge"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '2px solid var(--dark-border)',
    backgroundColor: 'var(--tab-bg)',
    color: 'var(--text-dark)',
  }}
>
  Badge
</span>
```

### Dividers
```jsx
<div
  style={{
    borderBottom: '2.5px dashed var(--divider-dash)',
  }}
/>
```

## Common Patterns

### Hero Section with Gradient
```jsx
<div
  style={{
    background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
    border: '3px solid var(--dark-border)',
    borderRadius: '32px',
    boxShadow: '0px 8px 0px var(--dark-border)',
    color: 'white',
    padding: '2rem',
  }}
>
  {/* Content */}
</div>
```

### Tab Navigation
```jsx
<div
  style={{
    display: 'flex',
    background: 'var(--tab-bg)',
    borderRadius: '16px',
    border: '2.5px solid var(--dark-border)',
    padding: '0.25rem',
  }}
>
  <div
    className="tab-indicator"
    style={{
      position: 'absolute',
      top: '0.25rem',
      bottom: '0.25rem',
      width: 'calc(50% - 0.25rem)',
      borderRadius: '0.75rem',
      background: 'white',
      border: '2.5px solid var(--dark-border)',
      boxShadow: '0px 2px 0px var(--dark-border)',
      transition: 'transform 0.2s ease',
    }}
  />
  <button className="relative z-10 flex-1">Tab 1</button>
  <button className="relative z-10 flex-1">Tab 2</button>
</div>
```

### Modal/Popup
```jsx
<div
  style={{
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: 'rgba(11, 12, 16, 0.6)',
    backdropFilter: 'blur(4px)',
  }}
>
  <div
    className="card animate-bounce-in"
    style={{
      background: 'var(--card-bg)',
      border: '3px solid var(--dark-border)',
      borderRadius: '32px',
      boxShadow: '0px 8px 0px var(--dark-border)',
      maxWidth: '28rem',
      width: '100%',
      padding: '2rem',
    }}
  >
    {/* Modal Content */}
  </div>
</div>
```

## Implementation Tips

1. **Always use CSS variables** for colors instead of hardcoding hex values
2. **Apply transitions** to all interactive elements
3. **Use border-radius: 16px** for buttons and inputs, **32px** for cards
4. **Box shadows** should always use `var(--dark-border)` for consistency
5. **Text colors** should use `var(--text-dark)` for primary text, `var(--text-muted)` for secondary
6. **Hover/Active states** reduce box shadow and/or apply transforms
7. **All buttons** should use the gradient or solid background with borders and shadows
8. **Borders** should be `2.5px` for inputs/buttons, `3px` for cards
9. **Import Font:** Already imported in index.css as `Fredoka`
10. **Apply data-theme:** The theme system uses `document.documentElement.setAttribute('data-theme', 'dark')`

## Example: Complete Card Component

```jsx
<div
  className="card"
  style={{
    backgroundColor: 'var(--card-bg)',
    border: '3px solid var(--dark-border)',
    borderRadius: '32px',
    boxShadow: '0px 8px 0px var(--dark-border)',
    padding: '1.5rem',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  }}
>
  <h3 style={{ color: 'var(--text-dark)', fontWeight: 'black' }}>Card Title</h3>
  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Card description</p>
  
  <button
    className="btn-primary"
    style={{
      marginTop: '1rem',
      width: '100%',
      background: 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
      color: 'white',
      border: '2.5px solid var(--dark-border)',
      borderRadius: '16px',
      padding: '0.75rem 1.5rem',
      boxShadow: '0px 5px 0px var(--dark-border)',
      fontWeight: '700',
      cursor: 'pointer',
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = 'translateY(3px)';
      e.currentTarget.style.boxShadow = '0px 2px 0px var(--dark-border)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0px 5px 0px var(--dark-border)';
    }}
  >
    Click Me
  </button>
</div>
```

## Files Already Updated

- ✅ `src/index.css` — Global styles and CSS variables
- ✅ `src/tailwind.config.js` — Tailwind configuration with new color variables
- ✅ `src/context/AppContext.tsx` — Theme switching with data-theme
- ✅ `src/components/Layout.tsx` — Sidebar, header, and navigation
- ✅ `src/components/RewardPopup.tsx` — Popup styling
- ✅ `src/pages/Login.tsx` — Auth page
- ✅ `src/pages/Register.tsx` — Auth page
- ✅ `src/pages/Home.tsx` — Homepage

## Pages to Update (Following the same pattern)

- Profile.tsx
- Inventory.tsx
- RewardsShop.tsx
- MiniGames.tsx
- ProgressPath.tsx
- QRScanner.tsx
- RedeemPoints.tsx
- Achievements.tsx
- Missions.tsx
- Notifications.tsx
- History.tsx
- Settings.tsx
- Support.tsx
- SeasonalEvents.tsx
- Leaderboard.tsx
- UserStats.tsx
- All Admin pages

Use the Home.tsx example as a reference when updating other pages. Replace all hardcoded colors with CSS variables and apply the shadow/border/radius patterns consistently.
