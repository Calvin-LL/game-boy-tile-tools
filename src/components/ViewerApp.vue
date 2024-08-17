<script setup lang="ts">
import { Palette, PaletteColor } from "@/core/Palette";
import { Tile } from "@/core/Tiles";
import { computed, ref, watchEffect } from "vue";
import PaletteView from "./Palette.vue";

const canvases = ref<HTMLCanvasElement[]>();
const hexCode = ref<string>("");
const palette = ref(
  new Palette(
    new PaletteColor(255, 255, 255),
    new PaletteColor(127, 127, 127),
    new PaletteColor(63, 63, 63),
    new PaletteColor(0, 0, 0)
  )
);
const numbers = computed(() => {
  return hexCode.value
    .split(",")
    .map((hex) => parseInt(hex.trim(), 16))
    .map((num) => (isNaN(num) ? 0 : num));
});
const tiles = computed(() => {
  const result: Tile[] = [];
  for (const chunk of chunks(numbers.value, 16)) {
    if (chunk.length < 16) {
      continue;
    }

    result.push(Tile.fromGBDKBytes(chunk));
  }
  return result;
});

watchEffect(() => {
  if (!canvases.value) {
    return;
  }

  for (const [i, canvas] of canvases.value.entries()) {
    const tile = tiles.value[i];
    if (!tile) {
      continue;
    }
    const imageUint8Array = tile.toUint8Array(palette.value);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      continue;
    }
    const imageData = ctx.createImageData(8, 8);
    imageData.data.set(imageUint8Array);
    ctx.putImageData(imageData, 0, 0);
  }
});

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}
</script>

<template>
  <div class="app">
    <p>Visualize tiles in 2BPP format.</p>
    <textarea v-model="hexCode" placeholder="0x00, 0x00, ..." />
    <PaletteView v-model="palette" />
    <div class="tiles">
      <canvas width="8" height="8" v-for="tile in tiles" ref="canvases" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

textarea {
  width: min(calc(100vw - 2rem), 640px);
}

.tiles {
  width: min(calc(100vw - 2rem), 640px);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

canvas {
  width: 40px;
  image-rendering: pixelated;

  border: 1px solid black;
  @media (prefers-color-scheme: dark) {
    border-color: white;
  }
}
</style>
