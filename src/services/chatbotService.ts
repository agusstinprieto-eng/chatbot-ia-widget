
import { supabase } from "../lib/supabaseClient";

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface ChatbotResponse {
    result: string;
    conversationId?: string;
    metadata?: any;
}

/**
 * AGUS PRO - Centralized Chatbot Service
 * Integrates with the multi-tenant chatbot-ai edge function.
 */
export const chatWithAi = async (
    tenantId: string,
    message: string,
    history: ChatMessage[] = [],
    metadata: any = {}
): Promise<ChatbotResponse> => {
    try {
        const { data, error } = await supabase.functions.invoke('chatbot-ai', {
            body: {
                action: 'chat',
                payload: {
                    message,
                    history,
                    context: {
                        tenantId,
                        source: 'web_chat'
                    }
                },
                metadata: {
                    ...metadata,
                    url: window.location.href,
                    platform: ' AgusPro-Web-v2'
                }
            }
        });

        if (error) {
            console.error(`[ChatbotService] Error invoking chatbot-ai for ${tenantId}:`, error);
            throw error;
        }

        // Normalize response (handle 'result' vs 'text' from different Edge Function versions)
        const normalizedResult = data?.result || data?.text || '';
        
        return {
            ...data,
            result: normalizedResult
        };
    } catch (error) {
        console.error(`[ChatbotService] Critical error in chatWithAi:`, error);
        throw error;
    }
};
