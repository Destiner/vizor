<template>
  <div class="parameters-view">
    <div
      v-if="hasProperties"
      class="schema-properties"
    >
      <div
        v-for="(property, key) in properties"
        :key="key"
        class="property"
      >
        <div class="property-header">
          <span
            v-if="property.type"
            class="type"
            >{{ property.type }}</span
          >
          <div>
            <span class="property-name">{{ key }}</span>
            <span
              v-if="isRequired(key)"
              class="required"
              >*</span
            >
          </div>
        </div>
        <div
          v-if="property.description"
          class="property-description"
        >
          {{ property.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import { computed } from 'vue';

interface JSONSchemaProperty {
  type?: string;
  description?: string;
  [key: string]: unknown;
}

interface JSONSchema {
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  [key: string]: unknown;
}

const props = defineProps<{
  parameters: z.ZodAny;
}>();

// Extract properties from the schema
const properties = computed<Record<string, JSONSchemaProperty>>(() => {
  try {
    // Try to access the schema directly
    const schema = props.parameters as unknown as JSONSchema;

    // If it has properties, return them
    if (schema?.properties) {
      return schema.properties;
    }

    return {};
  } catch (error) {
    console.error('Error accessing schema properties:', error);
    return {};
  }
});

const hasProperties = computed(() => {
  return Object.keys(properties.value).length > 0;
});

const requiredFields = computed<string[]>(() => {
  try {
    const schema = props.parameters as unknown as JSONSchema;

    if (schema?.required && Array.isArray(schema.required)) {
      return schema.required;
    }

    return [];
  } catch (error) {
    console.error('Error accessing required fields:', error);
    return [];
  }
});

function isRequired(propertyName: string): boolean {
  return requiredFields.value.includes(propertyName);
}
</script>

<style scoped>
.property {
  display: flex;
  gap: 4px;
  flex-direction: column;
}

.property-header {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
}

.property-name {
  font-weight: 600;
}

.required {
  color: #ef4444;
}

.type {
  color: var(--color-text-secondary);
}

.property-description {
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
