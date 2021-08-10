import properties from '../properties';

export default class Cart extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile) {
    super(scene, 0, 0, 'cart', 0);
    scene.add.existing(this);

    this.setOrigin(0, 0);

    this.setDepth(0);

    this.walkSpeed = 0.05;
    this.isDumping = false;
    this.isBringing = true;
    this.pickUp = false;

    this.pickupTileX = -4;
    this.dumpTileX = 4;

    this.carryingBody = null;
    this.carryOffsetX = 64;
    this.carryOffsetY = 18;

    const world = map.tilemap.tileToWorldXY(this.pickupTileX, tile.y);
    this.setPosition(world.x, world.y);

    scene.anims.create({
      key: 'cart_idle',
      frames: scene.anims.generateFrameNumbers('cart', { start: 0, end: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'cart_walk',
      frames: scene.anims.generateFrameNumbers('cart', { start: 0, end: 1, first: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: 'cart_dump',
      frames: scene.anims.generateFrameNumbers('cart', { start: 2, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: 0
    });

    this.anims.play('cart_idle', true);

    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);

    // and reset the flag when the animation completes
    this.on(
      Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE + 'player_action',
      () => {
        // console.log('animation complete: player_action');
        this.inAction = false;
      },
      this
    );

    this.sounds = {
      dump: scene.sound.add('dump'),
    };

    // Start by picking up a body
    this.pickUp = true;
    
  }

  pickUpBody(body) {
    this.carryingBody = body;
    this.carryingBody.setPosition(this.x + this.carryOffsetX, this.y + this.carryOffsetY);
  }

  dumpBody(playerTile) {
    if (!this.carryingBody) {
      return;
    }
    this.carryingBody.dumpFromCart(playerTile);
    this.carryingBody = null;

    this.sounds.dump.play();
  }

  update(scene, delta, playerTile) {
    const adjustedWalkSpeed = delta * this.walkSpeed;

    this.pickUp = false;

    if (this.isDumping) {
      this.anims.play('cart_dump', true);
      this.dumpBody(playerTile);
      scene.time.delayedCall(properties.uiHangMillis, () => {
        this.isDumping = false;
        this.isBringing = false;
      });
    }
    else if (!this.isBringing) {
      this.anims.play('cart_walk', true);
      this.x += -adjustedWalkSpeed;

      const world = scene.map.tilemap.tileToWorldXY(this.pickupTileX, 0);
      if (this.x <= world.x) {
        this.isBringing = true;
        this.pickUp = true;
      }
    }
    else if (this.isBringing) {
      this.anims.play('cart_walk', true);
      this.x += adjustedWalkSpeed;

      const world = scene.map.tilemap.tileToWorldXY(this.dumpTileX, 0);
      if (this.x >= world.x) {
        this.isDumping = true;
      }
    }

    if (this.carryingBody) {
      this.carryingBody.setPosition(this.x + this.carryOffsetX, this.y + this.carryOffsetY);
    }
  }
}
