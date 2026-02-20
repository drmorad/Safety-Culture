# 📋 HotelGuard AI - Deployment Guide

## Prerequisites

Before deploying the application, ensure you have:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **Google Gemini API Key** - [Get your API key from Google AI Studio](https://makersuite.google.com/app/apikey)
- A modern web browser (Chrome, Edge, Safari, or Firefox)

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### 2. Configure Your API Key

**IMPORTANT**: You must set your Gemini API key before the app will work!

1. Open the `.env.local` file in the project root
2. Replace `PLACEHOLDER_API_KEY` with your actual Google Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
VITE_API_KEY=your_actual_api_key_here
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

⚠️ **Security Note**: Never commit your actual API key to version control!

### 3. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

---

## 🏗️ Building for Production

### 1. Build the Application

To create an optimized production build:

```bash
npm run build
```

This will:

- Compile TypeScript to JavaScript
- Bundle and optimize all code
- Generate static files in the `dist` folder

**Note**: If you encounter memory issues during build, run:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"; npm run build
```

### 2. Preview the Production Build

To test the production build locally:

```bash
npm run preview
```

---

## 🌐 Deployment Options

### Option 1: Static Deployment (Recommended for Personal Use)

The app is a **client-side only application** and can be deployed to any static hosting service:

#### **Netlify** (Easiest)

1. Go to [netlify.com](https://www.netlify.com/) and sign up
2. Drag and drop the `dist` folder to Netlify's dashboard
3. Your app will be live in seconds!

**Important**: Before building:

- Update `.env.local` with your API key
- The API keys will be embedded in the build (only use for personal deployment)

#### **Vercel**

```bash
npm install -g vercel
vercel --prod
```

#### **GitHub Pages**

1. Push your code to GitHub
2. Run `npm run build`
3. Deploy the `dist` folder to GitHub Pages

#### **Firebase Hosting**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 2: Full-Stack Deployment (With Backend)

If you want to keep your API key secure on a server:

#### Using the Included Express Server

The project includes `server.js` for backend API key handling.

**Deployment to services like:**

- **Heroku**
- **Railway**
- **Render**
- **Google Cloud Run**

Steps:

1. Set environment variable `API_KEY` on your hosting platform
2. Run: `npm start`

---

## ✅ Functionality Checklist

Before deploying, verify all features work:

### Core Features

- [ ] **Dashboard**: View statistics and risk breakdown
- [ ] **Property Management**: Add, edit, and delete properties
- [ ] **Inspection Form**:
  - [ ] Camera access and photo capture works
  - [ ] File upload works
  - [ ] AI analysis returns results
  - [ ] Save inspection records
- [ ] **Issue Logs**: View, filter, edit, and delete inspection records
- [ ] **Training Center**:
  - [ ] Auto-generate training modules
  - [ ] Manual JSON input for simulations
- [ ] **Auditor Assistant**:
  - [ ] Ask questions about audit data
  - [ ] Receive AI-powered responses
  - [ ] Clear chat history
- [ ] **Dark Mode**: Toggle between light and dark themes
- [ ] **Data Persistence**: Data survives page refresh

### AI Features

All AI features require a valid Gemini API key:

1. **Photo Analysis** - AI analyzes inspection photos and provides:
   - Risk level (High/Medium/Low)
   - Fault category
   - Detailed description
   - Remediation steps

2. **Training Generation** - Creates training modules based on incidents

3. **Audit Assistant** - Answers questions about your inspection data

---

## 🔧 Configuration

### Environment Variables

The app uses these environment variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_API_KEY` | Gemini API key (client-side) | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Alternative key name | ✅ Yes |
| `GEMINI_API_KEY` | Server-side API key | Only for Express server |

### Customization

#### Change Default Locations

Edit `App.tsx` around line 39:

```typescript
const defaultLocations = [
  'Your Location 1', 'Your Location 2', // etc.
];
```

#### Change Default Properties

Edit `App.tsx` around line 45:

```typescript
const defaultProperties = ["Your Property 1", "Your Property 2"];
```

#### Modify Branding

- **App Name**: Search for "HotelGuard" and replace
- **Colors**: Edit `tailwind.config.js` or `constants.tsx`
- **Logo**: Update the "HG" badge in `App.tsx` line 267

---

## 📱 Mobile Usage

The app is fully responsive and works on:

- ✅ Mobile phones (iOS/Android)
- ✅ Tablets
- ✅ Desktop computers

**Camera Features**: The camera functionality works best on:

- Mobile devices (native camera integration)
- Desktop with webcam

---

## 🔒 Security Considerations

### For Personal Use

- **Client-side deployment**: Your API key will be visible in the built code
  - Only use this for personal projects
  - Set API usage limits in Google Cloud Console
  
### For Production/Team Use

- **Use the Express server** (`server.js`)
- Keep API keys in server environment variables
- Never expose API keys in client-side code

---

## 🐛 Troubleshooting

### Build Fails with Memory Error

**Solution**: Increase Node.js memory allocation:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"; npm run build
```

### AI Features Not Working

**Possible causes**:

1. API key not set correctly in `.env.local`
2. API key is invalid or expired
3. API quota exceeded
4. No internet connection

**Solution**: Check browser console (F12) for error messages

### Camera Not Working

**Possible causes**:

1. Browser doesn't have camera permission
2. Camera is being used by another application
3. HTTPS required (camera only works on localhost or HTTPS)

**Solution**:

- Grant camera permissions in browser
- Deploy to HTTPS for production use

### Data Lost After Refresh

This shouldn't happen! Data is stored in localStorage.

**Solutions**:

1. Check if browser is in private/incognito mode
2. Verify localStorage is enabled in browser settings
3. Check browser console for errors

---

## 📊 Performance Optimization

### Tips for Better Performance

1. **Compress Images**: AI works with compressed images, no need for high-res photos
2. **Clean Old Data**: Use Dashboard → Reset System to clear old inspections
3. **Limit Training Modules**: Old modules don't impact performance but can clutter UI

---

## 🎯 Next Steps After Deployment

1. **Test All Features**: Go through the functionality checklist
2. **Create Sample Data**: Log a few test inspections
3. **Test AI Features**: Verify photo analysis and training generation work
4. **Backup Data**: Export important logs (use browser's localStorage inspector)
5. **Monitor API Usage**: Check your Gemini API quota regularly

---

## 💡 Tips for Daily Use

- **Regular Cleanup**: Use the Reset System feature monthly to clear old data
- **Photo Quality**: Good lighting = better AI analysis
- **Consistent Naming**: Use consistent property and location names
- **Training Modules**: Review and regenerate training modules quarterly

---

## 📞 Support

For issues or questions:

1. Check this deployment guide
2. Review the main [README.md](./README.md)
3. Check the browser console for errors
4. Verify your Gemini API key is valid

---

**Ready for deployment! 🚀**

*Last Updated: February 2026*
