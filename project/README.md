# Loyalty Web - GitHub Pages Deployment Edition

A comprehensive loyalty program web application built with React, TypeScript, and Vite.

## 🚀 Quick Deployment Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build your React app
- Push the build to the `gh-pages` branch
- Make your app accessible online

### 3. Enable GitHub Pages
1. Go to your repository **Settings** → **Pages**
2. Set **Source** to "Deploy from a branch"
3. Select the `gh-pages` branch
4. Click **Save**

### 4. Access Your App
Your deployed application will be available at:
```
https://Parasayte.github.io/loyaltyweb/
```

---

## 📋 Available Scripts

- `npm run dev` - Start development server (localhost:5173)
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to GitHub Pages
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

---

## ⚙️ Configuration for GitHub Pages

✅ **Vite Config** - Base path set to `/loyaltyweb/`
✅ **Router** - Uses HashRouter for client-side routing (URLs include `#`)
✅ **Build Output** - Configured to output to `dist/` folder
✅ **Deploy Script** - Automatic deployment using `gh-pages`

---

## 🎯 Features

- **Loyalty Program Management** - Track user points and rewards
- **User Authentication** - Secure login and registration
- **Points & Rewards System** - Earn and redeem points
- **Admin Dashboard** - Manage users, rewards, and analytics
- **QR Code Scanning** - Scan QR codes to earn points
- **Mini Games** - Interactive games for engagement
- **Leaderboards** - Competitive rankings
- **User Analytics** - Track user statistics
- **Seasonal Events** - Time-limited special events
- **Notifications** - Real-time user notifications

---

## 🛠️ Tech Stack

- **React** 18.3.1 - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** 5.4.2 - Fast build tool
- **React Router** 7.15.1 - Client-side routing
- **TailwindCSS** - Utility-first CSS
- **Supabase** - Backend services
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library
- **ESLint** - Code quality

---

## 📦 Dependencies

### Main Dependencies
```json
{
  "@supabase/supabase-js": "^2.57.4",
  "lucide-react": "^0.344.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.15.1",
  "recharts": "^3.8.1"
}
```

### Dev Dependencies
- Vite and related plugins
- TypeScript and ESLint
- Tailwind CSS and PostCSS
- gh-pages for deployment

---

## 🔍 Important Notes

### HashRouter vs BrowserRouter
This app uses **HashRouter** instead of BrowserRouter. This means:
- Routes include `#` in the URL (e.g., `/#/profile` instead of `/profile`)
- This is required for GitHub Pages to work properly with client-side routing
- It works seamlessly - users won't notice the difference

### Base Path
All assets and routes are configured with the base path `/loyaltyweb/`. This is automatically handled by Vite, so you don't need to manually adjust links.

---

## 🚨 Troubleshooting

### App loads but routes don't work
- Verify that HashRouter is being used in `src/App.tsx` ✓
- Check that `base: '/loyaltyweb/'` is set in `vite.config.ts` ✓

### Deploy fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run typecheck`
- Ensure you have push permissions on the repository

### GitHub Pages not showing
- Wait 1-2 minutes after first deploy
- Check that the `gh-pages` branch exists in your repository
- Verify Settings → Pages shows the `gh-pages` branch as the source

---

## 📝 Local Development

To test the app locally before deploying:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 🤝 Contributing

This is a personal project. For questions about the deployment setup, refer to this README.

---

## 📄 License

This project is private and personal.

---

**Last Updated**: June 5, 2026
**Deployment Ready**: ✅ Yes
