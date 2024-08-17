<script setup lang="ts">
import {
  cFileTemplate,
  hFileTemplate,
  mainFileTemplate,
} from "@/core/fileTemplates";
import { Palette } from "@/core/Palette";
import { TileMap } from "@/core/TileMap";
import { Tiles } from "@/core/Tiles";
import { camelCase } from "change-case";
import {
  type ColorDistanceFormula,
  type ImageQuantization,
  type PaletteQuantization,
} from "image-q";
import { computed, ref, watch, watchEffect } from "vue";
import Code from "./Code.vue";
import PaletteView from "./Palette.vue";
import Select from "./Select.vue";

const colorDistanceFormulaOptions: ColorDistanceFormula[] = [
  "cie94-textiles",
  "cie94-graphic-arts",
  "ciede2000",
  "color-metric",
  "euclidean",
  "euclidean-bt709-noalpha",
  "euclidean-bt709",
  "manhattan",
  "manhattan-bt709",
  "manhattan-nommyde",
  "pngquant",
];
const paletteQuantizationOptions: PaletteQuantization[] = [
  "neuquant",
  "neuquant-float",
  "rgbquant",
  "wuquant",
];
const imageQuantizationOptions: ImageQuantization[] = [
  "nearest",
  "riemersma",
  "floyd-steinberg",
  "false-floyd-steinberg",
  "stucki",
  "atkinson",
  "jarvis",
  "burkes",
  "sierra",
  "two-sierra",
  "sierra-lite",
];
const colorDistanceFormula = ref<ColorDistanceFormula>("euclidean-bt709");
const paletteQuantization = ref<PaletteQuantization>("wuquant");
const imageQuantization = ref<ImageQuantization>("floyd-steinberg");

const palette = ref<Palette>();
const paletteProgress = ref<number>();

const canvas = ref<HTMLCanvasElement>();
const image = ref<HTMLImageElement>();
const imageProgress = ref<number | undefined>();
const resultImage = ref<Uint8Array>();

const DEFAULT_IMAGE_NAME = "background";
const imageName = ref<string>(DEFAULT_IMAGE_NAME);

const tileOffset = ref(0);
const paletteOffset = ref(0);

const tilesAndMap = computed(() => {
  if (!resultImage.value || !palette.value || !image.value) return;

  const rawTiles = Tiles.fromImageAndPalette(
    resultImage.value,
    palette.value,
    image.value?.naturalWidth
  );
  return TileMap.fromTiles(rawTiles, tileOffset.value);
});
const tiles = computed(() => tilesAndMap.value?.[1]);
const tileMap = computed(() => tilesAndMap.value?.[0]);

watchEffect(() => {
  if (imageName.value.length === 0) {
    imageName.value = DEFAULT_IMAGE_NAME;
  }
});

watch(image, async (img) => {
  if (!img) return;
  if (img.naturalWidth !== 160 || img.naturalHeight !== 144) {
    alert("The image must be 160x144 pixels");
    return;
  }

  palette.value = await Palette.fromImage(
    img,
    colorDistanceFormula.value,
    paletteQuantization.value,
    (progress) => {
      paletteProgress.value = progress;
    }
  );

  paletteProgress.value = undefined;
});

watch([palette, colorDistanceFormula, imageQuantization], async ([palette]) => {
  const img = image.value;
  if (!img || !palette) return;

  resultImage.value = await palette.applyToImage(
    img,
    colorDistanceFormula.value,
    imageQuantization.value,
    (progress) => {
      imageProgress.value = progress;
    }
  );

  imageProgress.value = undefined;
});

watch(resultImage, async (imageUint8Array) => {
  const img = image.value;
  if (!imageUint8Array || !img) return;

  const canvasEl = canvas.value;
  if (!canvasEl) return;
  const ctx = canvasEl.getContext("2d") as CanvasRenderingContext2D;

  ctx.imageSmoothingEnabled = false;

  canvasEl.width = img.naturalWidth;
  canvasEl.height = img.naturalHeight;

  const imageData = ctx.createImageData(img.naturalWidth, img.naturalHeight);
  imageData.data.set(imageUint8Array);
  ctx.putImageData(imageData, 0, 0);

  imageProgress.value = undefined;
});

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      image.value = img;
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}
</script>

<template>
  <div class="app">
    <p>Only accepts a PNG file of 160(width) x 144(height) pixels</p>
    <input
      type="file"
      accept="image/png"
      @change="onFileChange"
      v-if="!palette && !paletteProgress"
    />
    <div v-if="!palette && !paletteProgress">
      <p>
        See
        <a
          href="https://github.com/ibezkrovnyi/image-quantization"
          target="_blank"
          rel="noopener noreferrer"
          >image-quantization</a
        >
        for more information
      </p>
      <div class="selects">
        <Select
          label="Color distance formula"
          v-model="colorDistanceFormula"
          :options="colorDistanceFormulaOptions"
        />
        <Select
          label="Palette quantization"
          v-model="paletteQuantization"
          :options="paletteQuantizationOptions"
        />
        <Select
          label="Image quantization"
          v-model="imageQuantization"
          :options="imageQuantizationOptions"
        />
      </div>
    </div>
    <progress :value="paletteProgress" max="100" v-if="paletteProgress" />
    <PaletteView v-model="palette" v-if="palette" />
    <div v-if="palette && !imageProgress">
      <p>
        See
        <a
          href="https://github.com/ibezkrovnyi/image-quantization"
          target="_blank"
          rel="noopener noreferrer"
          >image-quantization</a
        >
        for more information
      </p>
      <div class="selects">
        <Select
          label="Color distance formula"
          v-model="colorDistanceFormula"
          :options="colorDistanceFormulaOptions"
        />
        <Select
          label="Image quantization"
          v-model="imageQuantization"
          :options="imageQuantizationOptions"
        />
      </div>
    </div>
    <progress :value="imageProgress" max="100" v-if="imageProgress" />
    <canvas ref="canvas" width="160" height="144" v-show="resultImage" />
    <div v-if="resultImage">
      <label>
        Image name:
        <input type="text" v-model="imageName" />
      </label>
      <label>
        Tile offset:
        <input type="number" v-model.number="tileOffset" />
      </label>
      <label>
        Palette offset:
        <input type="number" v-model.number="paletteOffset" />
      </label>
      <p>
        These files are meant to be build with GBDK. By
        <code>./gbdk/bin/lcc -Wm-yC -o game.gbc main.c</code>
      </p>
      <div class="code-files">
        <Code
          :fileName="`${camelCase(imageName)}.h`"
          :code="
            hFileTemplate({
              imageName,
              tileOffset,
              paletteOffset,
              tileCount: tiles.tiles.length,
            })
          "
          v-if="tiles"
        />
        <Code
          :fileName="`${camelCase(imageName)}.c`"
          :code="
            cFileTemplate({
              imageName,
              tileData: tiles.toGBDKString(),
              mapData: tileMap.toGBDKString(),
              paletteData: palette.toGBDKString(),
            })
          "
          v-if="tiles && tileMap && palette"
        />
        <Code
          :fileName="`main.c`"
          :code="
            mainFileTemplate({
              imageName,
            })
          "
        />
      </div>
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

canvas {
  width: min(calc(100vw - 2rem), 640px);
  image-rendering: pixelated;

  border: 1px solid black;
  @media (prefers-color-scheme: dark) {
    border-color: white;
  }
}

.selects {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.code-files {
  max-width: min(calc(100vw - 2rem), 640px);
  text-align: start;
  margin: auto;
}
</style>
