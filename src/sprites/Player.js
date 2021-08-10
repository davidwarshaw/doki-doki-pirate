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

    this.setDepth(1);

    this.type = "player";

    this.walkSpeed = 100;
    this.airwalkSpeed = 80;
    this.jumpSpeed = 220;

    this.inJump = false;
    this.inAction = false;

    this.jumpPressed = false;
    this.actionPressed = false;

    const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    this.setPosition(world.x, world.y);

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
      key: "player_duck",
      frames: scene.anims.generateFrameNumbers("player", { start: 12, end: 12 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_carry",
      frames: scene.anims.generateFrameNumbers("player", { start: 15, end: 17, first: 15 }),
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

    this.characterSystem = new CharacterSystem(this);

    this.sounds = {
      walk: scene.sound.add('walk', { loop: true }),
      jump: scene.sound.add('jump'),
    };
  }

  isTouching() {
    return this.touching.left || this.touching.right || this.touching.up || this.touching.down;
  }

  playAnimationForState(state, optionalTimeScale) {
    const timeScale = optionalTimeScale || 1;
    const lowcaseState = state.toLowerCase();
    this.anims.play(`player_${lowcaseState}`, true);
    this.anims.timeScale = timeScale;
  }

  update(scene, delta, inputMultiplexer) {
    this.characterSystem.update(delta, inputMultiplexer);
  }

  updateBackup(scene, delta, inputMultiplexer) {
    
    this.digDirection = null;

    const onSomething = this.body.onFloor();

    // Reset pressed flags
    if (!inputMultiplexer.jump()) {
      this.jumpPressed = false;
    }
    if (!inputMultiplexer.action()) {
      this.actionPressed = false;
    }

    let actionThisUpdate = false;

    // If we land, the jump is over
    if (onSomething) {
      this.inJump = false;
    }

    if (inputMultiplexer.jump() && onSomething && !this.jumpPressed) {
      // console.log('Keys: jump');
      if (!this.inAction) {
        this.anims.play("player_jump", true);
        this.sounds.jump.play();
        this.sounds.walk.stop();
      }
      this.setVelocityY(-this.jumpSpeed);
      this.jumpPressed = true;
      this.inJump = true;
    }

    if (inputMultiplexer.action() && !this.actionPressed && !this.inAction) {
      // console.log('Keys: action');
      this.anims.play("player_action", true);
      this.sounds.walk.stop();
      this.actionPressed = true;
      this.inAction = true;
      actionThisUpdate = true;
    }

    if (inputMultiplexer.up()) {
      // console.log('Keys: up');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
      }
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "up";
      }
    } else if (inputMultiplexer.down()) {
      // console.log('Keys: down');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
      }
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "down";
      }
    } else if (inputMultiplexer.left()) {
      // console.log('Keys: left');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
        if (!this.sounds.walk.isPlaying) {
          this.sounds.walk.play();
        }
      }
      const walkSpeed = onSomething ? this.walkSpeed : this.airwalkSpeed;
      this.setVelocityX(-walkSpeed);
      this.flipX = true;
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "left";
      }
    } else if (inputMultiplexer.right()) {
      // console.log('Keys: right');
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_walk", true);
        if (!this.sounds.walk.isPlaying) {
          this.sounds.walk.play();
        }
      }
      const walkSpeed = onSomething ? this.walkSpeed : this.airwalkSpeed;
      this.setVelocityX(walkSpeed);
      this.flipX = false;
      if (this.inAction && actionThisUpdate) {
        this.digDirection = "right";
      }
    } else {
      if (!this.inAction && !this.inJump) {
        this.anims.play("player_idle", true);
        this.sounds.walk.stop();
      }
      this.setVelocityX(0);
    }

    // If we end action in a jump, switch the animation to the jump anim
    if (this.inJump && !this.inAction) {
      this.anims.play("player_jump", true);
    }

    // If we're falling, switch the animation to the jump anim
    if (!onSomething && !this.inJump && !this.inAction) {
      this.anims.play("player_jump", true);
    }

    // Keep player in bounds
    if (this.x < 0) {
      this.setPosition(0 + 1, this.y);
      this.setVelocityX(0);
    } else if (this.x > (this.map.tilemap.widthInPixels)) {
      this.setPosition((this.map.tilemap.widthInPixels) - 1, this.y);
      this.setVelocityX(0);
    }
  }
}
