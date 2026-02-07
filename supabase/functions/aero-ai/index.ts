import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { action, payload } = body;
        console.log(`Aero AI Action: ${action}`);

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) throw new Error("GEMINI_API_KEY non-configured.");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { temperature: 0.1, topP: 1.0, topK: 1 }
        });

        if (action === "mro-expert") {
            const { query } = payload || {};
            const mroModel = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" },
                systemInstruction: `You are the MRO Expert module of AERO-IA-PRO. 
          Respond with zero ambiguity. 
          Always cite a specific Manual Section (e.g., AMM Chapter).
          Identify if special tooling is required.
          Format the response strictly in the following JSON structure:
          {
            "answer": "string",
            "reference": "string",
            "tooling": "string",
            "strategicAdvice": "string"
          }`,
            });

            const result = await mroModel.generateContent(query);
            return new Response(JSON.stringify({ result: result.response.text() }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        if (action === "falcon-eye") {
            const { description, imageBase64 } = payload || {};
            const visionModel = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" },
                systemInstruction: `Analyze visual defects for aerospace components. 
          Cross-reference with AS9100 Rev D standards.
          Identify if the defect is a flight safety risk.
          Generate a professional NCR.
          Return JSON format:
          {
            "isCritical": boolean,
            "ncrText": "string",
            "standardRef": "string",
            "actionRequired": "string"
          }`,
            });

            const parts: any[] = [{ text: description }];
            if (imageBase64) {
                parts.push({
                    inlineData: { mimeType: "image/jpeg", data: imageBase64 }
                });
            }

            const result = await visionModel.generateContent({ contents: [{ role: "user", parts }] });
            return new Response(JSON.stringify({ result: result.response.text() }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        if (action === "chat-report" || action === "chat-support") {
            const { question, history = [], analysisContext, mode } = payload || {};
            if (!question) throw new Error("Missing question");

            const systemPrompt = `Eres un experto en ingeniería aeroespacial y manufactura avanzada (Estándar AS9100 Rev D). 
      Operas en el entorno AERO IA PRO. Tu tono es técnico, preciso y estratégico.
      
      CONTEXTO ACTUAL: ${analysisContext || "Aero IA Pro Main Environment"}.
      MODO OPERATIVO: ${mode || "Aerospace Analyst"}.
      
      REGLAS DE FORMATO CRÍTICAS:
      1. Para resaltar conceptos, términos técnicos o títulos, usa negritas con un SOLO asterisco: *Concepto*. 
      2. No uses doble asterisco (**).
      3. Mantén una estructura limpia con viñetas claras.`;

            const formattedHistory = (history || []).map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content || "" }]
            }));

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: "Protocolo de análisis AERO_IA activado. Listo para la consulta." }] },
                    ...formattedHistory
                ]
            });

            const result = await chat.sendMessage(question);
            return new Response(JSON.stringify({ result: result.response.text() }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
