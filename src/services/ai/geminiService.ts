import { GoogleGenerativeAI } from "@google/generative-ai";

// Use Vite-style environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const cleanJSON = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const mroExpertQuery = async (query: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
    systemInstruction: `You are the MRO Expert module of AERO-IA-PRO. 
      Respond with zero ambiguity. 
      If data is missing, state "Reference Manual Required". 
      Always cite a specific Manual Section (e.g., AMM Chapter).
      Identify if special tooling is required.
      Use industry terminology (FOD, MRO, NCR, BOM, Kanban).
      Format the response strictly in the following JSON structure:
      {
        "answer": "The exact technical specification",
        "reference": "Manual Section Reference",
        "tooling": "Required special tooling or 'None'",
        "strategicAdvice": "Efficiency tips from Agustín Prieto"
      }`,
  });

  if (!apiKey) throw new Error("API Key configuration missing (VITE_GEMINI_API_KEY)");

  try {
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("MRO AI Error:", error);
    throw new Error("Failed to analyze maintenance request. Please try again.");
  }
};

export const falconEyeInspection = async (description: string, imageBase64?: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
    systemInstruction: `Analyze visual defects for aerospace components. 
      Cross-reference with AS9100 Rev D standards.
      Identify if the defect is a flight safety risk.
      Generate a professional NCR.
      Return JSON format:
      {
        "isCritical": boolean,
        "ncrText": "Formatted NCR text",
        "standardRef": "AS9100 Rev D Section",
        "actionRequired": "Immediate correction steps"
      }`,
  });

  const prompt = description;
  const parts = [{ text: prompt }];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    } as any);
  }

  if (!apiKey) throw new Error("API Key configuration missing (VITE_GEMINI_API_KEY)");

  try {
    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const response = await result.response;
    const text = response.text();
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("FalconEye AI Error:", error);
    throw new Error("Failed to process inspection. Please check image format/size or API quota.");
  }
};
