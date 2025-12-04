# 🔑 Key Timer Tracker - Online Edition

Track license keys expiration time with real-time countdown. Built with Firebase Realtime Database + PWA.

## 🚀 Features

- ✅ Real-time countdown timer
- ✅ Multiple accounts management
- ✅ Cloud sync via Firebase
- ✅ PWA - Install to desktop/mobile
- ✅ Offline support
- ✅ Export/Import JSON backup
- ✅ Auto-delete expired keys
- ✅ Responsive design

---

## 📦 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: Firebase Realtime Database
- **Hosting**: Vercel
- **PWA**: Service Worker for offline support

---

## 🔧 Setup Guide

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/key-timer-tracker.git
cd key-timer-tracker
```

### Step 2: Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `key-timer-tracker`
4. Disable Google Analytics (optional)
5. Click **Create Project**

#### Enable Realtime Database:
1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose location (asia-southeast1 for Indonesia)
4. Start in **Test Mode** (we'll secure it later)
5. Click **Enable**

#### Get Firebase Config:
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web icon** (</>) to add web app
4. Register app with nickname: "Key Timer Web"
5. Copy the `firebaseConfig` object

#### Update Config in Code:
Open `public/index.html`, find this section and replace:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",  // Ganti ini
    authDomain: "your-project.firebaseapp.com",  // Ganti ini
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",  // Ganti ini
    projectId: "your-project",  // Ganti ini
    storageBucket: "your-project.appspot.com",  // Ganti ini
    messagingSenderId: "123456789",  // Ganti ini
    appId: "1:123456789:web:abc123def456"  // Ganti ini
};
```

### Step 3: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Key Timer Tracker"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/key-timer-tracker.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Via Website (Easiest)
1. Go to [vercel.com](https://vercel.com/)
2. Sign up with GitHub
3. Click **Add New** → **Project**
4. Import your `key-timer-tracker` repository
5. Leave settings as default
6. Click **Deploy**
7. Wait 1-2 minutes
8. Done! Your app is live at `https://your-app.vercel.app`

#### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? key-timer-tracker
# - Directory? ./
# - Override settings? No

# Production deploy
vercel --prod
```

### Step 5: Secure Firebase (Important!)

By default, anyone can read/write your database. Let's fix that:

1. In Firebase Console → Realtime Database → **Rules** tab
2. Replace with these rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**For production** (with authentication):
```json
{
  "rules": {
    "accounts": {
      ".read": true,
      ".write": true
    },
    "keys": {
      ".read": true,
      ".write": true,
      "$keyId": {
        ".validate": "newData.hasChildren(['id', 'account', 'name', 'createdAt', 'expiresAt', 'duration'])"
      }
    }
  }
}
```

3. Click **Publish**

---

## 🎮 Usage

### Add Account
1. Type account name (e.g., "Main", "Alt")
2. Click **Tambah**

### Add Key
1. Select account from dropdown
2. Enter license key
3. Choose duration (24h, 48h, or custom)
4. Click **Tambah Key**

### Features
- **Filter by account**: Click account buttons to filter
- **Export**: Download backup JSON
- **Import**: Upload JSON to restore
- **Delete expired**: Bulk delete all expired keys
- **Clear all**: Reset everything

---

## 📱 Install as PWA

### Desktop (Chrome/Edge):
1. Visit your Vercel URL
2. Click install icon (➕) in address bar
3. Click **Install**

### Mobile (Android):
1. Open in Chrome
2. Tap menu (⋮) → **Add to Home Screen**

### Mobile (iOS):
1. Open in Safari
2. Tap share icon (⬆️)
3. Tap **Add to Home Screen**

---

## 🔄 Update Deployed App

```bash
# Make changes to code
git add .
git commit -m "Update feature X"
git push

# Vercel auto-deploys on push!
# Or manually:
vercel --prod
```

---

## 🐛 Troubleshooting

### Firebase not connecting
- Check if `firebaseConfig` is correctly pasted
- Check browser console for errors
- Verify database URL ends with `.firebaseio.com`

### Data not saving
- Check Firebase Rules (should allow write)
- Check browser console for permission errors
- Try disabling ad blockers

### PWA not installing
- Must use HTTPS (Vercel provides this)
- Check if `manifest.json` is accessible
- Check service worker registration in DevTools

### Vercel deployment failed
- Check `vercel.json` syntax
- Ensure all files are committed to git
- Check Vercel build logs for errors

---

## 📊 Firebase Data Structure

```json
{
  "accounts": ["erediumz", "vxxdzzz", "vrstlzz"],
  "keys": {
    "1764757387057": {
      "id": 1764757387057,
      "account": "erediumz",
      "name": "igREMyxIJAvRkiIemTCtZYKbVLBEfjWY",
      "createdAt": "2025-12-03T10:23:07.057Z",
      "expiresAt": "2025-12-03T18:36:07.057Z",
      "duration": 8.216666666666667
    }
  }
}
```

---

## 💰 Costs

**100% FREE** for normal usage:
- Firebase: 1GB storage, 10GB/month bandwidth
- Vercel: 100GB bandwidth/month
- No credit card required!

---

## 🔐 Security Notes

- Current setup allows public read/write (fine for personal use)
- For production with multiple users, implement Firebase Authentication
- Don't store sensitive data in keys

---

## 📝 License

MIT License - Do whatever you want!

---

## 🤝 Contributing

Pull requests welcome! For major changes, open an issue first.

---

## 👨‍💻 Author

Built with ❤️ by [Your Name]

---

## 🔗 Links

- Live Demo: `https://your-app.vercel.app`
- GitHub: `https://github.com/YOUR_USERNAME/key-timer-tracker`
- Firebase Console: `https://console.firebase.google.com/`

---

## 📸 Screenshots

*(Add screenshots here after deploy)*

---

**Enjoy tracking your keys! 🔑⏰**