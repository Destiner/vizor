<template>
  <div class="view">
    <template v-if="message.role === 'system'">
      <div class="header">
        {{ message.role }}
      </div>
      <div class="content">
        {{ message.content }}
      </div>
    </template>
    <template v-if="message.role === 'user'">
      <div class="header">
        {{ message.role }}
      </div>
      <div class="content">
        <template v-if="typeof message.content === 'string'">
          {{ message.content }}
        </template>
        <template v-else>
          <div
            v-for="(part, index) in message.content"
            :key="index"
            class="part"
          >
            <template v-if="part.type === 'text'">
              <IconText class="icon" />
              {{ part.text }}
            </template>
            <template v-else>
              {{ part }}
            </template>
          </div>
        </template>
      </div>
    </template>
    <template v-else-if="message.role === 'assistant'">
      <div class="header">
        {{ message.role }}
      </div>
      <div class="content">
        <template v-if="typeof message.content === 'string'">
          {{ message.content }}
        </template>
        <template v-else>
          <div
            v-for="(part, index) in message.content"
            :key="index"
            class="part"
          >
            <template v-if="part.type === 'text'">
              <IconText class="icon" />
              {{ part.text }}
            </template>
            <template v-else-if="part.type === 'tool-call'">
              <IconCode class="icon" />
              <div class="tool-call">
                <div class="tool-header">
                  <div class="tool-name">
                    {{ part.toolName }}
                  </div>
                  <div class="tool-call-id">
                    {{ part.toolCallId }}
                  </div>
                </div>
                <div class="tool-args">
                  {{ part.args }}
                </div>
              </div>
            </template>
            <template v-else>
              {{ part }}
            </template>
          </div>
        </template>
      </div>
    </template>
    <template v-else-if="message.role === 'tool'">
      <div class="header">
        {{ message.role }}
      </div>
      <div class="content">
        <div
          v-for="(part, index) in message.content"
          :key="index"
          class="part"
        >
          <IconCode class="icon" />
          <div class="tool-result">
            <div class="tool-header">
              <div class="tool-name">
                {{ part.toolName }}
              </div>
              <div class="tool-call-id">
                {{ part.toolCallId }}
              </div>
            </div>
            <div class="tool-result-content">
              {{ part.result }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~/server/store';

import IconText from '../__common/icons/IconText.vue';
import IconCode from '../__common/icons/IconCode.vue';

defineProps<{
  message: Message;
}>();
</script>

<style scoped>
.view {
  display: flex;
  gap: 4px;
  flex-direction: column;
}

.header {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.content {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.part {
  display: flex;
  gap: 8px;
}

.icon {
  width: 15px;
  height: 15px;
  margin-top: 3px;
  color: var(--color-text-secondary);
}

.tool-call,
.tool-result {
  display: flex;
  gap: 4px;
  flex-direction: column;

  .tool-call-id {
    display: none;
    color: var(--color-text-secondary);
  }

  &:hover {
    .tool-call-id {
      display: block;
    }
  }
}

.tool-header {
  display: flex;
  font-family: var(--font-family-mono);
  font-size: 12px;
  gap: 12px;
}

.tool-args,
.tool-result-content {
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
  font-size: 14px;
}
</style>
