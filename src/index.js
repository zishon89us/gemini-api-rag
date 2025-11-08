import { fetchYouTubeVideos } from './apifyClient.js';
import { uploadVideoTranscripts } from './geminiClient.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Main function to process YouTube channel and prepare for RAG
 * @param {string} channelUrl - YouTube channel URL
 * @param {number} maxVideos - Number of videos to process
 */
async function processYouTubeChannel(channelUrl, maxVideos) {
  try {
    console.log('=== YouTube RAG Tool ===\n');

    // Step 1: Fetch videos from YouTube using Apify
    console.log('Step 1: Fetching videos from YouTube...');
    const videos = await fetchYouTubeVideos(channelUrl, maxVideos);

    if (videos.length === 0) {
      console.log('No videos found. Please check the channel URL.');
      return;
    }

    console.log(`\nFound ${videos.length} videos:\n`);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
    });

    // Step 2: Upload transcripts to Gemini File Search
    console.log('\n\nStep 2: Uploading video transcripts to Gemini...');
    const uploadedFiles = await uploadVideoTranscripts(videos);

    console.log(`\nSuccessfully uploaded ${uploadedFiles.length} files to Gemini`);

    // Step 3: Save metadata for chat session
    const metadata = {
      channelUrl,
      processedAt: new Date().toISOString(),
      videoCount: videos.length,
      files: uploadedFiles.map(file => ({
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
      })),
      videos: videos.map(v => ({
        videoId: v.videoId,
        title: v.title,
        url: v.url,
      })),
    };

    const metadataPath = './data/metadata.json';
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

    console.log(`\nMetadata saved to ${metadataPath}`);
    console.log('\n✓ Processing complete! You can now use the chat interface.');
    console.log('  Run: npm run chat');
  } catch (error) {
    console.error('\n✗ Error processing YouTube channel:', error.message);
    process.exit(1);
  }
}

// CLI Interface
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npm start <channel-url> <max-videos>');
  console.log('\nExample:');
  console.log('  npm start "https://www.youtube.com/@channelname" 10');
  process.exit(1);
}

const channelUrl = args[0];
const maxVideos = parseInt(args[1], 10);

if (isNaN(maxVideos) || maxVideos <= 0) {
  console.error('Error: max-videos must be a positive number');
  process.exit(1);
}

processYouTubeChannel(channelUrl, maxVideos);
