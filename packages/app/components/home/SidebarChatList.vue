<template>
  <div class="sidebar">
    <div class="list">
      <div
        class="item"
        v-for="chatItem in items"
        :key="chatItem.id"
        :class="{ selected: chatItem.id === selectedId }"
        @click="selectChat(chatItem.id)"
      >
        <div class="time">
          {{ formatRelativeTime(getMessageTimestamp(chatItem.latestMessage)) }}
        </div>
        <div class="content">
          <div class="preview">
            {{ getMessageContent(chatItem.latestMessage) }}
          </div>
          <div class="footer">
            <div class="model">
              {{ chatItem.metadata.provider }} {{ chatItem.metadata.model }}
            </div>
            <div class="stats">
              {{ getMessageCountLabel(chatItem.messageCount) }}
              <span v-if="chatItem.toolCallCount > 0">
                •
                {{ getToolCallCountLabel(chatItem.toolCallCount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatItem } from '~/server/api/list.get';
import type { Message } from '~/server/store';

const { items } = defineProps<{
  items: ChatItem[];
  selectedId: string;
}>();

const emit = defineEmits<{
  select: [string];
}>();

function selectChat(id: string) {
  emit('select', id);
}

function getMessageTimestamp(message: Message | null): number | null {
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

function getMessageContent(message: Message | null): string | null {
  if (!message) {
    return null;
  }
  switch (message.role) {
    case 'system':
      return message.content;
    case 'user':
      return typeof message.content === 'string' ? message.content : null;
    case 'assistant':
      return typeof message.content === 'string' ? message.content : null;
    case 'tool': {
      const lastPart = message.content.at(-1);
      if (!lastPart) {
        return null;
      }
      if (lastPart.result.status === 'error') {
        return 'Tool call failed';
      }
      return lastPart.result.output as string;
    }
  }
}

function getMessageCountLabel(count: number) {
  if (count === 0) return '';
  if (count === 1) return '1 message';
  return `${count} messages`;
}

function getToolCallCountLabel(count: number) {
  if (count === 0) return '';
  if (count === 1) return '1 tool call';
  return `${count} tool calls`;
}

/**
 * Format a timestamp as a relative time string using Intl.RelativeTimeFormat
 */
function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return '';

  const now = Date.now();
  const diff = now - timestamp;

  // Create formatter with English locale
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  // Convert milliseconds to seconds (negative because it's in the past)
  const diffInSeconds = -Math.floor(diff / 1000);

  // Choose the appropriate time unit
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }

  const diffInMinutes = -Math.floor(diff / (1000 * 60));
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }

  const diffInHours = -Math.floor(diff / (1000 * 60 * 60));
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }

  const diffInDays = -Math.floor(diff / (1000 * 60 * 60 * 24));
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }

  const diffInMonths = -Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }

  const diffInYears = -Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  return rtf.format(diffInYears, 'year');
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  padding: 16px;
  overflow: scroll;
  border-right: 1px solid var(--color-border-primary);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item {
  display: flex;
  gap: 6px;
  flex-direction: column;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;

  &.selected {
    background-color: var(--color-background-secondary);
  }
}

.time {
  color: var(--color-text-secondary);
  font-size: 12px;
  text-transform: uppercase;
}

.content {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.preview {
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer {
  display: flex;
  gap: 4px;
  flex-direction: column;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.model {
  font-family: var(--font-family-mono);
}
</style>
