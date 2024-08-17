<script setup lang="ts">
import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/c";
import "highlight.js/styles/github.css";
import { computed, defineProps, onBeforeMount } from "vue";

onBeforeMount(() => {
  hljs.registerLanguage("c", c);
});

const props = defineProps<{
  fileName: string;
  code: string;
}>();

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  readOnly: true,
};

// const isDark = usePreferredDark();
// const theme = isDark.value ? "vs-dark" : "vs";
const code = computed(
  () => hljs.highlight(props.code, { language: "c" }).value
);
</script>

<template>
  <div class="code">
    <h2>{{ props.fileName }}</h2>
    <pre><code class="language-c" v-html="code"></code></pre>
  </div>
</template>

<style lang="scss" scoped>
.code {
  overflow-x: auto;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  pre {
    background-color: #f4f4f4;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;

    @media (prefers-color-scheme: dark) {
      background-color: #222;
    }
  }
}
</style>
