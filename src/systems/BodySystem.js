import bodyDefinition from '../definitions/bodyDefinition.json';

import TileMath from '../utils/TileMath';
import properties from '../properties';

export default class BodySystem {
  constructor(scene, map, bodies, player) {
    this.scene = scene;
    this.map = map;
    this.bodies = bodies;
    this.player = player;

    this.stepDelta = 1000;
    this.currentDelta = 0;
  }

  randomBodyForLevel(level) {
    const candidates = Object.entries(bodyDefinition)
      .filter(e => e[1].firstLevel <= level)
      .map(e => Number(e[0].split('-')[1]));
    return properties.rng.getItem(candidates);
  }

  matrixHasTile(tile, matrixPosition, matrix) {
    return matrix
      .map((row, y) => row.map((index, x) => ({ index, x, y })))
      .flat()
      .some((matrixTile) =>
        matrixTile.index !== -1 &&
        matrixPosition.x + matrixTile.x === tile.x &&
        matrixPosition.y + matrixTile.y === tile.y);
  }

  getBodyForTile(tile) {
    const candidates = this.bodies
      .filter((body) => body.inPlay)
      .filter((body) => this.matrixHasTile(tile, body.tile, body.matrix));
    if (candidates.length > 0) {
      return candidates[0];
    }
    return null;
  }

  bodiesFall(delta, playerTile) {
    // console.log(`delta: ${delta} this.currentDelta: ${this.currentDelta}`);
    this.currentDelta += delta;
    if (this.currentDelta < this.stepDelta) {
      return;
    }
    this.currentDelta = 0;

    const bodiesFromBottom = this.bodies.filter((body) => body.inPlay).sort((l, r) => l.y - r.y);
    bodiesFromBottom.forEach((body) => {
      const nextTile = Object.assign({}, body.tile);
      nextTile.y += 1;
      if (this.map.spaceForBodyIsClear(nextTile, body.matrix, playerTile, body.tile)) {
        this.map.restoreTerrainTiles(body.tile, body.matrix);
        body.tile = nextTile;
        this.map.addBodyTiles(body.tile, body.matrix);
      }
    });
  }

  hitBody(tile, direction, playerTile) {
    // Figure out what body it is
    const body = this.getBodyForTile(tile);
    if (!body) {
      return;
    }
    const nextTile = TileMath.getTileNeighborByDirection(body.tile, direction);
    this.map.restoreTerrainTiles(body.tile, body.matrix);
    if (this.map.spaceForBodyIsClear(nextTile, body.matrix, playerTile)) {
      body.tile = nextTile;
    }
    this.map.addBodyTiles(body.tile, body.matrix);
  }
}
