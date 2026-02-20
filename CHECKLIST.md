# ✅ Pre-Deployment Checklist

Use this checklist before deploying your HotelGuard AI application.

---

## 🔧 Environment Setup

- [ ] Node.js installed (v18+)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file exists
- [ ] Gemini API key obtained from Google AI Studio
- [ ] API key set in `.env.local` (replaced PLACEHOLDER_API_KEY)
- [ ] API usage limits configured in Google Cloud Console

---

## 🏗️ Build Verification

- [ ] Build completes successfully (`npm run build`)
  - No TypeScript errors
  - No build failures
  - `dist` folder created
- [ ] Production preview works (`npm run preview`)
- [ ] No console errors in preview
- [ ] All pages load correctly

---

## ✅ Feature Testing

### Core Features

- [ ] Dashboard displays statistics
- [ ] Can add new properties
- [ ] Can edit properties
- [ ] Can delete properties
- [ ] Dark mode toggle works
- [ ] Mobile menu opens/closes properly

### Inspection Form

- [ ] Camera access works (or gracefully fails)
- [ ] File upload works as alternative
- [ ] Photo preview displays
- [ ] Can select property
- [ ] Can select/add location
- [ ] Can select auditor name
- [ ] Form validation works
- [ ] Save inspection creates record

### AI Features (Requires API Key)

- [ ] Photo analysis returns results
- [ ] Risk level assigned correctly
- [ ] Remediation steps generated
- [ ] Training modules can be generated
- [ ] Auditor Assistant responds to questions
- [ ] Error handling works if API fails

### Issue Logs

- [ ] All inspections display
- [ ] Can filter by status
- [ ] Can edit records
- [ ] Can delete records
- [ ] Status updates work
- [ ] Photos display in logs

### Training Center

- [ ] Can manually generate modules
- [ ] Modules display correctly
- [ ] Priority indicators show
- [ ] Auto-generation triggers on high-risk

### Data Persistence

- [ ] Inspections survive page refresh
- [ ] Chat history preserved
- [ ] Theme preference saved
- [ ] Properties/locations saved
- [ ] All data persists correctly

---

## 🔒 Security Checklist

- [ ] `.gitignore` includes `.env.local`
- [ ] Never committed actual API keys to git
- [ ] API usage limits set in Google Cloud
- [ ] Billing alerts configured (if using paid tier)
- [ ] Understand API key will be in client code (personal use only)
- [ ] Deployment URL will be kept private/internal

---

## 📱 Browser Compatibility

Tested on:

- [ ] Chrome/Edge (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (Desktop)
- [ ] Safari (Mobile - iOS)
- [ ] Firefox (Desktop)

---

## 📊 Performance Checks

- [ ] Initial load < 3 seconds
- [ ] No layout shift on load
- [ ] Camera activates quickly
- [ ] AI analysis completes within 10 seconds
- [ ] No memory leaks (check DevTools)
- [ ] Responsive on all screen sizes

---

## 📝 Documentation Review

- [ ] Read README.md
- [ ] Read DEPLOYMENT_GUIDE.md
- [ ] Read CODE_REVIEW.md
- [ ] Read QUICK_START.md
- [ ] Understand deployment options
- [ ] Know how to troubleshoot common issues

---

## 🚀 Deployment Preparation

### For Netlify (Recommended)

- [ ] Account created at netlify.com
- [ ] `dist` folder ready
- [ ] Know how to drag-and-drop deploy
- [ ] Custom domain ready (optional)

### For Other Platforms

- [ ] Platform account created
- [ ] CLI tools installed (if needed)
- [ ] Deployment commands understood
- [ ] Environment variables configured (if using server)

---

## 📦 Post-Deployment Verification

After deploying, verify:

- [ ] App loads at deployment URL
- [ ] No console errors
- [ ] All navigation works
- [ ] Can create new inspection
- [ ] AI features work (requires API key)
- [ ] Data persists after refresh
- [ ] Works on mobile devices
- [ ] Camera works (HTTPS required)

---

## 🎯 First Use Setup

- [ ] Create initial properties
- [ ] Set up common locations
- [ ] Set auditor name
- [ ] Create sample inspection
- [ ] Test AI analysis
- [ ] Test training generation
- [ ] Test auditor assistant
- [ ] Bookmark deployment URL

---

## 📊 Monitoring Setup

- [ ] Bookmark Google Cloud Console
- [ ] Set up API usage alerts
- [ ] Monitor API quota usage weekly
- [ ] Plan for scaling if needed
- [ ] Backup strategy for important data
- [ ] Know how to export data

---

## 🐛 Troubleshooting Knowledge

Know how to:

- [ ] Check browser console for errors
- [ ] Clear browser cache/localStorage
- [ ] Rebuild application
- [ ] Reset system if needed
- [ ] Contact support/review docs

---

## ✅ Final Pre-Deployment Check

- [ ] All above items checked
- [ ] Confident in deployment process
- [ ] API key properly configured
- [ ] All features tested
- [ ] Documentation reviewed
- [ ] Ready to deploy!

---

## 🚀 Deployment Day Checklist

1. [ ] Final build: `npm run build`
2. [ ] Test preview: `npm run preview`
3. [ ] Deploy `dist` folder
4. [ ] Visit deployment URL
5. [ ] Test all features on live site
6. [ ] Create first real inspection
7. [ ] Bookmark URL
8. [ ] Celebrate! 🎉

---

**When all boxes are checked, you're ready to deploy!**

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0
