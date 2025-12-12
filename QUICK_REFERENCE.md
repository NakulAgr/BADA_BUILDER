# 🚀 Quick Reference Guide

## Essential Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Git Setup
```bash
./setup-git.bat      # Windows
./setup-git.sh       # Linux/Mac
```

---

## 🔑 Key URLs

- **Local Dev**: http://localhost:5173/
- **Firebase Console**: https://console.firebase.google.com/
- **Project ID**: badabuilder-64565

---

## 📁 Important Files

### Configuration
- `vite.config.js` - Vite configuration
- `package.json` - Dependencies
- `src/firebase.jsx` - Firebase config

### Core Components
- `src/App.jsx` - Main app & routing
- `src/context/AuthContext.jsx` - Authentication
- `src/components/Header/Header.jsx` - Navigation
- `src/components/LeadModal/LeadModal.jsx` - Lead generation
- `src/components/UserTypeModal/UserTypeModal.jsx` - User type selection

### Key Pages
- `src/pages/Login.jsx` - Authentication
- `src/pages/PostProperty.jsx` - Property posting
- `src/pages/SubscriptionPlans.jsx` - Pricing
- `src/pages/Services.jsx` - Services
- `src/pages/BookSiteVisit.jsx` - Booking

---

## 🗄️ Database Collections

1. **users** - User profiles & subscriptions
2. **leads** - Lead generation data
3. **properties** - Property listings
4. **bookings** - Site visit bookings

---

## 🎨 Design Tokens

### Colors
```css
Primary:   #58335e  /* Purple */
Secondary: #16a34a  /* Green */
Accent:    #2563eb  /* Blue */
Premium:   #fbbf24  /* Gold */
```

### Breakpoints
```css
Mobile:  < 640px
Tablet:  640-1024px
Desktop: > 1024px
```

---

## 🔐 User Flows

### New User
1. Visit site → Lead modal
2. Register → Login
3. Subscribe → Post property

### Returning User
1. Login
2. Browse properties
3. Book site visit

---

## 🧪 Quick Test

```bash
# 1. Start server
npm run dev

# 2. Open browser
http://localhost:5173/

# 3. Test features
- Wait for lead modal
- Register new user
- Subscribe to plan
- Post property
- Book site visit
```

---

## 📞 Quick Troubleshooting

### Modal not appearing?
- Clear session storage
- Use incognito mode

### Can't post property?
- Check if logged in
- Check subscription status

### Build errors?
- Run `npm install`
- Check Node version (18+)

---

## 📚 Documentation

- **Full Docs**: PROJECT.md
- **Analysis**: ANALYSIS_SUMMARY.md
- **This Guide**: QUICK_REFERENCE.md
