
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client
// Ensure API_KEY is set in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to clean JSON
function extractJson(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : text;
}

// Serve static files from the build directory (dist)
app.use(express.static(path.join(__dirname, "dist")));

// Endpoint: Analyze inspection photo
app.post("/analyze-photo", async (req, res) => {
  const { base64Image } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Act as a 5-Star Hotel Safety Auditor. 
            Perform risk stratification, categorize faults, 
            and provide hyper-specific remediation steps. 
            Response MUST be valid JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            category: { type: Type.STRING },
            faultDescription: { type: Type.STRING },
            remediationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["riskLevel", "category", "faultDescription", "remediationSteps"],
        },
      },
    });

    const rawText = response.text || "{}";
    const result = JSON.parse(extractJson(rawText));
    res.json(result);
  } catch (e) {
    console.error("Gemini Analysis Error:", e);
    res.json({
      riskLevel: "LOW",
      category: "Hygiene",
      faultDescription: "Manual review required due to system error.",
      remediationSteps: ["Perform manual inspection", "Sanitize area", "Supervisor follow-up"],
    });
  }
});

// Catch-all route to serve the React app index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
