import properties from "../properties";

import CharacterSystem from "../systems/CharacterSystem";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, map, tile) {
    super(scene, 0, 0, "player", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.map = map;

    this.setCollideWorldBounds(true);

    this.body.useDamping = false;
    this.body.syncBounds = true;

    this.setOrigin(0.5, 0.9);

    this.type = "player";

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    const { tileWidth, tileHeight } = this.map.tilemap;
    this.setPosition(world.x + tileWidth / 2, world.y + tileHeight * 0.5);

    scene.anims.create({
      key: "player_idle",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_walk",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 2, first: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_run",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 2, first: 0 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_prun",
      frames: scene.anims.generateFrameNumbers("player", { start: 3, end: 5, first: 3 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_jump",
      frames: scene.anims.generateFrameNumbers("player", { start: 6, end: 6 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_fall",
      frames: scene.anims.generateFrameNumbers("player", { start: 7, end: 7 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_prunjump",
      frames: scene.anims.generateFrameNumbers("player", { start: 8, end: 8 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_turn",
      frames: scene.anims.generateFrameNumbers("player", { start: 9, end: 9 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_enter",
      frames: scene.anims.generateFrameNumbers("player", { start: 10, end: 10 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });
    scene.anims.create({
      key: "player_duck",
      frames: scene.anims.generateFrameNumbers("player", { start: 12, end: 12 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_dig",
      frames: scene.anims.generateFrameNumbers("player", { start: 12, end: 12 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });
    scene.anims.create({
      key: "player_carry_idle",
      frames: scene.anims.generateFrameNumbers("player", { start: 15, end: 15 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_carry_walk",
      frames: scene.anims.generateFrameNumbers("player", { start: 15, end: 17, first: 15 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_carry_turn",
      frames: scene.anims.generateFrameNumbers("player", { start: 16, end: 16 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_carry_jump",
      frames: scene.anims.generateFrameNumbers("player", { start: 17, end: 17 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });

    this.anims.play("player_walk", true);

    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);

    // and reset the flag when the animation completes
    this.on(
      Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE + "player_action",
      () => {
        // console.log('animation complete: player_action');
        this.inAction = false;
      },
      this
    ); 

    this.sounds = {
      jump: scene.sound.add('jump'),
    };
  }

  hit() {
    console.log('player hit');
  }

  processCollision(character, tile) {
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
        console.log(`character.body.velocity.y: ${character.body.velocity.y}`);
        return character.body.velocity.y > 0;
      }
    }
  }

  playAnimationForState(state, optionalTimeScale) {
    const timeScale = optionalTimeScale || 1;
    const lowcaseState = state.toLowerCase();
    const animationKey = `player_${lowcaseState}`;
    this.anims.play(animationKey, true);
    this.anims.timeScale = timeScale;
    return animationKey;
  }

  update(scene, delta, inputMultiplexer) {
    if (this.body.touching.down) {
      // console.log(`this.body.touching.down`);
    }
  }

}
