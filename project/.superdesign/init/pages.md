# Page dependency trees

## /qr — QR scanning

Entry: `src/pages/QRScanner.tsx`

Dependencies:

- `src/pages/QRScanner.tsx`
  - `src/context/AppContext.tsx`
    - `src/context/ThemeContext.tsx`
    - `src/context/AuthContext.tsx`
    - `src/context/SystemSettingsContext.tsx`
    - `src/components/AppDataProviders.tsx`
  - `src/context/InventoryContext.tsx`
  - `src/context/AuthContext.tsx`
  - `src/context/SystemSettingsContext.tsx`
  - `src/components/InventoryDetailModal.tsx`
    - `src/components/QRCodeDisplay.tsx`
    - `src/lib/redemptionCode.ts`
    - `src/lib/sounds.ts`
  - `src/components/StickerDecorImg.tsx`
  - `src/components/ModuleDisabledScreen.tsx`
  - `src/lib/stickerCatalog.ts`
  - `src/lib/pageStickers.ts`
  - `src/lib/sounds.ts`
  - `src/lib/qrUtils.ts`
  - `src/services/earn.ts`
  - `src/services/config.ts`
  - `src/lib/activityLogger.ts`
- Shared route shell: `src/components/Layout.tsx`
  - `src/components/AppLogo.tsx`
  - `src/components/DesktopFooter.tsx`
  - `src/components/RewardPopup.tsx`
  - `src/context/AppContext.tsx`
  - `src/context/SystemSettingsContext.tsx`
  - `src/lib/sounds.ts`
  - `src/lib/routePrefetch.ts`
- Global styling: `src/index.css`
- Tailwind theme: `tailwind.config.js`

## /home

Entry: `src/pages/Home.tsx`

Dependencies:

- `src/pages/Home.tsx`
  - `src/components/StickerDecorImg.tsx`
  - `src/components/NeoAvatar.tsx`
  - `src/components/DuoProgressPath.tsx`
  - application contexts and points/reward services
- `src/components/Layout.tsx`
- `src/index.css`

## /shop

Entry: `src/pages/RewardsShop.tsx`

Dependencies:

- `src/pages/RewardsShop.tsx`
  - shop reward hooks, inventory context, sticker components, and reward modals
- `src/components/Layout.tsx`
- `src/index.css`

## /leaderboard

Entry: `src/pages/Leaderboard.tsx`

Dependencies:

- `src/pages/Leaderboard.tsx`
  - `src/components/NeoAvatar.tsx`
  - `src/components/StickerDecorImg.tsx`
  - `src/services/eventLeaderboard.ts`
  - `src/lib/eventDates.ts`
- `src/components/Layout.tsx`
- `src/index.css`

## /profile

Entry: `src/pages/Profile.tsx`

Dependencies:

- `src/pages/Profile.tsx`
  - `src/components/NeoAvatar.tsx`
  - `src/components/LevelBadge.tsx`
  - profile, XP, achievements, and settings contexts/services
- `src/components/Layout.tsx`
- `src/index.css`

## /inventory

Entry: `src/pages/Inventory.tsx`

Dependencies:

- `src/pages/Inventory.tsx`
  - `src/components/InventoryWalletCard.tsx`
  - `src/components/InventoryDetailModal.tsx`
  - `src/context/InventoryContext.tsx`
- `src/components/Layout.tsx`
- `src/index.css`

## /settings/edit-profile

Entry: `src/pages/EditProfile.tsx`

Dependencies:

- `src/pages/EditProfile.tsx`
  - `src/components/AccountPageShell.tsx`
  - `src/components/AvatarEditor.tsx`
    - `src/components/AvatarEditor.css`
    - avatar catalog/generator modules
- `src/components/Layout.tsx`
- `src/index.css`

## /login

Entry: `src/pages/Login.tsx`

Dependencies:

- `src/pages/Login.tsx`
  - `src/components/AuthPageShell.tsx`
  - `src/components/AuthProviders.tsx`
  - `src/components/AppLogo.tsx`
- `src/index.css`

## /register

Entry: `src/pages/Register.tsx`

Dependencies:

- `src/pages/Register.tsx`
  - `src/components/AuthPageShell.tsx`
  - `src/components/AuthProviders.tsx`
  - `src/components/AppLogo.tsx`
  - `src/lib/legalContent.ts`
- `src/index.css`

## /

Entry: `src/pages/LandingPage.tsx`

Dependencies:

- `src/pages/LandingPage.tsx`
  - `src/pages/LandingBelowFold.tsx`
  - `src/pages/landingShared.tsx`
  - landing hero assets and shared brand components
- `src/index.css`

