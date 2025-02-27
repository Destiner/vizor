import type { ZodAny } from 'zod';

interface Chat {
  id: string;
  metadata: {
    provider: string;
    model: string;
    tools: Tool[];
  };
  messages: Message[];
}

interface Tool {
  name: string;
  description: string;
  parameters: ZodAny;
}

type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

interface SystemMessage {
  role: 'system';
  content: string;
}

interface UserMessage {
  role: 'user';
  content: UserContent;
}

type UserContent = string | Array<TextPart | ImagePart | FilePart>;

interface TextPart {
  type: 'text';
  text: string;
}

interface ImagePart {
  type: 'image';
  image: string;
}

interface FilePart {
  type: 'file';
  file: string;
}

interface AssistantMessage {
  role: 'assistant';
  content: AssistantContent;
  timestamp?: number;
}

type AssistantContent =
  | string
  | Array<TextPart | ReasoningPart | RedactedReasoningPart | ToolCallPart>;

interface ReasoningPart {
  type: 'reasoning';
  text: string;
}

interface RedactedReasoningPart {
  type: 'redacted-reasoning';
  data: string;
}

interface ToolCallPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

interface ToolMessage {
  role: 'tool';
  content: ToolContent;
  timestamp?: number;
}

type ToolContent = Array<ToolResultPart>;

interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result:
    | {
        status: 'success';
        output: unknown;
      }
    | {
        status: 'error';
        error: {
          type: string;
          message: string;
        };
      };
}

export type {
  Chat,
  Tool,
  Message,
  SystemMessage,
  UserMessage,
  AssistantMessage,
  TextPart,
  ToolCallPart,
  ToolMessage,
  ToolContent,
  ToolResultPart,
};
