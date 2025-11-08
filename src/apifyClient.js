import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fetches YouTube videos from a channel using Apify
 * @param {string} channelUrl - YouTube channel URL
 * @param {number} maxVideos - Number of videos to fetch (from newest)
 * @returns {Promise<Array>} Array of video objects with title, videoId, and subtitle
 */
export async function fetchYouTubeVideos(channelUrl, maxVideos = 10) {
  const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
  });

  console.log(`Fetching ${maxVideos} videos from channel: ${channelUrl}`);

  try {
    // Prepare the Actor input
    const input = {
      startUrls: [{ url: channelUrl }],
      maxResults: maxVideos,
      searchKeywords: '',
      searchMode: 'VIDEOS',
      subtitlesLanguage: 'en',
      downloadSubtitles: true,
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor('streamers/youtube-scraper').call(input);

    // Fetch results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`Successfully fetched ${items.length} videos`);

    // Transform the data to include only what we need
    return items.map((item, index) => ({
      videoId: item.id,
      title: item.title,
      url: item.url,
      subtitle: item.subtitles || '',
      description: item.description || '',
      publishedAt: item.uploadDate || '',
      index: index,
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
}

/**
 * Format video data as text for file storage
 * @param {Object} video - Video object
 * @returns {string} Formatted text content
 */
export function formatVideoContent(video) {
  return `Title: ${video.title}
Video ID: ${video.videoId}
URL: ${video.url}
Published: ${video.publishedAt}

Description:
${video.description}

Transcript:
${video.subtitle}
`;
}
