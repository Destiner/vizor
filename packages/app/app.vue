<template>
  <NuxtPage />
</template>

<script setup>
// Import Geist Sans font
import '@fontsource/geist-sans/400.css'; // Regular weight
import '@fontsource/geist-sans/500.css'; // Medium weight
import '@fontsource/geist-sans/600.css'; // Semi-bold weight

// Import Geist Mono variable font
import '@fontsource-variable/geist-mono/index.css';
</script>

<style>
:root {
  --color-background-primary: rgb(19 19 19);
  --color-background-secondary: rgb(32 32 32);
  --color-text-primary: rgb(224 224 224);
  --color-text-secondary: rgb(148 148 148);
  --color-border-primary: rgb(64 64 64);
  --font-family-sans:
    'Geist Sans', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto,
    helvetica, arial, sans-serif;
  --font-family-mono: 'Geist Mono Variable', monospace;
}

body {
  margin: 0;
  background: rgb(19 19 19);
  color: rgb(224 224 224);
  font-family: var(--font-family-sans);
}

/* Apply mono font to code elements */
code,
pre,
kbd {
  font-family: var(--font-family-mono);
}
</style>
