import { toHexString } from "./helpers";
import { Palette, PaletteColor } from "./Palette";

/**
 * TilePixel is a single pixel of a tile. It can be 1 of 4 colors from the palette.
 */
export class TilePixel {
  constructor(public color: number) {
    if (color < 0 || color > 3) {
      throw new Error("Color must be between 0 and 3");
    }
  }
}

/**
 * Tile is a 8x8 grid of TilePixels.
 */
export class Tile {
  constructor(public pixels: TilePixel[][]) {
    if (pixels.length !== 8) {
      throw new Error("Tile must have 8 rows");
    }
    for (let row of pixels) {
      if (row.length !== 8) {
        throw new Error("Tile must have 8 columns");
      }
    }
  }

  equals(tile: Tile): boolean {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this.pixels[y][x].color !== tile.pixels[y][x].color) {
          return false;
        }
      }
    }
    return true;
  }

  // see https://gbdev.io/pandocs/Tile_Data.html for the complicated details
  toGBDKBytes(): number[] {
    let bytes: number[] = [];
    for (let y = 0; y < 8; y++) {
      let lowByte = 0;
      let highByte = 0;
      for (let x = 0; x < 8; x++) {
        let color = this.pixels[y][x].color;
        lowByte = lowByte | ((color & 1) << (7 - x));
        highByte = highByte | (((color >> 1) & 1) << (7 - x));
      }
      bytes.push(lowByte);
      bytes.push(highByte);
    }
    return bytes;
  }

  toGBDKString(): string {
    return this.toGBDKBytes()
      .map((b) => toHexString(b, true))
      .join(", ");
  }

  static fromGBDKBytes(bytes: number[]): Tile {
    if (bytes.length !== 16) {
      throw new Error("Tile must have 16 bytes");
    }
    let pixels: TilePixel[][] = [];
    for (let i = 0; i < 16; i += 2) {
      let lowByte = bytes[i];
      let highByte = bytes[i + 1];
      let row: TilePixel[] = [];
      for (let x = 0; x < 8; x++) {
        let color = ((highByte >> (7 - x)) & 1) << 1;
        color = color | ((lowByte >> (7 - x)) & 1);
        row.push(new TilePixel(color));
      }
      pixels.push(row);
    }
    return new Tile(pixels);
  }

  toUint8Array(palette: Palette): Uint8Array {
    const image = new Uint8Array(8 * 8 * 4);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const color = palette.get(this.pixels[y][x].color);
        const i = (y * 8 + x) * 4;
        image[i] = color.red;
        image[i + 1] = color.green;
        image[i + 2] = color.blue;
        image[i + 3] = 255;
      }
    }
    return image;
  }
}

function imageUint8ArrayToImageInPaletteUint8Array(
  image: Uint8Array,
  palette: Palette
): Uint8Array {
  // each pixel in imageInPalette should be a number between 0 and 3
  const imageInPalette = new Uint8Array(image.length / 4);
  for (let i = 0; i < image.length; i += 4) {
    const color = new PaletteColor(image[i], image[i + 1], image[i + 2]);
    const colorIndex = palette.indexOf(color);
    imageInPalette[i / 4] = colorIndex;
  }
  return imageInPalette;
}

export class Tiles {
  constructor(public tiles: Tile[]) {}

  /**
   *
   * @param width the number of pixels in a row of the image
   */
  static fromImageAndPalette(
    image: Uint8Array,
    palette: Palette,
    width: number
  ): Tiles {
    const imageInPalette = imageUint8ArrayToImageInPaletteUint8Array(
      image,
      palette
    );
    const tiles: Tile[] = [];
    for (let y = 0; y < imageInPalette.length / width; y += 8) {
      for (let x = 0; x < width; x += 8) {
        const pixels: TilePixel[][] = [];
        for (let tileY = 0; tileY < 8; tileY++) {
          const row: TilePixel[] = [];
          for (let tileX = 0; tileX < 8; tileX++) {
            const pixelIndex = (y + tileY) * width + x + tileX;
            const color = imageInPalette[pixelIndex];
            row.push(new TilePixel(color));
          }
          pixels.push(row);
        }
        tiles.push(new Tile(pixels));
      }
    }

    return new Tiles(tiles);
  }

  toGBDKString(): string {
    return this.tiles.map((tile) => tile.toGBDKString()).join(",\n");
  }
}
