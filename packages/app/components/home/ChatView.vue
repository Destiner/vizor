<template>
  <div class="view">
    <SidebarChatList
      :items="items"
      :selected-id="selectedId"
      @select="selectChat"
    />
    <MessageList :messages="item.messages" />
    <SidebarChatMetadata :item="item" />
  </div>
</template>

<script setup lang="ts">
import type { ChatItem } from '~/server/api/list.get';
import type { Chat } from '~/server/store';

import SidebarChatList from './SidebarChatList.vue';
import MessageList from './MessageList.vue';
import SidebarChatMetadata from './SidebarChatMetadata.vue';

const { item } = defineProps<{
  items: ChatItem[];
  item: Chat;
}>();

const selectedId = computed(() => item.id);

const emit = defineEmits<{
  select: [string];
}>();

function selectChat(id: string) {
  emit('select', id);
}
</script>

<style scoped>
.view {
  display: flex;
  width: 1400px;
  min-height: 600px;
  max-height: 800px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
}
</style>
