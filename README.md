# 🛡️ HotelGuard AI
### **Enterprise-Grade Safety Intelligence & Hygiene Audit Platform**

HotelGuard AI is a high-fidelity, high-security inspection and compliance platform designed for 5-star hospitality brands. It leverages **Gemini 3 Pro** visual intelligence to transform standard hygiene audits into actionable, data-driven remediation protocols.

---

## 🚀 Vision
In the luxury hospitality sector, compliance is not just a checkbox—it is a brand promise. HotelGuard AI eliminates human subjectivity in safety audits by using advanced computer vision to identify risks, generate immediate corrective actions, and dynamically retrain staff based on real-world failure patterns.

---

## ✨ Key Features

### 1. **AI-Powered Visual Evidence Hub**
*   **Hardware Integration**: Advanced camera control engine with real-time **Zoom** (leveraging hardware capabilities) and **Torch/Flash** toggle for low-light storage areas.
*   **Intelligent Analysis**: Powered by `gemini-3-pro-preview`, the system performs deep-tissue analysis of photos to detect microbial hazards, cross-contamination, and infrastructure failures.
*   **Immediate Remediation**: Automatically generates a 3-5 step technical protocol for kitchen and maintenance teams to follow instantly.

### 2. **Audit Command Dashboard**
*   **Risk Stratification**: Real-time breakdown of High, Medium, and Low risk observations.
*   **Performance Matrix**: Complex data visualization via Recharts showing Departmental Failure Rates and Compliance Grades.
*   **Intervention Queue**: A high-priority dashboard for facility managers to monitor critical "High Risk" items that require immediate sign-off.

### 3. **Adaptive Training Hub**
*   **Reactive Learning**: When a "High Risk" incident is logged, the `gemini-3-flash-preview` engine automatically synthesizes a new training module specifically targeting that failure category.
*   **Staff Accountability**: Tracks engagement and "Corporate Performance Scores" based on localized failure data.

### 4. **Enterprise-Grade Reporting**
*   **High-Fidelity Word Export**: Generates professional `.doc` reports including dashboard statistics, incident registries with thumbnails, and official signature sections for Corporate Office filing.
*   **Print-Ready Protocols**: A landscape-optimized print view for physical logbooks and ISO-22000 verification.

---

## 🛠️ Technical Stack

*   **Framework**: React 19 (ESM)
*   **Styling**: Tailwind CSS (Enterprise Design System)
*   **AI Engine**: Google Gemini 3 (Pro & Flash)
*   **Data Viz**: Recharts
*   **Persistence**: Secure LocalStorage for offline-first field capability.
*   **Camera API**: MediaDevices & ImageCapture API with capability sensing.

---

## 📂 Project Structure

```text
├── services/
│   └── geminiService.ts  # Gemini 3 Pro/Flash integration & JSON Schemas
├── components/
│   ├── Sidebar.tsx       # Fold-up Android-style responsive menu
│   ├── Dashboard.tsx     # Performance analytics & Risk Matrix
│   ├── InspectionForm.tsx# Pro-grade camera engine & intake
│   ├── IssueLogs.tsx     # Audit registry & Word export logic
│   └── TrainingCenter.tsx# Reactive educational module generator
├── types.ts              # Strict TypeScript definitions for Audits
└── App.tsx               # Main application controller & state
```

---

## 🔒 Security & Compliance
*   **Data Sovereignty**: All audit evidence is stored locally or transmitted via encrypted channels to the Gemini Enterprise endpoint.
*   **Auditor Accountability**: Multi-auditor selection (Dr. Mourad Saudi, Dr. Mohamed Hassan, Dr. Mohamed Hussien) ensures a clear chain of custody for every observation.
*   **API Integrity**: Uses `process.env.API_KEY` for secure, authorized access to the GenAI reasoning engine.

---

## 📱 Mobile Experience
The platform features an **Android-style "Fold-up" navigation**. The left-sided menu is collapsible to maximize screen real estate for visual evidence capture, ensuring auditors have the best possible view when identifying critical hazards in the field.

---

**Developed by Senior Engineering**  
*Enterprise Safety Series v4.5*