import { analyzePodcastDescription } from '../services/deepseek.js';
import { composePodcast, extractResult } from '../services/soundraw.js';
import { getPodcastIntegrationCode } from '../prompts/integration.js';
import type { GeneratePodcastMusicInput, PodcastMusicResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

export async function generatePodcastMusic(input: GeneratePodcastMusicInput): Promise<PodcastMusicResult> {
  logger.info('Generating podcast music', { description: input.description, type: input.podcast_type });

  const podcastParams = await analyzePodcastDescription(
    input.description,
    input.podcast_type,
    input.mood
  );

  const duration = input.duration_seconds || 60;
  const { result, format } = await composePodcast({
    moods: podcastParams.moods,
    genres: podcastParams.genres,
    themes: podcastParams.themes,
    length: duration,
    energy: podcastParams.energy_profile,
    tempo: podcastParams.tempo,
    file_format: input.file_format ? [input.file_format] : undefined,
  });

  const extracted = extractResult(result, format);
  const musicType = input.podcast_type || 'background';
  const integrationCode = getPodcastIntegrationCode(input.engine, extracted.audio_url, musicType);

  return {
    share_link: extracted.share_link,
    audio_url: extracted.audio_url,
    request_id: extracted.request_id,
    duration_seconds: extracted.duration_seconds,
    bpm: extracted.bpm,
    file_format: format,
    integration_code: integrationCode,
    deepseek_reasoning: podcastParams.reasoning,
    soundraw_params: {
      moods: podcastParams.moods,
      genres: podcastParams.genres,
      themes: podcastParams.themes,
      tempo: podcastParams.tempo,
      energy_profile: podcastParams.energy_profile,
    },
  };
}
