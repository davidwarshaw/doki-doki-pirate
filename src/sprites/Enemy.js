import properties from "../properties";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene);
    this.scene = scene;

    this.setOrigin(0.5, 0.9);
    this.setDepth(18);

    this.enemyDieBumpSpeed = 100;
    this.enemyFlickerMillis = 1000;

    this.alive = true;
    this.beingCarried = false;
    this.beingThrown = false;
    this.speed = 30;
    this.moveDirection = {
      x: -1,
      y: 0,
    };

    this.sounds = {
      dig: scene.sound.add('dig'),
      fill: scene.sound.add('fill'),
      hit: scene.sound.add('hit'),
      stone: scene.sound.add('stone'),
    };
  }

  initialize(gravity) {
    this.gravity = gravity;

    this.scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;

    this.body.useDamping = false;
    this.body.syncBounds = true;


    this.scene.anims.create({
      key: 'roja_walk',
      frames: this.scene.anims.generateFrameNumbers('enemy-roja', { start: 0, end: 1 }),
      frameRate: properties.animFrameRate - 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: 'roja_die',
      frames: this.scene.anims.generateFrameNumbers('enemy-roja', { start: 2, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });

    this.setGravityY(this.gravity);
    // this.body.setMaxSpeed(this.speed);

    this.anims.play('roja_walk', true);
  }

  update(delta) {
    if (!this.alive) {
      return;
    }

    if (this.beingCarried || this.beingThrown) {
      return;
    }

    const velocity = this.speed * this.moveDirection.x;
    this.setVelocityX(velocity);
    this.flipX = velocity < 0;

    this.previousPosition = { x: this.body.x, y: this.body.y };
  }

  getPositionDelta() {
    return {
      x: this.body.x - this.previousPosition.x,
      y: this.body.y - this.previousPosition.y,
    };
  }

  carry(x, y) {
    if (!this.alive) {
      return;
    }
    this.beingCarried = true;

    this.flipY = true;
    this.setVelocity(0);
    this.setGravity(0);

    if (this.colliders.playerCollider) {
      this.colliders.playerCollider.destroy();
      this.colliders.playerCollider = null;
    }

    this.setPosition(x, y);
  }

  throw() {
    this.beingCarried = false;
    this.beingThrown = true;

    this.setGravityY(this.gravity);

    if (this.colliders.mapCollider) {
      this.colliders.mapCollider.destroy();
      this.colliders.mapCollider = null;
    }
  }

  kill() {
    if (!this.alive) {
      return;
    }
    this.alive = false;
    this.flipY = true;

    this.setVelocityY(-this.enemyDieBumpSpeed);

    if (this.colliders.mapCollider) {
      this.colliders.mapCollider.destroy();
      this.colliders.mapCollider = null;
    }
    if (this.colliders.playerCollider) {
      this.colliders.playerCollider.destroy();
      this.colliders.playerCollider = null;
    }

    // const tweens = [...Array(10).keys()].map(i => ({ alpha: 0, yoyo: true }));
    // const timelineConfig = {
    //   tweens, targets: this, totalDuration: this.enemyFlickerMillis
    // };
    // const timeline = this.scene.tweens.createTimeline(timelineConfig);
    // timeline.play();

    // console.log(timeline.isPlaying());

    const animationKey = "roja_die";
    this.anims.play(animationKey, true);
  }

  changeDirection() {
    this.moveDirection.x *= -1;
    this.setVelocityX(0);
  }
}