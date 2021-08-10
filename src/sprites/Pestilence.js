import properties from "../properties";

export default class Pestilence extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile) {
    super(scene, 0, 0, "pestilence", 0);
    scene.add.existing(this);

    this.setOrigin(0, 0);

    this.setDepth(0);

    this.foundInMap = true;
    this.tile = tile;

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y - properties.tileHeight);

    scene.anims.create({
      key: "pestilence",
      frames: scene.anims.generateFrameNumbers("pestilence", { start: 0, end: 1, first: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    this.anims.play('pestilence', true);
  }
}
