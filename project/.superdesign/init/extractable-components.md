# Extractable Superdesign components

## Layout

### CustomerAppHeader

- Source: `src/components/Layout.tsx`
- Category: layout
- Description: Sticky customer header with the NeşveNext logo, points balance, theme control, and notifications.
- Extractable props: `points` (number, default 31), `theme` (string, default light), `showNotifications` (boolean, default true)
- Hardcoded: brand mark, icon choices, header labels, border/shadow treatment

### CustomerBottomNav

- Source: `src/components/Layout.tsx`
- Category: layout
- Description: Fixed five-destination mobile navigation with a raised central QR action.
- Extractable props: `activeItem` (string, default qr), `showQr` (boolean, default true), route hrefs
- Hardcoded: Turkish labels, Lucide icons, gradient QR button, spacing and shadows

### DesktopFooter

- Source: `src/components/DesktopFooter.tsx`
- Category: layout
- Description: Desktop customer footer with brand and navigation links.
- Extractable props: navigation URLs
- Hardcoded: logo, labels, legal links, component styling

## Basic

### AppLogo

- Source: `src/components/AppLogo.tsx`
- Category: basic
- Description: Responsive NeşveNext brand logo.
- Extractable props: none; size is presentation-only
- Hardcoded: production logo sources and accessible alt text

### InventoryDetailModal

- Source: `src/components/InventoryDetailModal.tsx`
- Category: basic
- Description: Ticket/reward detail modal opened from the QR page inventory shortcut.
- Extractable props: `isOpen` (boolean, default true)
- Hardcoded: QR code layout, icons, labels, card treatment

### RewardPopup

- Source: `src/components/RewardPopup.tsx`
- Category: basic
- Description: Reward success overlay with points and dismissal action.
- Extractable props: `show` (boolean, default true), `points` (number, default 50)
- Hardcoded: confetti/sticker visuals, colors, action layout

