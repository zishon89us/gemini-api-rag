import { createChatModel, sendMessage } from './geminiClient.js';
import fs from 'fs/promises';
import readline from 'readline';

/**
 * Interactive chat interface for querying video transcripts
 */
async function startChat() {
  try {
    // Load metadata
    const metadataPath = './data/metadata.json';
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    console.log('=== YouTube RAG Chat Interface ===\n');
    console.log(`Channel: ${metadata.channelUrl}`);
    console.log(`Videos loaded: ${metadata.videoCount}`);
    console.log(`Processed on: ${new Date(metadata.processedAt).toLocaleString()}\n`);

    console.log('Available videos:');
    metadata.videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title}`);
    });

    console.log('\n--- Chat ready! Ask questions about the videos ---');
    console.log('(Type "exit" to quit, "list" to see videos again)\n');

    // Create chat model with uploaded files
    const chatModel = createChatModel(metadata.files);

    // Setup readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Chat loop
    const askQuestion = () => {
      rl.question('You: ', async (input) => {
        const message = input.trim();

        if (!message) {
          askQuestion();
          return;
        }

        if (message.toLowerCase() === 'exit') {
          console.log('\nGoodbye!');
          rl.close();
          return;
        }

        if (message.toLowerCase() === 'list') {
          console.log('\nAvailable videos:');
          metadata.videos.forEach((video, index) => {
            console.log(`  ${index + 1}. ${video.title}`);
            console.log(`     ${video.url}`);
          });
          console.log('');
          askQuestion();
          return;
        }

        try {
          console.log('\nAI: Thinking...');

          // Add context to the message to help the AI understand it should use the transcripts
          const contextualMessage = `Based on the YouTube video transcripts provided, please answer the following question: ${message}`;

          const response = await sendMessage(chatModel, contextualMessage);

          // Clear the "Thinking..." line
          process.stdout.write('\x1b[1A\x1b[2K');
          console.log(`AI: ${response}\n`);
        } catch (error) {
          console.error('\nError getting response:', error.message);
          console.log('');
        }

        askQuestion();
      });
    };

    askQuestion();
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: No metadata found. Please run the indexing process first:');
      console.error('  npm start <channel-url> <max-videos>');
    } else {
      console.error('Error starting chat:', error.message);
    }
    process.exit(1);
  }
}

startChat();
