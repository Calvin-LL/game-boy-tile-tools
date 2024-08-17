<script setup lang="ts">
import { PaletteColor } from "@/core/Palette";
import { defineModel } from "vue";

const model = defineModel<PaletteColor>({ required: true });

function update(e: Event) {
  model.value = PaletteColor.fromHex((e.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="color">
    <input type="color" :value="model.toHex()" @input="update" />
    <code class="color__hex">{{ model.toHex() }}</code>
  </div>
</template>

<style lang="scss" scoped>
.color {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .color__preview {
    width: 3rem;
    height: 3rem;

    border: 1px solid black;

    @media (prefers-color-scheme: dark) {
      border-color: white;
    }
  }

  .color__hex {
    font-size: 0.75rem;
  }
}
</style>
