import type { Chat, Tool, Message } from '@vizor/client';
import type { ZodAny } from 'zod';

interface ChatMetadata {
  provider: string;
  model: string;
  tools: Tool[];
}

const chats: Chat[] = [];

function addChat(chat: Chat) {
  chats.push(chat);
}

function getChats() {
  return chats;
}

export { addChat, getChats };
export type { Chat, Message, ChatMetadata, Tool };
