import { NodeSDK } from '@opentelemetry/sdk-node';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { type ExportResult, ExportResultCode } from '@opentelemetry/core';

import type { Chat, Tool, Message, TextPart, ToolCallPart } from './types';

class Client {
  constructor(private readonly url: string) {
    this.url = url;
  }

  async log(chats: Chat[]) {
    await fetch(`${this.url}/api/log`, {
      method: 'POST',
      body: JSON.stringify({ chats }),
    });
  }
}

class Exporter implements SpanExporter {
  client: Client;

  constructor() {
    this.client = new Client('http://localhost:3000');
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): Promise<void> {
    const chats = spansToChats(spans);
    await this.client.log(chats);
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  async shutdown(): Promise<void> {}
}

const sdk = new NodeSDK({
  traceExporter: new Exporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

function spansToChats(spans: ReadableSpan[]): Chat[] {
  // Group spans by trace ID to separate different conversations
  const spansByTraceId: Record<string, ReadableSpan[]> = {};
  for (const span of spans) {
    const traceId = span.spanContext().traceId;
    if (!spansByTraceId[traceId]) {
      spansByTraceId[traceId] = [];
    }
    spansByTraceId[traceId].push(span);
  }

  const chats: Chat[] = [];

  const allTraceSpans = Object.values(spansByTraceId);

  for (const traceSpans of allTraceSpans) {
    // Find the root span for this conversation (the ai.generateText span without a parent)
    const rootSpan = traceSpans.find(
      (span) => span.name === 'ai.generateText' && !span.parentSpanId,
    );

    if (!rootSpan) continue;

    // Find related spans
    const generateSpans = traceSpans.filter(
      (span) => span.name === 'ai.generateText.doGenerate',
    );
    const toolCallSpans = traceSpans.filter(
      (span) => span.name === 'ai.toolCall',
    );

    // Extract tool definitions - use a Map to prevent duplicates
    const toolMap = new Map<string, Tool>();
    for (const span of generateSpans) {
      const toolsStr = span.attributes['ai.prompt.tools'];
      if (Array.isArray(toolsStr)) {
        for (const toolStr of toolsStr) {
          try {
            if (typeof toolStr === 'string') {
              const tool = JSON.parse(toolStr);
              if (tool.name && tool.description) {
                toolMap.set(tool.name, {
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.parameters,
                });
              }
            }
          } catch (e) {
            // Skip invalid tool definitions
          }
        }
      }
    }
    // Convert Map to array
    const tools: Tool[] = Array.from(toolMap.values());

    // Extract messages
    const messages: Message[] = [];

    // Extract user message from prompt
    const userMessageSpan = generateSpans[0]; // First generate span usually contains the user message
    if (userMessageSpan) {
      const promptMessagesStr =
        userMessageSpan.attributes['ai.prompt.messages'];
      if (typeof promptMessagesStr === 'string') {
        try {
          const promptMessages = JSON.parse(promptMessagesStr);
          const userMessage = promptMessages.find(
            (msg: { role: string }) => msg.role === 'user',
          );
          if (userMessage) {
            const userContent = userMessage.content;
            messages.push({
              role: 'user',
              content: Array.isArray(userContent) ? userContent : userContent,
            });
          }
        } catch (e) {
          // Fallback to simple prompt text if parsing fails
          const promptText = rootSpan.attributes['ai.prompt'];
          if (typeof promptText === 'string') {
            try {
              const promptObj = JSON.parse(promptText);
              if (promptObj.prompt) {
                messages.push({
                  role: 'user',
                  content: promptObj.prompt,
                });
              }
            } catch (e) {
              // Skip if we can't parse the prompt
            }
          }
        }
      }
    }

    // Extract assistant responses - we need to handle both tool calls and text responses
    let foundToolCalls = false;

    // First check for tool calls in any span
    // We'll process all spans in chronological order to maintain the conversation flow
    const sortedSpans = [...generateSpans, rootSpan].sort((a, b) => {
      const aTime = a.startTime[0] * 1e9 + a.startTime[1];
      const bTime = b.startTime[0] * 1e9 + b.startTime[1];
      return aTime - bTime;
    });

    // Process tool calls first
    for (const genSpan of sortedSpans) {
      const responseToolCalls = genSpan.attributes['ai.response.toolCalls'];

      if (typeof responseToolCalls === 'string') {
        try {
          const toolCalls = JSON.parse(responseToolCalls);
          const content: Array<TextPart | ToolCallPart> = [];

          for (const toolCall of toolCalls) {
            content.push({
              type: 'tool-call',
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              args: toolCall.args,
            });
          }

          messages.push({
            role: 'assistant',
            content,
            timestamp: genSpan.endTime[0] * 1000,
          });

          foundToolCalls = true;

          // Add tool messages for each tool call
          processToolCallSpans(toolCallSpans, messages);

          // Don't break here - we want to continue processing to find the final text response
        } catch (e) {
          // Skip if we can't parse the tool calls
        }
      }
    }

    // Now look for the final text response
    // We'll check the last generate span first, as it's most likely to contain the final response
    let foundTextResponse = false;

    // Sort spans by end time to find the last one
    const spansByEndTime = [...generateSpans, rootSpan].sort((a, b) => {
      const aTime = a.endTime[0] * 1e9 + a.endTime[1];
      const bTime = b.endTime[0] * 1e9 + b.endTime[1];
      return bTime - aTime; // Descending order
    });

    // Check for text response in the last span first
    for (const genSpan of spansByEndTime) {
      const responseText = genSpan.attributes['ai.response.text'];
      const finishReason = genSpan.attributes['ai.response.finishReason'];

      // If this is a text response and not a tool call, add it
      if (
        typeof responseText === 'string' &&
        responseText.trim() !== '' &&
        (!finishReason || finishReason === 'stop')
      ) {
        // Only add the text response if we haven't already found one
        // or if we've found tool calls (this would be the final response)
        if (!foundTextResponse || foundToolCalls) {
          messages.push({
            role: 'assistant',
            content: responseText,
            timestamp: genSpan.endTime[0] * 1000,
          });
          foundTextResponse = true;

          // If we've already found tool calls, we've found the complete conversation
          if (foundToolCalls) {
            break;
          }
        }
      }

      // Also check for other types of assistant content
      const responseContent = genSpan.attributes['ai.response.content'];
      if (
        !foundTextResponse &&
        typeof responseContent === 'string' &&
        responseContent.trim() !== ''
      ) {
        try {
          const content = JSON.parse(responseContent);
          messages.push({
            role: 'assistant',
            content,
            timestamp: genSpan.endTime[0] * 1000,
          });
          foundTextResponse = true;
          break;
        } catch (e) {
          // If it's not valid JSON, try to use it as a string
          messages.push({
            role: 'assistant',
            content: responseContent,
            timestamp: genSpan.endTime[0] * 1000,
          });
          foundTextResponse = true;
          break;
        }
      }
    }

    // If no response was found at all, check the root span as a fallback
    if (!foundToolCalls && !foundTextResponse) {
      const rootResponseText = rootSpan.attributes['ai.response.text'];
      if (
        typeof rootResponseText === 'string' &&
        rootResponseText.trim() !== ''
      ) {
        messages.push({
          role: 'assistant',
          content: rootResponseText,
          timestamp: rootSpan.endTime[0] * 1000,
        });
        foundTextResponse = true;
      } else {
        console.warn(
          `No assistant response found for trace ${rootSpan.spanContext().traceId}`,
        );
      }
    }

    // Create the chat object
    if (messages.length > 0) {
      const provider =
        (userMessageSpan?.attributes['ai.model.provider'] as string) ||
        (rootSpan.attributes['ai.model.provider'] as string) ||
        '';
      const model =
        (userMessageSpan?.attributes['ai.model.id'] as string) ||
        (rootSpan.attributes['ai.model.id'] as string) ||
        '';

      chats.push({
        id: rootSpan.spanContext().traceId,
        metadata: {
          provider: provider.includes('.') ? provider.split('.')[0] : provider,
          model,
          tools,
        },
        messages,
      });
    }
  }

  return chats;
}

// Helper function to process tool call spans and add them to messages
function processToolCallSpans(
  toolCallSpans: ReadableSpan[],
  messages: Message[],
): void {
  for (const toolSpan of toolCallSpans) {
    const toolCallId = toolSpan.attributes['ai.toolCall.id'] as string;
    const toolName = toolSpan.attributes['ai.toolCall.name'] as string;
    const toolResult = toolSpan.attributes['ai.toolCall.result'] as string;

    if (toolCallId && toolName && toolResult) {
      messages.push({
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId,
            toolName,
            result: tryParseJson(toolResult, toolResult),
          },
        ],
        timestamp: toolSpan.endTime[0] * 1000,
      });
    }
  }
}

// Helper function to safely parse JSON
function tryParseJson(text: string, fallback: unknown): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

export { sdk };
