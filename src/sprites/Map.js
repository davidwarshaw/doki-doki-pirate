import properties from '../properties.js';

import levelDefinitions from '../definitions/levelDefinitions.json';

export default class Map {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;

    this.levelDefinition = levelDefinitions[level.name];
    this.levelNumber = this.level.currentNumber;

    const levelKey = `${level.name}-${this.levelNumber}`
    const backgroundKey = this.levelDefinition[this.levelNumber].background;

    this.tilemap = scene.make.tilemap({ key: levelKey });
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset');

    this.layers = {}
    this.layers.background = this.tilemap.createLayer('background', this.tileset, 0, 0);
    this.layers.background.setDepth(10);
    this.layers.veggies = this.tilemap.createLayer('veggies', this.tileset, 0, 0);
    this.layers.veggies.setDepth(20);
    this.layers.foreground = this.tilemap.createLayer('foreground', this.tileset, 0, 0);
    this.layers.foreground.setDepth(30);

    this.layers.collision = this.tilemap.createLayer('collision', this.tileset, 0, 0);
    this.layers.collision.visible = false;

    this.tilemap.setCollisionByProperty({ collides: true }, true, true, 'collision');

    this.background = scene.add
      .tileSprite(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels, backgroundKey)
      .setOrigin(0)
      .setScrollFactor(0.5, 0.25)
      .setDepth(0);


    if (properties.debug) {
      this.drawDebug();
    }
  }

  getVeggieTileWorldXY(x, y) {
    const pickableTile = this.layers.veggies.getTileAtWorldXY(x, y);
    return pickableTile;
  }

  registerCollision(character, processCollision, afterCollision) {
    return this.scene.physics.add
      .collider(character, this.layers.collision, afterCollision, processCollision, character);
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
