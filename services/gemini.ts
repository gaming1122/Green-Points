
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure API_KEY in Vercel environment variables.");
  }
  return new GoogleGenAI({ apiKey });
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
    return response.text || "Insights currently unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The neural engine is initializing. Please refresh the analysis in a moment.";
  }
}
