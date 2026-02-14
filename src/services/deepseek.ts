import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { PODCAST_MOODS, PODCAST_GENRES, PODCAST_THEMES } from '../types/index.js';
import type { DeepSeekPodcastParams } from '../types/index.js';

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY environment variable is required');
    client = new OpenAI({ apiKey, baseURL: DEEPSEEK_BASE_URL });
  }
  return client;
}

const PODCAST_ANALYSIS_SYSTEM_PROMPT = `You are a podcast music specialist. Map podcast descriptions to Soundraw API parameters.

MOODS: ${PODCAST_MOODS.join(', ')}
GENRES: ${PODCAST_GENRES.join(', ')}
THEMES: ${PODCAST_THEMES.join(', ')}
TEMPO: low (<100), normal (100-125), high (>125)
ENERGY: building, steady, climax, ambient

Podcast types mapping:
- intro: Short (5-15s), energetic, professional - use Hopeful, Epic + Corporate theme
- outro: Longer (20-60s), fading, memorable - use Smooth, Sentimental + Broadcasting
- background: Loops well, not distracting - use Ambient, Lofi + steady energy
- jingle: Very short (3-10s), memorable hook - use Epic, Happy + high energy

Output ONLY valid JSON:
{
  "moods": ["mood1"],
  "genres": ["genre1"],
  "themes": ["theme1"],
  "tempo": "low|normal|high",
  "energy_profile": "building|steady|climax|ambient",
  "reasoning": "Brief explanation"
}`;

export async function analyzePodcastDescription(
  description: string,
  podcastType?: string,
  mood?: string
): Promise<DeepSeekPodcastParams> {
  logger.info('Analyzing podcast description', { description, podcastType, mood });

  const userPrompt = `Generate Soundraw parameters for podcast:

Description: ${description}
${podcastType ? `Type: ${podcastType}` : ''}
${mood ? `Desired Mood: ${mood}` : ''}

Output only valid JSON, no markdown.`;

  const response = await getClient().chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [
      { role: 'system', content: PODCAST_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from DeepSeek');

  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
  }

  try {
    const params = JSON.parse(jsonStr) as DeepSeekPodcastParams;
    params.moods = params.moods.filter(m => PODCAST_MOODS.includes(m as typeof PODCAST_MOODS[number]));
    params.genres = params.genres.filter(g => PODCAST_GENRES.includes(g as typeof PODCAST_GENRES[number]));
    params.themes = params.themes.filter(t => PODCAST_THEMES.includes(t as typeof PODCAST_THEMES[number]));

    if (params.moods.length === 0) params.moods = ['Hopeful'];
    if (params.genres.length === 0) params.genres = ['Lofi Hip Hop'];
    if (params.themes.length === 0) params.themes = ['Corporate'];

    logger.info('Podcast analysis complete', { moods: params.moods });
    return params;
  } catch (error) {
    logger.error('Failed to parse DeepSeek response', { content, error });
    throw new Error(`Failed to parse podcast parameters: ${content}`);
  }
}
