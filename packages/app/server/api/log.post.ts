import { type Chat, addChat } from '../store';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    chats: Chat[];
  }>(event);
  for (const chat of body.chats) {
    addChat(chat);
  }
});
