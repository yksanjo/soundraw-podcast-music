import { z } from 'zod';

export const PODCAST_MOODS = [
  'Happy', 'Peaceful', 'Elegant', 'Hopeful', 'Dreamy', 
  'Romantic', 'Sentimental', 'Smooth', 'Mysterious', 'Epic'
] as const;

export const PODCAST_GENRES = [
  'Acoustic', 'Lofi Hip Hop', 'Ambient', 'Pop', 'Rock', 
  'House', 'Electronica', 'Orchestra', 'Jazz', 'Cinematic'
] as const;

export const PODCAST_THEMES = [
  'Broadcasting', 'Corporate', 'Documentary', 'Technology', 
  'Travel', 'Vlogs', 'Tutorials', 'Nature', 'Drama'
] as const;

export const GeneratePodcastMusicInput = z.object({
  description: z.string().describe('Podcast description or topic'),
  podcast_type: z.enum(['intro', 'outro', 'background', 'jingle']).optional(),
  duration_seconds: z.number().min(10).max(300).optional(),
  mood: z.string().optional(),
  style: z.string().optional(),
  engine: z.enum(['web', 'ios', 'android']).optional(),
  file_format: z.enum(['m4a', 'mp3', 'wav']).optional(),
});

export type GeneratePodcastMusicInput = z.infer<typeof GeneratePodcastMusicInput>;

export interface PodcastMusicResult {
  share_link: string;
  audio_url: string;
  request_id: string;
  duration_seconds: number;
  bpm: number;
  file_format: string;
  integration_code?: string;
  deepseek_reasoning: string;
  soundraw_params: {
    moods: string[];
    genres: string[];
    themes: string[];
    tempo: string;
    energy_profile: string;
  };
}

export interface DeepSeekPodcastParams {
  moods: string[];
  genres: string[];
  themes: string[];
  tempo: 'low' | 'normal' | 'high';
  energy_profile: 'building' | 'steady' | 'climax' | 'ambient';
  reasoning: string;
}
