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

        if (action === "virtual-trainer") {
            console.log("Starting virtual-trainer action");
            const { topic, userLevel, history = [], language = 'es' } = payload || {};
            console.log(`Topic: ${topic}, Level: ${userLevel}, Language: ${language}, History Length: ${history.length}`);

            const systemPrompt = language === 'es'
                ? `Eres el Entrenador Virtual de AERO IA PRO.
            TEMA: ${topic}
            NIVEL DEL USUARIO: ${userLevel}
            
            OBJETIVO: Entrenar al usuario en este tema específico de aeroespacial.
            METODOLOGÍA:
            1. Explicaciones cortas y concisas (máximo 3 oraciones).
            2. Hacer una pregunta de verificación para confirmar comprensión.
            3. Si el usuario es EXPERTO, usar jerga técnica y referenciar cláusulas AS9100.
            4. Si es PRINCIPIANTE, explicar conceptos de forma simple.
            5. Mantener un tono profesional, alentador como instructor.
            
            IMPORTANTE: Responde SIEMPRE en español.`
                : `You are the AERO IA PRO Virtual Trainer.
            TOPIC: ${topic}
            USER LEVEL: ${userLevel}
            
            GOAL: Train the user on this specific aerospace topic. 
            METHODOLOGY:
            1. Short, concise explanations (max 3 sentences).
            2. Follow up with a checking question to verify understanding.
            3. If user is EXPERT, use technical jargon and reference AS9100 clauses.
            4. If BEGINNER, explain concepts simply.
            5. Maintain a professional, encouraging instructor tone.
            
            IMPORTANT: Always respond in English.`;

            const validHistory = history.map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content || "" }]
            }));

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: `Training module for ${topic} initialized. Ready to instruct.` }] },
                    ...validHistory
                ]
            });

            console.log("Chat session started");

            // If history is empty, the first message comes from the UI as a hidden "start" prompt or we just wait for user input?
            // In the UI component, I send the first message as 'model'. 
            // Better to let the UI drive the conversation.
            // If the last message in history is from user, we generate response.

            const lastUserMessage = validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user'
                ? validHistory[validHistory.length - 1].parts[0].text
                : "Hello, I am ready to start training.";

            // Actually, in geminiService.ts, I append the new user message to 'history' before calling this?
            // checking geminiService.ts: 
            // startVirtualTraining(topic, level, [...history, { role: 'user', content: input }]);
            // So the last item in history provided to this function IS the user's latest input.
            // But 'history' passed here is ALL messages. 
            // 'model.startChat' expects history EXCLUDING the latest message, which is sent via 'sendMessage'.

            // Correction:
            // validHistory currently contains ALL messages including the one we often want to send.
            // I should pop the last message if it is from 'user' and use it as the argument for sendMessage.

            let messageToSend = "Start training";
            let chatHistory = [...validHistory];

            if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
                messageToSend = chatHistory.pop().parts[0].text;
            }

            const chatSession = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: `Training module ${topic} loaded.` }] },
                    ...chatHistory
                ]
            });

            console.log(`Sending message to model: ${messageToSend}`);
            const result = await chatSession.sendMessage(messageToSend);
            console.log("Model response received");
            return new Response(JSON.stringify({ result: result.response.text() }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("Aero AI Edge Function Error:", err);
        return new Response(
            JSON.stringify({
                error: err instanceof Error ? err.message : "Unknown error occurred",
                details: String(err)
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
