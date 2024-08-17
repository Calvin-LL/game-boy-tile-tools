import {
  applyPalette,
  buildPalette,
  utils,
  type ColorDistanceFormula,
  type ImageQuantization,
  type PaletteQuantization,
} from "image-q";
import { toHexString } from "./helpers";

export class PaletteColor {
  constructor(
    public red: number,
    public green: number,
    public blue: number
  ) {
    red = Math.max(0, Math.min(255, red));
    green = Math.max(0, Math.min(255, green));
    blue = Math.max(0, Math.min(255, blue));
  }

  copy({
    red,
    green,
    blue,
  }: {
    red?: number;
    green?: number;
    blue?: number;
  }): PaletteColor {
    return new PaletteColor(
      red ?? this.red,
      green ?? this.green,
      blue ?? this.blue
    );
  }

  toGBDKString(): string {
    return `RGB8(${this.red}, ${this.green}, ${this.blue})`;
  }

  toHex(): string {
    return `#${toHexString(this.red)}${toHexString(this.green)}${toHexString(this.blue)}`;
  }

  equals(color: PaletteColor | string | Uint8Array): boolean {
    if (typeof color === "string") {
      color = PaletteColor.fromHex(color);
    } else if (color instanceof Uint8Array) {
      color = new PaletteColor(color[0], color[1], color[2]);
    }
    return (
      this.red === color.red &&
      this.green === color.green &&
      this.blue === color.blue
    );
  }

  static fromHex(hex: string): PaletteColor {
    if (hex[0] === "#") {
      hex = hex.slice(1);
    }
    return new PaletteColor(
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    );
  }
}

/**
 * Game Boy Color palette, only 4 colors per palette.
 */
export class Palette {
  constructor(
    public color0: PaletteColor,
    public color1: PaletteColor,
    public color2: PaletteColor,
    public color3: PaletteColor
  ) {}

  get(index: number): PaletteColor {
    if (index === 0) {
      return this.color0;
    } else if (index === 1) {
      return this.color1;
    } else if (index === 2) {
      return this.color2;
    } else if (index === 3) {
      return this.color3;
    } else {
      throw new Error("Color index must be between 0 and 3");
    }
  }

  copy({
    color0,
    color1,
    color2,
    color3,
  }: {
    color0?: PaletteColor;
    color1?: PaletteColor;
    color2?: PaletteColor;
    color3?: PaletteColor;
  }): Palette {
    return new Palette(
      color0 ?? this.color0,
      color1 ?? this.color1,
      color2 ?? this.color2,
      color3 ?? this.color3
    );
  }

  copySet(colorIndex: number, color: PaletteColor): Palette {
    return this.copy({
      color0: colorIndex === 0 ? color : undefined,
      color1: colorIndex === 1 ? color : undefined,
      color2: colorIndex === 2 ? color : undefined,
      color3: colorIndex === 3 ? color : undefined,
    });
  }

  set(colorIndex: number, color: PaletteColor) {
    if (colorIndex === 0) {
      this.color0 = color;
    } else if (colorIndex === 1) {
      this.color1 = color;
    } else if (colorIndex === 2) {
      this.color2 = color;
    } else if (colorIndex === 3) {
      this.color3 = color;
    } else {
      throw new Error("Color index must be between 0 and 3");
    }
  }

  indexOf(color: PaletteColor): number {
    if (this.color0.equals(color)) {
      return 0;
    } else if (this.color1.equals(color)) {
      return 1;
    } else if (this.color2.equals(color)) {
      return 2;
    } else if (this.color3.equals(color)) {
      return 3;
    } else {
      throw new Error("Color not found in palette");
    }
  }

  /**
   * returns something like:
   * const uint16_t paletteName[] = {RGB8(255, 255, 255), RGB8(0, 0, 0), RGB8(0, 0, 0), RGB8(0, 0, 0)};
   */
  toGBDKString(): string {
    return `${this.color0.toGBDKString()}, ${this.color1.toGBDKString()}, ${this.color2.toGBDKString()}, ${this.color3.toGBDKString()}`;
  }

  static async fromImage(
    image: HTMLImageElement,
    colorDistanceFormula: ColorDistanceFormula | undefined,
    paletteQuantization: PaletteQuantization | undefined,
    onProgress: (progress: number) => void
  ): Promise<Palette> {
    const pointContainer = utils.PointContainer.fromHTMLImageElement(image);
    const palette = await buildPalette([pointContainer], {
      colorDistanceFormula,
      paletteQuantization,
      colors: 4,
      onProgress: (progress) => onProgress(progress),
    });
    const paletteColors = palette.getPointContainer().getPointArray();
    while (paletteColors.length < 4) {
      // copy the last color to fill the palette
      paletteColors.push(
        paletteColors.at(-1) ?? utils.Point.createByRGBA(0, 0, 0, 255)
      );
    }
    const outPalette = new Palette(
      new PaletteColor(
        paletteColors[0].r,
        paletteColors[0].g,
        paletteColors[0].b
      ),
      new PaletteColor(
        paletteColors[1].r,
        paletteColors[1].g,
        paletteColors[1].b
      ),
      new PaletteColor(
        paletteColors[2].r,
        paletteColors[2].g,
        paletteColors[2].b
      ),
      new PaletteColor(
        paletteColors[3].r,
        paletteColors[3].g,
        paletteColors[3].b
      )
    );

    return outPalette;
  }

  async applyToImage(
    image: HTMLImageElement,
    colorDistanceFormula: ColorDistanceFormula | undefined,
    imageQuantization: ImageQuantization | undefined,
    onProgress: (progress: number) => void
  ): Promise<Uint8Array> {
    const pointContainer = utils.PointContainer.fromHTMLImageElement(image);
    const palette = new utils.Palette();
    [this.color0, this.color1, this.color2, this.color3].forEach((color) => {
      palette.add(
        utils.Point.createByRGBA(color.red, color.green, color.blue, 255)
      );
    });
    const outPointContainer = await applyPalette(pointContainer, palette, {
      colorDistanceFormula,
      imageQuantization,
      onProgress: (progress) => onProgress(progress),
    });
    const outImage = outPointContainer.toUint8Array();

    return outImage;
  }
}
