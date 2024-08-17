<script setup lang="ts">
import { Palette, PaletteColor } from "@/core/Palette";
import { defineModel } from "vue";
import Color from "./Color.vue";

const model = defineModel<Palette>({ required: true });

function update(colorIndex: number, color: PaletteColor) {
  model.value = model.value.copySet(colorIndex, color);
}
</script>

<template>
  <div class="palette">
    <Color :modelValue="model.color0" @update:modelValue="update(0, $event)" />
    <Color :modelValue="model.color1" @update:modelValue="update(1, $event)" />
    <Color :modelValue="model.color2" @update:modelValue="update(2, $event)" />
    <Color :modelValue="model.color3" @update:modelValue="update(3, $event)" />
  </div>
</template>

<style lang="scss" scoped>
.palette {
  display: flex;
  gap: 1rem;
}
</style>
