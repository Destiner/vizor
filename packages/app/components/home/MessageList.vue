<template>
  <div class="list">
    <MessageView
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~/server/store';

import MessageView from './MessageView.vue';

defineProps<{
  messages: Message[];
}>();
</script>

<style scoped>
.list {
  display: flex;
  gap: 16px;
  flex: 1;
  flex-direction: column;
  padding: 16px;
  overflow: scroll;
}
</style>
