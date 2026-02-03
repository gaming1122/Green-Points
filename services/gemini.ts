
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client following guidelines:
// - Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// - Use process.env.API_KEY string directly.
// - Assume API_KEY is pre-configured and accessible.

export async function getSustainabilityInsights(bottlesCount: number) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for basic text analysis tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Calculate the environmental impact of collecting ${bottlesCount} plastic bottles. 
      Provide 3 short bullet points: 
      1. CO2 saved.
      2. Oil saved in production.
      3. A fun comparison (e.g., energy to power a laptop).
      Keep it brief and professional.`,
    });

    // Guideline: Simple and direct way to get generated text content is by accessing the .text property.
    return response.text || "Insights currently unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The neural engine is initializing. Please refresh the analysis in a moment.";
  }
}
