import { GoogleGenerativeAI, GoogleAIFileManager } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

/**
 * Upload a video transcript file to Gemini
 * @param {string} filePath - Path to the file to upload
 * @param {string} displayName - Display name for the file
 * @returns {Promise<Object>} Uploaded file object
 */
export async function uploadFile(filePath, displayName) {
  try {
    console.log(`Uploading file: ${displayName}`);

    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: 'text/plain',
      displayName: displayName,
    });

    console.log(`File uploaded successfully: ${uploadResult.file.uri}`);

    return uploadResult.file;
  } catch (error) {
    console.error(`Error uploading file ${displayName}:`, error);
    throw error;
  }
}

/**
 * Upload multiple video transcripts to Gemini
 * @param {Array} videos - Array of video objects
 * @param {string} dataDir - Directory to save transcript files
 * @returns {Promise<Array>} Array of uploaded file URIs
 */
export async function uploadVideoTranscripts(videos, dataDir = './data') {
  const uploadedFiles = [];

  // Ensure data directory exists
  await fs.mkdir(dataDir, { recursive: true });

  for (const video of videos) {
    try {
      // Create a text file for each video
      const fileName = `video_${video.videoId}.txt`;
      const filePath = path.join(dataDir, fileName);

      const content = `Title: ${video.title}
Video ID: ${video.videoId}
URL: ${video.url}
Published: ${video.publishedAt}

Description:
${video.description}

Transcript:
${video.subtitle}
`;

      await fs.writeFile(filePath, content, 'utf-8');

      // Upload to Gemini
      const uploadedFile = await uploadFile(filePath, `${video.title} - Transcript`);
      uploadedFiles.push(uploadedFile);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing video ${video.videoId}:`, error);
    }
  }

  return uploadedFiles;
}

/**
 * Create a chat session with file search capabilities
 * @param {Array} fileUris - Array of file URIs to use for context
 * @returns {Object} Chat model configured with file search
 */
export function createChatModel(fileUris) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });

  return {
    model,
    files: fileUris,
  };
}

/**
 * Send a message to the chat model with file context
 * @param {Object} chatModel - Chat model object
 * @param {string} message - User message
 * @returns {Promise<string>} AI response
 */
export async function sendMessage(chatModel, message) {
  try {
    const { model, files } = chatModel;

    // Prepare the prompt with file context
    const parts = [
      ...files.map(file => ({
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      })),
      { text: message },
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * List all uploaded files
 * @returns {Promise<Array>} Array of file objects
 */
export async function listFiles() {
  try {
    const listResult = await fileManager.listFiles();
    return listResult.files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Delete a file by name
 * @param {string} fileName - Name of the file to delete
 */
export async function deleteFile(fileName) {
  try {
    await fileManager.deleteFile(fileName);
    console.log(`File ${fileName} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
    throw error;
  }
}
