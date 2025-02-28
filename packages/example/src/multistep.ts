import * as readline from 'node:readline';

import { openai } from '@ai-sdk/openai';
import { Sdk } from '@vizor/client';
import { generateText, tool, type CoreMessage } from 'ai';
import { z } from 'zod';

const openAiApiKey = process.env.OPENAI_API_KEY;
if (!openAiApiKey) {
  throw new Error('No OpenAI API key');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const sdk = new Sdk();
sdk.start();

async function main() {
  const messages: CoreMessage[] = [];
  while (true) {
    const prompt = await new Promise<string>((resolve) => {
      rl.question('Ask anything: ', resolve);
    });

    messages.push({
      role: 'user',
      content: prompt,
    });

    const result = await generateText({
      model: openai('gpt-4o'),
      messages,
      system:
        'You are a helpful assistant. Always respond in plain text. Only use lowercase letters for text.',
      tools: {
        countLetters: tool({
          description: 'Count the number of letters in a word',
          parameters: z.object({
            word: z.string().describe('The word to count the letters of'),
            letter: z.string().describe('The letter to count'),
          }),
          execute: async ({ word, letter }) => {
            if (word === 'strawberry') {
              throw new Error('Impossible to count');
            }
            return {
              word,
              letter,
              count: word.split(letter).length - 1,
            };
          },
        }),
      },
      maxSteps: 10,
      experimental_telemetry: { isEnabled: true },
    });

    const newMessages: CoreMessage[] = result.response.messages;
    for (const message of newMessages) {
      messages.push(message);
    }
  }
}

main().catch(console.error);
