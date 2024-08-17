import { expect, it } from "vitest";
import { Tile, TilePixel } from "./Tiles";

it("should be able to generate a GBDK bytes from tile", () => {
  const tile = new Tile([
    [0, 2, 3, 3, 3, 3, 2, 0].map((c) => new TilePixel(c)),
    [0, 3, 0, 0, 0, 0, 3, 0].map((c) => new TilePixel(c)),
    [0, 3, 0, 0, 0, 0, 3, 0].map((c) => new TilePixel(c)),
    [0, 3, 0, 0, 0, 0, 3, 0].map((c) => new TilePixel(c)),
    [0, 3, 1, 3, 3, 3, 3, 0].map((c) => new TilePixel(c)),
    [0, 1, 1, 1, 3, 1, 3, 0].map((c) => new TilePixel(c)),
    [0, 3, 1, 3, 1, 3, 2, 0].map((c) => new TilePixel(c)),
    [0, 2, 3, 3, 3, 2, 0, 0].map((c) => new TilePixel(c)),
  ]);
  const expected: number[] = [
    0x3c, 0x7e, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x7e, 0x5e, 0x7e, 0x0a,
    0x7c, 0x56, 0x38, 0x7c,
  ];

  expect(tile.toGBDKBytes()).toEqual(expected);
});
