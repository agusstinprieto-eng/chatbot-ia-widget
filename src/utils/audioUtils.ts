/**
 * Audio processing utilities for Aero IA Pro Live Voice.
 */

export function encode(bytes: Uint8Array): string {
    const binString = String.fromCharCode(...bytes);
    return btoa(binString);
}

export function decode(base64: string): Uint8Array {
    const binString = atob(base64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const float32Data = new Float32Array(data.buffer);
    const audioBuffer = ctx.createBuffer(numChannels, float32Data.length / numChannels, sampleRate);
    for (let i = 0; i < numChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
            channelData[j] = float32Data[j * numChannels + i];
        }
    }
    return audioBuffer;
}

export function downsampleTo16k(buffer: Float32Array, inputSampleRate: number): Int16Array {
    if (inputSampleRate === 16000) {
        return floatTo16BitPCM(buffer);
    }
    const sampleRateRatio = inputSampleRate / 16000;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = Math.min(1, accum / count) * 0x7FFF;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
}

export function createPCM16kBlob(data: Float32Array, inputSampleRate: number): { data: string; mimeType: string } {
    const downsampled = downsampleTo16k(data, inputSampleRate);
    const base64 = encode(new Uint8Array(downsampled.buffer));
    return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000'
    };
}
