import { supabase } from '../lib/supabaseClient';

export interface LiveVoiceConfig {
    systemInstruction: string;
    language: 'es' | 'en';
}

export const startLiveVoiceSession = async (config: LiveVoiceConfig) => {
    try {
        const { data, error } = await supabase.functions.invoke('aero-ai', {
            body: {
                action: 'live-voice-init',
                payload: config
            }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Live Voice Init Error:", error);
        throw new Error("Failed to initialize voice session. Please check your connection.");
    }
};

export const sendAudioToLive = async (audioData: string, sessionId: string) => {
    try {
        const { data, error } = await supabase.functions.invoke('aero-ai', {
            body: {
                action: 'live-voice-audio',
                payload: {
                    audioData,
                    sessionId
                }
            }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Live Voice Audio Error:", error);
        throw error;
    }
};
