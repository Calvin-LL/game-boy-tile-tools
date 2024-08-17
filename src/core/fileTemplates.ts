import { camelCase, constantCase } from "change-case";

export function hFileTemplate({
  imageName,
  tileOffset,
  paletteOffset,
  tileCount,
}: {
  imageName: string;
  tileOffset: number;
  paletteOffset: number;
  tileCount: number;
}): string {
  return `/**
 * ${camelCase(imageName)}.h
 *
 * Generated with game-boy-tile-tools.calvin.sh
 */

#include <stdint.h>

#define ${constantCase(imageName)}_TILE_WIDTH 8
#define ${constantCase(imageName)}_TILE_HEIGHT 8
#define ${constantCase(imageName)}_WIDTH 20
#define ${constantCase(imageName)}_HEIGHT 18
#define ${constantCase(imageName)}_TILE_COUNT ${tileCount}
#define ${constantCase(imageName)}_MAP_SIZE 360
#define ${constantCase(imageName)}_TILE_OFFSET ${tileOffset}
#define ${constantCase(imageName)}_PALETTE_OFFSET ${paletteOffset}

extern const unsigned char ${camelCase(imageName)}Tiles[${constantCase(imageName)}_TILE_COUNT * 16];
extern const unsigned char ${camelCase(imageName)}Map[${constantCase(imageName)}_MAP_SIZE];
extern const uint16_t ${camelCase(imageName)}Palette[4];
`;
}

export function cFileTemplate({
  imageName,
  tileData,
  mapData,
  paletteData,
}: {
  imageName: string;
  tileData: string;
  mapData: string;
  paletteData: string;
}): string {
  return `/**
 * ${camelCase(imageName)}.c
 *
 * Generated with game-boy-tile-tools.calvin.sh
 */

#include "${camelCase(imageName)}.h"
#include <gb/cgb.h>

const unsigned char ${camelCase(imageName)}Tiles[${constantCase(imageName)}_TILE_COUNT * 16] = {
    ${tileData}
};

const unsigned char ${camelCase(imageName)}Map[${constantCase(imageName)}_MAP_SIZE] = {
    ${mapData}
};

const uint16_t ${camelCase(imageName)}Palette[4] = {
    ${paletteData}
};
`;
}

export function mainFileTemplate({ imageName }: { imageName: string }): string {
  return `/**
 * main.c
 *
 * Generated with game-boy-tile-tools.calvin.sh
 */

#include "${camelCase(imageName)}.c"
#include <gb/cgb.h>
#include <gb/gb.h>

void main() {
  DISPLAY_ON;
  SHOW_BKG;

  set_bkg_data(${constantCase(imageName)}_TILE_OFFSET, ${constantCase(imageName)}_TILE_COUNT, ${camelCase(imageName)}Tiles);
  set_bkg_tiles(0, 0, ${constantCase(imageName)}_WIDTH, ${constantCase(imageName)}_HEIGHT, ${camelCase(imageName)}Map);
  set_bkg_palette(${constantCase(imageName)}_PALETTE_OFFSET, 1, ${camelCase(imageName)}Palette);
}
`;
}
