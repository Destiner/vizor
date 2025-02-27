import { type Chat, type ChatMetadata, getChats } from '../store';

interface ChatItem {
  id: string;
  metadata: ChatMetadata;
  messageCount: number;
  toolCallCount: number;
  latestMessageTimestamp: number | null;
  latestMessageContent: string | null;
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
    latestMessageTimestamp: getLatestMessageTimestamp(chat),
    latestMessageContent: getLatestMessageContent(chat),
  }));
  // Sort by latest message timestamp
  items.sort((a, b) => {
    return (b.latestMessageTimestamp ?? 0) - (a.latestMessageTimestamp ?? 0);
  });
  return items;
});

function getLatestMessageTimestamp(chat: Chat): number | null {
  const lastMessage = chat.messages[chat.messages.length - 1];
  if (!lastMessage) {
    return null;
  }
  switch (lastMessage.role) {
    case 'system':
      return null;
    case 'user':
      return null;
    case 'assistant':
      return lastMessage.timestamp ?? null;
    case 'tool':
      return lastMessage.timestamp ?? null;
  }
}

function getLatestMessageContent(chat: Chat): string | null {
  const lastMessage = chat.messages[chat.messages.length - 1];
  if (!lastMessage) {
    return null;
  }
  switch (lastMessage.role) {
    case 'system':
      return null;
    case 'user':
      return typeof lastMessage.content === 'string'
        ? lastMessage.content
        : null;
    case 'assistant':
      return typeof lastMessage.content === 'string'
        ? lastMessage.content
        : null;
    case 'tool':
      return null;
  }
}

export type { ChatItem };
