import { logger } from '../utils/logger.js';

const SOUNDRAW_API_BASE_URL = 'https://soundraw.io/api/v3';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150;

function getApiKey(): string {
  const apiKey = process.env.SOUNDRAW_API_KEY;
  if (!apiKey) throw new Error('SOUNDRAW_API_KEY environment variable is required');
  return apiKey;
}

function getHeaders(): Record<string, string> {
  return { 'Authorization': `Bearer ${getApiKey()}`, 'Content-Type': 'application/json' };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface SoundrawComposeResponse { request_id: string; }

interface SoundrawResultResponse {
  request_id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  result?: {
    share_link: string; m4a_url: string; mp3_url: string; wav_url: string;
    length: number; bpm: string;
    timestamps: Array<{ start: number; end: number; energy: string }>;
  };
}

async function pollForResult(requestId: string): Promise<SoundrawResultResponse> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(`${SOUNDRAW_API_BASE_URL}/results/${requestId}`, {
      method: 'GET', headers: getHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Soundraw API error: ${response.status} - ${errorText}`);
    }
    const result = await response.json() as SoundrawResultResponse;
    if (result.status === 'done' && result.result) return result;
    if (result.status === 'failed') throw new Error(`Soundraw generation failed: ${requestId}`);
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Timeout waiting for Soundraw result: ${requestId}`);
}

function getAudioUrl(result: SoundrawResultResponse['result'], format: string): string {
  if (!result) throw new Error('No result available');
  switch (format) {
    case 'wav': return result.wav_url || '';
    case 'mp3': return result.mp3_url || '';
    case 'm4a':
    default: return result.m4a_url || result.mp3_url || result.wav_url || '';
  }
}

export interface ComposeParams {
  moods: string[]; genres: string[]; themes: string[]; length: number;
  energy?: string; tempo?: string; file_format?: string[];
}

export async function composePodcast(params: ComposeParams) {
  logger.info('Composing podcast music', { length: params.length, moods: params.moods });
  const requestBody = {
    moods: params.moods, genres: params.genres, themes: params.themes,
    length: params.length, energy: params.energy || 'steady', tempo: params.tempo || 'normal',
    file_format: params.file_format || ['m4a'],
  };
  const response = await fetch(`${SOUNDRAW_API_BASE_URL}/musics/compose`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Soundraw API error: ${response.status} - ${errorText}`);
  }
  const { request_id } = await response.json() as SoundrawComposeResponse;
  const result = await pollForResult(request_id);
  return { result, format: params.file_format?.[0] || 'm4a' };
}

export function extractResult(soundrawResult: SoundrawResultResponse, format: string) {
  if (!soundrawResult.result) throw new Error('No result in Soundraw response');
  const { result } = soundrawResult;
  return {
    share_link: result.share_link, audio_url: getAudioUrl(result, format),
    request_id: soundrawResult.request_id, duration_seconds: result.length,
    bpm: parseInt(result.bpm, 10), timestamps: result.timestamps,
  };
}
