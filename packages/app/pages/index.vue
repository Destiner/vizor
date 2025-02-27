<template>
  <div class="page">
    <div class="content">
      <ChatView
        v-if="chats && chat"
        :items="chats"
        :item="chat"
        @select="selectChat"
      />
      <div v-else>Waiting for messages…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatView from '~/components/home/ChatView.vue';

const { data: chats } = await useFetch('/api/list');

const firstChatId = computed<string | null>(() => {
  if (!chats.value) {
    return null;
  }
  if (chats.value.length === 0) {
    return null;
  }
  return chats.value[0].id;
});
const selectedChatId = ref<string | null>(firstChatId.value);
watch(firstChatId, (newId) => {
  if (newId) {
    selectedChatId.value = newId;
  }
});

const { data: chat } = await useFetch(
  () => (selectedChatId.value ? '/api/chat' : null),
  {
    query: {
      id: selectedChatId,
    },
    immediate: !!selectedChatId.value,
    watch: [selectedChatId],
  },
);

function selectChat(id: string) {
  selectedChatId.value = id;
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
}

.content {
  display: flex;
  flex-direction: row;
  margin-top: 128px;
}
</style>
