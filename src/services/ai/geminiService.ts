import { supabase } from "../../lib/supabaseClient";

export type IndustrialMode = 'automotive' | 'aerospace' | 'electronics' | 'textile' | 'footwear' | 'pharmaceutical' | 'food' | 'metalworking' | 'medical_devices' | 'energy';

const cleanJSON = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const mroExpertQuery = async (query: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('aero-ai', {
      body: {
        action: 'mro-expert',
        payload: { query }
      }
    });

    if (error) throw error;
    // The model returns JSON as a string in data.result, or we can parse it if needed
    const result = typeof data.result === 'string' ? JSON.parse(cleanJSON(data.result)) : data.result;
    return result;
  } catch (error) {
    console.error("MRO AI Error:", error);
    throw new Error("Failed to analyze maintenance request. Please try again.");
  }
};

export const falconEyeInspection = async (description: string, imageBase64?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('aero-ai', {
      body: {
        action: 'falcon-eye',
        payload: {
          description,
          imageBase64
        }
      }
    });

    if (error) throw error;
    const result = typeof data.result === 'string' ? JSON.parse(cleanJSON(data.result)) : data.result;
    return result;
  } catch (error) {
    console.error("FalconEye AI Error:", error);
    throw new Error("Failed to process inspection. Please check image format/size or API quota.");
  }
};

export const chatWithReport = async (
  analysisContext: string,
  userQuestion: string,
  conversationHistory: { role: string, content: string }[],
  lang: 'es' | 'en',
  mode: IndustrialMode = 'aerospace',
  useSearch: boolean = false
) => {
  try {
    const { data, error } = await supabase.functions.invoke('aero-ai', {
      body: {
        action: 'chat-report',
        payload: {
          analysisContext,
          question: userQuestion,
          history: conversationHistory,
          mode,
          type: 'report',
          useSearch
        }
      }
    });
    if (error) throw error;
    return data.result;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const chatWithHelpDesk = async (
  userQuestion: string,
  conversationHistory: { role: string, content: string }[],
  lang: 'es' | 'en',
  useSearch: boolean = false
) => {
  try {
    const { data, error } = await supabase.functions.invoke('aero-ai', {
      body: {
        action: 'chat-support',
        payload: {
          question: userQuestion,
          history: conversationHistory,
          type: 'support',
          useSearch
        }
      }
    });
    if (error) throw error;
    return data.result;
  } catch (error) {
    console.error("Support Chat Error:", error);
    throw error;
  }
};

export const startVirtualTraining = async (
  topic: string,
  userLevel: 'beginner' | 'intermediate' | 'expert',
  history: any[] = [],
  language: 'es' | 'en' = 'es'
) => {
  try {
    const { data, error } = await supabase.functions.invoke('aero-ai', {
      body: {
        action: 'virtual-trainer',
        payload: {
          topic,
          userLevel,
          history,
          language
        }
      }
    });

    if (error) throw error;
    // Virtual Trainer returns a plain string, not JSON
    // We can just return the result
    return { content: data.result };
  } catch (error) {
    console.error("Virtual Trainer Error:", error);
    throw new Error("Failed to start training session. Connection to AI Core disrupted.");
  }
};

// AGUS PRO: Sistema de Seguridad Centralizado
const keyCache: Record<string, string> = {};

export const getSecureKey = async (keyName: string): Promise<string | null> => {
  if (keyCache[keyName]) return keyCache[keyName];

  try {
    const { data, error } = await supabase
      .from('app_configs')
      .select('config_value')
      .eq('config_key', keyName)
      .single();

    if (error) {
      console.warn(`[Security] Key ${keyName} not found in Supabase:`, error);
      return null;
    }

    if (data?.config_value) {
      keyCache[keyName] = data.config_value;
      return data.config_value;
    }
    return null;
  } catch (err) {
    console.error(`[Security] Error fetching ${keyName}:`, err);
    return null;
  }
};
