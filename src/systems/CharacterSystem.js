import properties from "../properties";

const IDLE = 'IDLE';
const WALK = 'WALK';
const RUN = 'RUN';
const PRUN = 'PRUN';
const DUCK = 'DUCK';
const DIG = 'DIG';
const JUMP = 'JUMP';
const FALL = 'FALL';
const THROW = 'THROW';
const ENTER = 'ENTER';

export default class CharacterSystem {
  constructor(scene, map, player, level) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.level = level;

    this.velocityToFrameRateFactor = 0.1;
    this.jumpAccelerationCorrectionFactor = 40;
    this.dragCorrectionFactor = 100;
    this.gravityFactor = 25;
    this.constantFactor = 12;
    this.rawConstants = {
      gravity: 2,
      idleThresholdSpeed: 0.05,
      walkAcceleration: 2,
      walkSpeedMax: 7.4,
      runAcceleration: 2,
      runSpeedMax: 12.8,
      prunAcceleration: 2,
      prunSpeedMax: 18.2,
      idleJumpAcceleration: 25,
      walkJumpAcceleration: 27.6,
      prunJumpAcceleration: 30,
      airAcceleration: 1.5,
      groundDrag: 1,
      airDrag: 0.4,
      jumpGravityFactor: 0.02,
      runJumpGravityFactor: 0.06,
      throwVelocity: 15,
      throwVelocityUpConstant: 5,
      throwVelocityVerticalConstant: 4,
    };
    this.constants = {};
    Object.entries(this.rawConstants).forEach(element =>
      this.constants[element[0]] = element[1] * this.constantFactor);
    console.log(this.constants);

    this.pMeter = 0;
    this.pMeterAddition = 0.12;
    this.pMeterDecay = 0.06;
    this.pMax = 100;

    this.stateTime = 0;
    this.maxJumpMillis = 500;

    this.depth = {
      jump: 29,
      fall: 19,
    }

    this.player.setGravityY(this.constants.gravity * this.gravityFactor);

    this.carrying = !!this.level.veggies.carried;

    this.currentState = null;
    this.previousState = null;
    this.changeState(WALK);
  }

  update(delta, inputMultiplexer) {
    this.inputMultiplexer = inputMultiplexer;

    this.player.setAcceleration(0, 0);

    // console.log(`currentState: ${this.currentState}`);
    switch(this.currentState) {
      case IDLE: {
        const walkState = this.carrying ? "carry_walk" : WALK;
        const idleState = this.carrying ? "carry_idle" : IDLE;
        if (Math.abs(this.player.body.velocity.x) > this.constants.idleThresholdSpeed) {
          this.player.playAnimationForState(walkState, this.timeScaleForVelocity());
        } else {
          this.player.playAnimationForState(idleState);
        }

        if (this.inputMultiplexer.dPadVector().x != 0) {
          this.changeState(WALK);
          break;
        }

        if (this.checkFall()) {
          break;
        };
        if (this.checkJump()) {
          break;
        };
        if (this.checkDig()) {
          break;
        };
        if (this.checkThrow()) {
          break;
        };
        if (this.checkEnter()) {
          break;
        }
        break;
      }
      case WALK: {
        const walkState = this.carrying ? "carry_walk" : WALK;
        const turnState = this.carrying ? "carry_turn" : "turn";
        if (this.sameDirection(this.player.body.velocity.x, this.inputMultiplexer.dPadVector().x)
          || this.player.body.velocity.x === 0) {
          this.player.playAnimationForState(walkState, this.timeScaleForVelocity());
        } else {
          this.player.playAnimationForState(turnState);
        }

        if (!this.carrying && this.inputMultiplexer.action()) {
          this.changeState(RUN);
          break;
        }

        if (this.checkIdle()) {
          break;
        };
        if (this.checkFall()) {
          break;
        };
        if (this.checkJump()) {
          break;
        };
        if (this.checkThrow()) {
          break;
        };
        if (this.checkEnter()) {
          break;
        }

        this.acclerateX(delta, this.constants.walkAcceleration);
        break;
      }
      case RUN: {
        if (this.sameDirection(this.player.body.velocity.x, this.inputMultiplexer.dPadVector().x)
          || this.player.body.velocity.x === 0) {
          this.player.playAnimationForState(RUN, this.timeScaleForVelocity());
        } else {
          this.player.playAnimationForState("turn");
        }
        
        if (!this.inputMultiplexer.action()) {
          this.changeState(WALK);
          break;
        }

        if (Math.round(this.pMeter) >= this.pMax - 1) {
          this.changeState(PRUN);
          break;
        }

        if (this.checkIdle()) {
          break;
        };
        if (this.checkFall()) {
          break;
        };
        if (this.checkJump()) {
          break;
        };

        this.acclerateX(delta, this.constants.runAcceleration);
        this.buildPMeter(delta);
        break;
      }
      case PRUN: {
        const dPadX = this.inputMultiplexer.dPadVector().x;
        const playerX = this.player.body.velocity.x;
        const sameDirection = this.sameDirection(dPadX, playerX);

        if (sameDirection || this.player.body.velocity.x === 0) {
          this.player.playAnimationForState(PRUN, this.timeScaleForVelocity());
        } else {
          this.player.playAnimationForState("turn");
        }
        

        if (!this.inputMultiplexer.action() || !sameDirection) {
          this.changeState(WALK);
          break;
        }

        if (this.checkFall()) {
          break;
        };
        if (this.checkJump()) {
          break;
        };

        this.acclerateX(delta, this.constants.prunAcceleration);
        break;
      }
      case DUCK: {
        break;
      }
      case DIG: {
        break;
      }
      case JUMP: {
        if (this.player.body.velocity.y > 0) {
          this.changeState(FALL);
          break;
        }
        if (this.onSomething(this.player)) {
          this.changeState(IDLE);
          break;
        }
        const jumpTimeElapsed = this.stateTime > this.maxJumpMillis;
        if (jumpTimeElapsed) {
          console.log('jumpTimeElapsed');
        }
        if (!this.inputMultiplexer.jump() || jumpTimeElapsed) {
          this.changeState(FALL);
          break;
        }

        const gravity = this.constants.gravity * this.gravityFactor;
        const jumpFactor = this.inputMultiplexer.action() ?
          this.constants.runJumpGravityFactor :
          this.constants.jumpGravityFactor;
        this.player.setAccelerationY(-gravity * jumpFactor);

        this.acclerateX(delta, this.constants.airAcceleration);

        if (this.checkThrow()) {
          break;
        };
        break;
      }
      case FALL: {
        if (this.onSomething(this.player)) {
          this.changeState(IDLE);
          break;
        }

        this.acclerateX(delta, this.constants.airAcceleration);

        if (this.checkThrow()) {
          break;
        };
        if (this.checkEnter()) {
          break;
        }
        break;
      }
      case THROW: {
        break;
      }
      case ENTER: {
        break;
      }
    }

    this.setAnimationFlip();

    this.decayPMeter(delta);
    
    this.stateTime += delta;

    // console.log(`state: ${this.currentState}`);
    if (Math.round(this.pMeter) >= this.pMax - 1) {
      console.log(`p-meter: ${this.pMeter}`);
    }

    // console.log(`player: ${this.player.body.velocity.x}, ${this.player.body.velocity.y}`);
  }

  worldStep(delta) {
    if (!this.player) {
      return;
    }
    if (!!this.player.riding) {
      const deltaX = this.player.riding.body.deltaX();
      const deltaY = this.player.riding.body.deltaY();
      const { x, y } = this.player;
      // console.log(`player: ${x}, ${y} positionDelta: ${positionDelta.x}, ${positionDelta.y}`);
      this.player.setPosition(x + deltaX, y + deltaY);
    }
  }

  changeState(newState) {
    if (newState === this.currentState) {
      console.log(`Skipping redundant state change to: ${newState}`);
    }

    console.log(`State change from: ${this.currentState} to: ${newState}`);
    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateTime = 0;

    switch(this.currentState) {
      case IDLE: {
        this.setDrag(this.constants.groundDrag);
        this.player.setDepth(this.depth.fall);
        break;
      }
      case WALK: {
        this.player.body.setMaxVelocityX(this.constants.walkSpeedMax);
        this.setDrag(this.constants.groundDrag);
        this.player.setDepth(this.depth.fall);
        break;
      }
      case RUN: {
        this.player.body.setMaxVelocityX(this.constants.runSpeedMax);
        this.setDrag(this.constants.groundDrag);
        this.player.setDepth(this.depth.fall);
        break;
      }
      case PRUN: {
        this.player.body.setMaxVelocityX(this.constants.prunSpeedMax);
        this.setDrag(this.constants.groundDrag);
        this.player.playAnimationForState(PRUN);
        break;
      }
      case DUCK: {
        this.setDrag(this.constants.duckDrag);
        break;
      }
      case DIG: {
        this.setDrag(this.constants.duckDrag);
        this.playDigAndChangeState();

        // NOTE: is there a better way to do this?
        this.scene.veggieSystem.dig();
        this.carrying = true;

        // Digging zeros the pmeter
        this.pMeter = 0;

        this.player.sounds.jump.play();
        break;
      }
      case JUMP: {
        const jumpState = this.carrying ? "carry_jump" : JUMP;
        const speed = Math.abs(this.player.body.velocity.x);
        if(speed > this.constants.runSpeedMax) {
          this.jumpAcceleration(-this.constants.prunJumpAcceleration);
          this.player.playAnimationForState("prunjump");
        } else if(speed > this.constants.idleThresholdSpeed) {
          this.jumpAcceleration(-this.constants.walkJumpAcceleration);
          this.player.playAnimationForState(jumpState);
        } else {
          this.jumpAcceleration(-this.constants.idleJumpAcceleration);
          this.player.playAnimationForState(jumpState);
        }

        this.setDrag(this.constants.airDrag);
        this.player.setDepth(this.depth.jump);

        this.player.riding = null;
        break;
      }
      case FALL: {
        const fallState = this.carrying ? "carry_jump" : FALL;
        this.player.playAnimationForState(fallState);

        // Falling zeros the pmeter
        this.pMeter = 0;

        this.player.riding = null;
        break;
      }
      case THROW: {
        // NOTE: is there a better way to do this?
        const anyDirectionPressed =
          this.inputMultiplexer.left() || this.inputMultiplexer.right() ||
          this.inputMultiplexer.up() || this.inputMultiplexer.down();
        const verticalPressed = !this.inputMultiplexer.left() && !this.inputMultiplexer.right() &&
          (this.inputMultiplexer.up() || this.inputMultiplexer.down());

        const facingSign = this.player.flipX ? -1 : 1;
        const throwVectorX = anyDirectionPressed ?
          this.inputMultiplexer.dPadVector().x :
          facingSign;
        const throwVelocityY = verticalPressed ?
          this.constants.throwVelocity + this.constants.throwVelocityVerticalConstant :
          this.constants.throwVelocity;

        const throwVelocity = {
          x: this.constants.throwVelocity * throwVectorX,
          y: throwVelocityY * this.inputMultiplexer.dPadVector().y,
        };
        this.scene.veggieSystem.throw(
          throwVelocity,
          this.constants.throwVelocityUpConstant,
          this.constants.gravity * this.gravityFactor);
        this.carrying = false;

        // Change back to the previous state, unless we were prunning, then just run
        if (this.previousState != PRUN) {
          this.changeState(this.previousState);
        } else {
          this.changeState(RUN);
        }
        break;
      }
      case ENTER: {
        this.playEnterAndEnterDoor();
        break;
      }
    }
  }

  checkIdle() {
    if (this.inputMultiplexer.dPadVector().x === 0) {
      this.changeState(IDLE);
      return true;
    }
    return false;
  }

  checkFall() {
    if (!this.onSomething(this.player)) {
      this.changeState(FALL);
      return true;
    }
    return false;
  }

  checkDuck() {
    if (!this.carrying && this.inputMultiplexer.downPressed()) {
      this.changeState(DUCK);
      return true;
    }
    return false;
  }

  checkDig() {
    if (!this.carrying && this.inputMultiplexer.downPressed()) {
      const { x, y } = this.player;
      const veggieTile = this.map.getVeggieTileWorldXY(x, y);
      if (veggieTile || this.player.riding) {
        this.changeState(DIG);
        return true;
      }
    }
    return false;
  }

  checkJump() {
    if (this.inputMultiplexer.jumpPressed()) {
      this.changeState(JUMP);
      return true;
    }
    return false;
  }

  checkThrow() {
    if (this.carrying && this.inputMultiplexer.actionPressed()) {
      this.changeState(THROW);
      return true;
    }
    return false;
  }

  checkEnter() {
    const { x, y } = this.player;
    if (this.inputMultiplexer.upPressed() && this.scene.doorSystem.isDoor(x, y)) {
      this.changeState(ENTER);
      return true;
    }
    return false;
  }

  timeScaleForVelocity() {
    const frameRate = Math.round(Math.abs(this.player.body.velocity.x) * this.velocityToFrameRateFactor);
    const timeScale = frameRate / properties.animFrameRate;
    return timeScale;
  }

  acclerateX(delta, constant) {
    const acceleration = this.inputMultiplexer.dPadVector().x * constant * delta;
    this.player.setAccelerationX(acceleration);
  }

  jumpAcceleration(acceleration) {
    this.player.setAccelerationY(acceleration * this.jumpAccelerationCorrectionFactor);
  }

  playDigAndChangeState() {
    const animationKey = this.player.playAnimationForState(DIG);
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey, () => {
      this.changeState(IDLE);
    });
  }

  playEnterAndEnterDoor() {
    const animationKey = this.player.playAnimationForState(ENTER);
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey, () => {
      this.scene.doorSystem.enter(this.player.x, this.player.y);
    });
  }


  setDrag(drag) {
    this.player.setDragX(drag * this.dragCorrectionFactor);
  }

  setSpeedMax() {
    if(this.pMeter >= this.pMax && this.inputMultiplexer.action()){
      this.player.body.setMaxVelocityX(this.constants.prunSpeedMax);
    } else if (this.inputMultiplexer.action()) {
      this.player.body.setMaxVelocityX(this.constants.runSpeedMax);
    } else {
      this.player.body.setMaxVelocityX(this.constants.walkSpeedMax);
    }
  }

  setAnimationFlip() {
    if (this.inputMultiplexer.left()) {
      this.player.flipX = true;
    }
    if (this.inputMultiplexer.right()) {
      this.player.flipX = false;
    }
  }

  onSomething(character) {
    return character.body.onFloor() || !!character.riding;
  }

  buildPMeter(delta) {
    const addition = this.pMeterAddition * delta;
    this.pMeter = Phaser.Math.Clamp(this.pMeter + addition, 0, 100);
  }

  decayPMeter(delta) {
    const decay = this.pMeterDecay * delta;
    this.pMeter = Phaser.Math.Clamp(this.pMeter - decay, 0, 100);
  }

  sameDirection(vectorA, vectorB) {
    return this.sign(vectorA) === this.sign(vectorB);
  }

  sign(vector) {
    let sign = 0;
    if (vector > 0) {
      sign = 1;
    }
    if (vector < 0) {
      sign = -1;
    }
    return sign;
  }
}