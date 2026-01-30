
import { GoogleGenAI } from "@google/genai";

// We create a factory to ensure we always have the latest API key from the environment
const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("Missing Gemini API Key. Please configure API_KEY in Vercel environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getSustainabilityInsights(bottlesCount: number) {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Calculate the environmental impact of collecting ${bottlesCount} plastic bottles. 
      Provide 3 short bullet points: 
      1. CO2 saved.
      2. Oil saved in production.
      3. A fun comparison (e.g., energy to power a laptop).
      Keep it brief and professional.`,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Production Error:", error);
    return "The neural engine is currently re-calibrating. Please check back shortly.";
  }
}
