import properties from '../properties';

export default class DigDirt extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile, direction) {
    super(scene, 0, 0, 'dig-dirt', 0);
    scene.add.existing(this);

    this.setOrigin(0, 0);

    this.setDepth(0);

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y);

    scene.anims.create({
      key: 'dig-horizontal',
      frames: scene.anims.generateFrameNumbers('dig-dirt', { start: 0, end: 1, first: 0 }),
      frameRate: properties.animFrameRate,
      repeat: 0
    });
    scene.anims.create({
      key: 'dig-vertical',
      frames: scene.anims.generateFrameNumbers('dig-dirt', { start: 2, end: 3, first: 2 }),
      frameRate: properties.animFrameRate,
      repeat: 0
    });

    switch(direction) {
      case 'up': {
        this.anims.play('dig-vertical', true);
        break;
      }
      case 'down': {
        this.anims.play('dig-vertical', true);
        this.flipY = true;
        break;
      }
      case 'left': {
        this.anims.play('dig-horizontal', true);
        this.flipX = true;
        break;
      }
      case 'right': {
        this.anims.play('dig-horizontal', true);
        break;
      }
    }

    // and reset the flag when the animation completes
    this.on(
      Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE + 'dig-horizontal',
      () => {
        // console.log('animation complete: player_action');
        this.destroy();
      },
      this
    );
    this.on(
      Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE + 'dig-vertical',
      () => {
        // console.log('animation complete: player_action');
        this.destroy();
      },
      this
    );
  }
}
