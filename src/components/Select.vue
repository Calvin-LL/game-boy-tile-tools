<script setup lang="ts">
import { defineModel, defineProps } from "vue";

const props = defineProps<{
  label: string;
  options: string[];
}>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <label>
    {{ props.label }}:
    <select v-model="model">
      <option v-for="option in props.options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </label>
</template>

<style lang="scss" scoped></style>
