import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { generatePodcastMusic } from './tools/generate-podcast.js';
import { GeneratePodcastMusicInput } from './types/index.js';
import { logger } from './utils/logger.js';

const server = new Server({ name: 'soundraw-podcast-music', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'generate_podcast_music',
    description: 'Generate podcast music (intro, outro, background, jingle). Uses DeepSeek for parameter mapping and Soundraw for audio generation.',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Podcast description or topic' },
        podcast_type: { type: 'string', enum: ['intro', 'outro', 'background', 'jingle'], description: 'Type of podcast music' },
        duration_seconds: { type: 'number', minimum: 10, maximum: 300, description: 'Duration in seconds (10-300)' },
        mood: { type: 'string', description: 'Desired mood' },
        style: { type: 'string', description: 'Musical style preference' },
        engine: { type: 'string', enum: ['web', 'ios', 'android'], description: 'Platform for integration code' },
        file_format: { type: 'string', enum: ['m4a', 'mp3', 'wav'], description: 'Audio file format' },
      },
      required: ['description'],
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === 'generate_podcast_music') {
      const result = await generatePodcastMusic(args as GeneratePodcastMusicInput);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    logger.error('Tool execution failed', { tool: name, error });
    return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Soundraw Podcast Music MCP Server started');
}

main().catch((error) => { logger.error('Server failed to start', { error }); process.exit(1); });
