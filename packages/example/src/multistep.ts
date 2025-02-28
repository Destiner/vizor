import * as readline from 'node:readline';

import { openai } from '@ai-sdk/openai';
import { sdk } from '@vizor/client';
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
        weather: tool({
          description: 'Get the weather in a location',
          parameters: z.object({
            location: z
              .string()
              .describe('The location to get the weather for'),
          }),
          execute: async ({ location }) => {
            return {
              location,
              temperature: 72 + Math.floor(Math.random() * 21) - 10,
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
