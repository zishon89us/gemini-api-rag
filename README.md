# YouTube RAG Chat Tool

A Retrieval-Augmented Generation (RAG) tool that allows you to chat with YouTube video transcripts using Google's Gemini API and Apify's YouTube scraper.

## Features

- Fetch video transcripts from any YouTube channel
- Upload transcripts to Gemini API File Search
- Interactive chat interface to query video content
- Support for multiple videos from a channel
- Automatic transcript processing and indexing

## How It Works

1. **Gather Information**: Provide a YouTube channel URL and specify the number of videos to process (starting from the newest)
2. **Use Apify**: The tool uses [Apify's YouTube Scraper](https://apify.com/streamers/youtube-scraper) to fetch video titles and subtitles
3. **Create Files**: Generate a text file for each video containing title, description, and transcript
4. **Upload to Gemini**: Add all files to [Gemini API File Search](https://ai.google.dev/gemini-api/docs/file-search) for RAG capabilities
5. **Chat Interface**: Use an interactive chat box to ask questions about the video content

## Prerequisites

- Node.js (v18 or higher)
- Gemini API key (from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Apify API token (from [Apify Console](https://console.apify.com/account/integrations))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-api-rag
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the template:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
APIFY_API_TOKEN=your_apify_api_token_here
```

## Usage

### Step 1: Process a YouTube Channel

Run the indexing process to fetch and upload video transcripts:

```bash
npm start "<channel-url>" <number-of-videos>
```

**Example:**
```bash
npm start "https://www.youtube.com/@fireship" 10
```

This will:
- Fetch the 10 most recent videos from the Fireship channel
- Download their transcripts using Apify
- Create text files in the `data/` directory
- Upload them to Gemini API File Search
- Save metadata for the chat session

### Step 2: Start Chatting

Once processing is complete, start the interactive chat interface:

```bash
npm run chat
```

**Example questions you can ask:**
- "What are the main topics covered in these videos?"
- "Can you summarize the video about React?"
- "What did the creator say about performance optimization?"
- "List all the technologies mentioned across the videos"

**Chat commands:**
- `list` - Show all available videos
- `exit` - Quit the chat

## Project Structure

```
gemini-api-rag/
├── src/
│   ├── index.js           # Main processing script
│   ├── chat.js            # Interactive chat interface
│   ├── apifyClient.js     # Apify YouTube scraper integration
│   └── geminiClient.js    # Gemini API File Search integration
├── data/                  # Generated video transcripts and metadata
├── .env.example           # Environment variable template
├── package.json           # Project dependencies
├── CLAUDE.md              # Project specification
└── README.md              # This file
```

## API Documentation

### Apify YouTube Scraper

- **Actor**: `streamers/youtube-scraper`
- **Documentation**: https://apify.com/streamers/youtube-scraper
- **API Docs**: https://docs.apify.com/

### Google Gemini API

- **Model**: `gemini-1.5-pro`
- **File Search Documentation**: https://ai.google.dev/gemini-api/docs/file-search
- **API Reference**: https://ai.google.dev/gemini-api/docs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `APIFY_API_TOKEN` | Your Apify API token | Yes |

## Limitations

- Videos must have subtitles/captions available
- Apify free tier has usage limits
- Gemini API has rate limits and file size restrictions
- English subtitles are prioritized (configurable in `apifyClient.js`)

## Troubleshooting

### "No videos found"
- Verify the channel URL is correct
- Check if the channel has public videos
- Ensure videos have subtitles enabled

### "API key error"
- Verify your `.env` file has the correct API keys
- Check that API keys are active and have appropriate permissions

### "Rate limit exceeded"
- Wait a few minutes before retrying
- Reduce the number of videos to process
- Check your API quota in respective dashboards

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Apify YouTube Scraper](https://apify.com/streamers/youtube-scraper)
- Built following specifications in [CLAUDE.md](./CLAUDE.md)
