# NexReward / NeşveNext design system

## Product and target experience

NexReward is a mobile-first loyalty application for NeşveNext customers. The QR page lets a signed-in customer scan a store or cashier QR code, enter a code manually, and quickly open a usable inventory reward. The interaction should feel fast, trustworthy, and playful, with the camera action as the obvious primary task.

## Visual direction

Preserve the established playful neo-brutalist style. Use chunky near-black outlines, compressed hard shadows, generous rounded corners, pastel blue/lilac surfaces, vivid violet primary actions, lime promotional accents, and sticker-like illustrations. Avoid generic glassmorphism, thin gray borders, corporate minimalism, or introducing a different visual style.

## Typography

- Body/UI: Space Grotesk, system-ui, sans-serif.
- Display/emphasis: Archivo Black with Space Grotesk fallback.
- Use heavy weights (700–900) for headings and actions, 500–700 for supporting labels.
- Mobile body text should remain at least 12px; form inputs should be 16px to avoid iOS zoom.

## Color tokens

Use the CSS variables from `src/index.css` and `tailwind.config.js` as the source of truth:

- Page background: `var(--bg-color)`
- Cards: `var(--card-bg)`
- Main accent: `var(--primary-blue)` and the existing violet `#7c3aed`/`#8b3dff` family where already used
- Primary gradient: `var(--gradient-start)` to `var(--gradient-end)`
- Borders/shadows: `var(--dark-border)`
- Main text: `var(--text-dark)`
- Supporting text: `var(--text-muted)`
- Input surface: `var(--input-bg)`
- Secondary surface: `var(--tab-bg)`
- Inventory highlight: existing lime palette around `#9bea2b`

Dark mode must continue to work through the same variables. Do not hardcode light-only text or surfaces.

## Shape, borders, and shadows

- Major cards: 18–24px radius, 2.5–3px dark border, 4–7px hard shadow.
- Controls: 12–18px radius, 2–3px border, 3–5px hard shadow.
- Pressed state: translate down 2–4px and shorten the shadow by the same amount.
- Avoid stacking multiple bordered containers around the same content; one strong frame per section.

## Spacing and mobile layout

- Design ground truth: 423 × 794 viewport.
- Customer header remains sticky; bottom navigation remains fixed.
- Page content uses 16px side gutters on mobile and must include bottom clearance for navigation.
- Use a compact 8px rhythm: 8, 12, 16, 20, 24, 32.
- Keep the scan action and manual fallback visible with minimal scrolling.
- Interactive targets should be at least 44px tall.

## QR page hierarchy

1. Compact page title and one-line benefit.
2. Single camera/scanner surface with clear idle, loading, active, success, and error states.
3. Primary “Kamerayı Aç & Tara” action integrated with the scanner surface or immediately attached to it.
4. Manual code entry as a secondary but visible fallback.
5. Inventory shortcut as a compact tertiary card with count badge.

Do not let the illustration dominate the viewport. Do not repeat the camera instruction in several places. Keep the primary action legible and unmistakable.

## Motion and accessibility

- Motion is short (120–220ms), tactile, and disabled/reduced under `prefers-reduced-motion`.
- Preserve focus-visible rings and semantic button labels.
- Maintain strong text contrast in both themes.
- Camera permission must only be requested after the user activates the primary camera control.

