
import { GoogleGenAI, Type } from "@google/genai";
import { InspectionRecord, TrainingModule, RiskLevel, FaultCategory } from "../types";

// Initialize Gemini client
// Note: API_KEY is loaded from process.env (Node) or Vite's import.meta.env (Client)
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Fallback for Node.js environments (e.g. testing)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env.API_KEY || process.env.GEMINI_API_KEY;
  }
  return undefined;
};

const apiKey = getApiKey();
if (!apiKey) {
  console.warn("Gemini API Key is missing. Please set VITE_API_KEY or VITE_GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key" });

// Utility Function: Cleans up AI responses by extracting valid JSON from text.
function extractJson(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : text;
}

// 3. Inspection Photo Analysis
// Sends an inspection photo (base64 JPEG) to Gemini.
// AI acts like a hotel safety auditor: Assigns a risk level, Categorizes the fault, Describes the fault technically, Suggests specific corrective steps.
export const analyzeInspectionPhoto = async (base64Image: string): Promise<Partial<InspectionRecord>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: `Act as a 5-Star Hotel Safety Auditor. 
            Perform risk stratification, categorize faults, 
            and provide hyper-specific remediation steps. 
            Assign a risk level (HIGH, MEDIUM, LOW).
            Categorize the fault (Hygiene, Equipment, Infrastructure, Cross-Contamination, Storage).
            Describe the fault technically.
            Suggest 3 specific corrective steps (e.g., exact chemicals, repair methods).
            Response MUST be valid JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: [RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW] },
            category: { type: Type.STRING, enum: [FaultCategory.HYGIENE, FaultCategory.EQUIPMENT, FaultCategory.INFRASTRUCTURE, FaultCategory.CROSS_CONTAMINATION, FaultCategory.STORAGE] },
            faultDescription: { type: Type.STRING },
            remediationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["riskLevel", "category", "faultDescription", "remediationSteps"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(extractJson(text));
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      riskLevel: RiskLevel.LOW,
      category: FaultCategory.HYGIENE,
      faultDescription: "Automated analysis failed. Manual review recommended.",
      remediationSteps: ["Perform manual audit", "Check server connection"]
    };
  }
};

// 4. Training Materials Generator
// Generates 3 training modules based on incidents.
export const generateTrainingMaterials = async (records: InspectionRecord[], propertyName: string): Promise<TrainingModule[]> => {
  try {
    const recentFailures = records
      .filter(r => r.riskLevel === RiskLevel.HIGH || r.riskLevel === RiskLevel.MEDIUM)
      .slice(0, 10)
      .map(r => `${r.category}: ${r.faultDescription}`);

    if (recentFailures.length === 0) return [];

    const prompt = `Based on these recent audit failures at ${propertyName}: ${JSON.stringify(recentFailures)}, generate 3 targeted training modules to address these specific risks. Include Priority (Urgent/Routine).`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              category: { type: Type.STRING, enum: [FaultCategory.HYGIENE, FaultCategory.EQUIPMENT, FaultCategory.INFRASTRUCTURE, FaultCategory.CROSS_CONTAMINATION, FaultCategory.STORAGE] },
              content: { type: Type.STRING },
              lastUpdated: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['Urgent', 'Routine'] }
            },
            required: ["title", "category", "content", "priority"]
          }
        }
      }
    });

    const modules = JSON.parse(extractJson(response.text || '[]'));

    return modules.map((m: any) => ({
      ...m,
      id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toLocaleDateString('en-GB'),
      relatedIncidentsCount: recentFailures.length
    }));
  } catch (error) {
    console.error("Gemini Training Error:", error);
    return [];
  }
};

// 5. Audit Assistant Q&A
// Lets managers ask questions about inspection records.
export const queryAuditDatabase = async (question: string, records: InspectionRecord[]): Promise<string> => {
  try {
    const context = records.map(r =>
      `[${r.inspectionDate}] ${r.propertyName} (${r.location}): ${r.riskLevel} Risk - ${r.faultDescription}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: `System Instruction: You are the HotelGuard Auditor Assistant. 
      Analyze the provided audit logs and answer the user's question.
      Answer in a professional, data-driven format (with bolding and bullet points).
      If the question can’t be answered, clearly say so.
      
      Audit Logs:
      ${context}

      User Question: ${question}`,
    });

    return response.text || "I could not retrieve that information from the logs.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "System error: Unable to process query.";
  }
};
