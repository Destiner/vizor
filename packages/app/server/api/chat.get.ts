import { getChats } from '../store';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id as string;
  const chats = getChats();
  const chat = chats.find((chat) => chat.id === id);
  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found',
    });
  }
  return chat;
});
