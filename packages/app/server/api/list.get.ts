import { type Chat, type ChatMetadata, type Message, getChats } from '../store';

interface ChatItem {
  id: string;
  metadata: ChatMetadata;
  messageCount: number;
  toolCallCount: number;
  latestMessage: Message | null;
}

export default defineEventHandler(async (event) => {
  // List all chats
  // Only return the metadata for each
  const chats = getChats();
  const items = chats.map((chat) => ({
    id: chat.id,
    metadata: chat.metadata,
    messageCount: chat.messages.length,
    toolCallCount: chat.messages.filter((message) => message.role === 'tool')
      .length,
    latestMessage: getLatestMessage(chat),
  }));
  // Sort by latest message timestamp
  items.sort((a, b) => {
    return (
      (getTimestamp(b.latestMessage) ?? 0) -
      (getTimestamp(a.latestMessage) ?? 0)
    );
  });
  return items;
});

function getLatestMessage(chat: Chat): Message | null {
  return chat.messages[chat.messages.length - 1] ?? null;
}

function getTimestamp(message: Message | null): number | null {
  if (!message) {
    return null;
  }
  switch (message.role) {
    case 'system':
    case 'user':
      return null;
    case 'assistant':
    case 'tool':
      return message.timestamp ?? null;
  }
}

export type { ChatItem };
