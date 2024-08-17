import { Tile, Tiles } from "./Tiles";
import { toHexString } from "./helpers";

export class TileMap {
  constructor(public map: number[]) {}

  static fromTiles(rawTile: Tiles, tileOffset: number): [TileMap, Tiles] {
    // remove duplicate tiles
    const resultTiles: Tile[] = [];
    const tileMap: number[] = [];

    for (let tile of rawTile.tiles) {
      let index = resultTiles.findIndex((t) => t.equals(tile));
      if (index === -1) {
        index = resultTiles.length;
        resultTiles.push(tile);
      }
      tileMap.push(index + tileOffset);
    }

    return [new TileMap(tileMap), new Tiles(resultTiles)];
  }

  toGBDKString(): string {
    return this.map.map((b) => toHexString(b, true)).join(", ");
  }
}
