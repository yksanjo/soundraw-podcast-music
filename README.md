# Soundraw Podcast Music MCP Server

MCP server for generating podcast music (intros, outros, background, jingles) using DeepSeek and Soundraw API.

## Features

- **4 Music Types**: Intro, Outro, Background, Jingle
- **Platform Integration**: Web, iOS, Android code generation
- **Smart Mapping**: DeepSeek translates podcast descriptions to Soundraw parameters

## Installation

```bash
git clone https://github.com/yksanjo/soundraw-podcast-music.git
cd soundraw-podcast-music
npm install
npm run build
```

## Configuration

Create `.env`:
```env
DEEPSEEK_API_KEY=sk-your-key
SOUNDRAW_API_KEY=your-token
```

## MCP Tool

### `generate_podcast_music`

```json
{
  "description": "tech startup podcast about AI",
  "podcast_type": "intro",
  "duration_seconds": 15,
  "engine": "web",
  "file_format": "mp3"
}
```

## Usage

Add to `~/.mcp.json`:
```json
{
  "mcpServers": {
    "soundraw-podcast-music": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": { "DEEPSEEK_API_KEY": "...", "SOUNDRAW_API_KEY": "..." }
    }
  }
}
```

Try: "Generate a tech podcast intro, 15 seconds, hopeful mood, with web player code"

## License

MIT
