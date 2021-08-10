import properties from '../properties.js';

import tilesetDefinition from '../definitions/tilesetDefinition.json';

export default class Map {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;

    this.tilemap = scene.make.tilemap({ key: 'level-2-1' });
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset');

    this.layers = {}
    this.layers.background = this.tilemap.createLayer('background', this.tileset, 0, 0);
    this.layers.background.setDepth(0);
    this.layers.pickables = this.tilemap.createLayer('pickables', this.tileset, 0, 0);
    this.layers.pickables.setDepth(2);
    this.layers.foreground = this.tilemap.createLayer('foreground', this.tileset, 0, 0);
    this.layers.foreground.setDepth(3);

    this.layers.collision = this.tilemap.createLayer('collision', this.tileset, 0, 0);
    this.layers.collision.visible = false;

    this.tilemap.setCollisionByProperty({ collides: true }, true, true, 'collision');

    if (properties.debug) {
      this.drawDebug();
    }
  }

  registerCollision(character) {
    this.scene.physics.add
      .collider(character, this.layers.collision, this.collideCallback, this.processCallback, this);
  }

  collideCallback(character, tile) {
  }
  
  checkCollideFromAbove(character, tile) {

  }

  processCallback(character, tile) {
    if (tile.index === -1) {
      return false;
    }
    const { collides, collisionStyle } = tile.properties;
    if (!collides) {
      return false;
    }
    switch (collisionStyle) {
      case "solid": return true;
      case "passthroughUp": {
        const characterBottomCenter = character.getBottomCenter();
        const tileTop = tile.getTop();
        return character.body.velocity.y > 0 && characterBottomCenter.y <= tileTop;
      }
    }
  }

  drawDebug() {
    this.debugGraphics = this.scene.add.graphics();
    this.debugGraphics.clear();
    // Pass in null for any of the style options to disable drawing that component
    this.tilemap.renderDebug(this.debugGraphics, {
        tileColor: null, // Non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
    }, "collision");
  }
}
