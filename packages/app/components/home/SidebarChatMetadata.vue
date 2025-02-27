<template>
  <div class="sidebar">
    <div class="item">
      <div class="label">Provider</div>
      <div class="value">{{ item.metadata.provider }}</div>
    </div>
    <div class="item">
      <div class="label">Model</div>
      <div class="value">{{ item.metadata.model }}</div>
    </div>
    <div class="item">
      <div class="label">Tools</div>
      <div class="value">
        <div
          class="tool"
          v-for="(tool, index) in item.metadata.tools"
          :key="index"
        >
          <div class="tool-header">
            <div class="name">{{ tool.name }}</div>
            <div class="description">{{ tool.description }}</div>
          </div>
          <ToolParametersView :parameters="tool.parameters" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '~/server/store';

import ToolParametersView from './ToolParametersView.vue';

defineProps<{
  item: Chat;
}>();
</script>

<style scoped>
.sidebar {
  display: flex;
  gap: 16px;
  flex-direction: column;
  width: 260px;
  padding: 16px;
  border-left: 1px solid var(--color-border-primary);
}

.item {
  display: flex;
  gap: 4px;
  flex-direction: column;
}

.label {
  color: var(--color-text-secondary);
  font-size: 12px;
  text-transform: uppercase;
}

.tool {
  display: flex;
  gap: 8px;
  flex-direction: column;
  padding: 4px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;

  .description {
    color: var(--color-text-secondary);
    font-size: 12px;
  }
}

.tool-header {
  display: flex;
  gap: 4px;
  flex-direction: column;
}
</style>
