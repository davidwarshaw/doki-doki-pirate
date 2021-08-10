import properties from "../properties";

const IDLE = 'IDLE';
const WALK = 'WALK';
const RUN = 'RUN';
const PRUN = 'PRUN';
const DUCK = 'DUCK';
const JUMP = 'JUMP';
const FALL = 'FALL';

export default class CharacterSystem {
  constructor(player, inputMultiplexer) {
    this.player = player;

    this.velocityToFrameRateFactor = 0.1;
    this.jumpAccelerationCorrectionFactor = 50;
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
      jumpGravityFactor: 0.035,
    };
    this.constants = {};
    Object.entries(this.rawConstants).forEach(element =>
      this.constants[element[0]] = element[1] * this.constantFactor);
    console.log(this.constants);

    this.pMeter = 0;
    this.pMeterAddition = 0.10;
    this.pMeterDecay = 0.05;
    this.pMax = 100;

    this.stateTime = 0;
    this.maxJumpMillis = 4500;

    this.player.setGravityY(this.constants.gravity * this.gravityFactor);

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
        if (Math.abs(this.player.body.velocity.x) > this.constants.idleThresholdSpeed) {
          this.player.playAnimationForState(WALK, this.timeScaleForVelocity());
        } else {
          this.player.playAnimationForState(IDLE);
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
        break;
      }
      case WALK: {
        if (this.sameDirection(this.player.body.velocity.x, this.inputMultiplexer.dPadVector().x)
          || this.player.body.velocity.x === 0) {
          this.player.playAnimationForState(WALK, this.timeScaleForVelocity());
        } else {
          this.player.playAnimationForState("turn");
        }

        if (this.inputMultiplexer.action()) {
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
      case JUMP: {
        if (this.player.body.onFloor()) {
          this.changeState(IDLE);
          break;
        }
        const jumpTimeElapsed = this.stateTime > this.maxJumpMillis;
        if (jumpTimeElapsed) {
          console.log('jumpTimeElapsed');
        }
        if (!this.inputMultiplexer.action() || jumpTimeElapsed) {
          this.changeState(FALL);
          break;
        }

        const gravity = this.constants.gravity * this.gravityFactor;
        this.player.setAccelerationY(-gravity * this.constants.jumpGravityFactor);

        this.acclerateX(delta, this.constants.airAcceleration);
        break;
      }
      case FALL: {
        if (this.player.body.onFloor()) {
          this.changeState(IDLE);
          break;
        }

        this.acclerateX(delta, this.constants.airAcceleration);
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
        break;
      }
      case WALK: {
        this.player.body.setMaxVelocityX(this.constants.walkSpeedMax);
        this.setDrag(this.constants.groundDrag);
        break;
      }
      case RUN: {
        this.player.body.setMaxVelocityX(this.constants.runSpeedMax);
        this.setDrag(this.constants.groundDrag);
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
      case JUMP: {
        const speed = Math.abs(this.player.body.velocity.x);
        if(speed > this.constants.runSpeedMax) {
          this.jumpAcceleration(-this.constants.prunJumpAcceleration);
          this.player.playAnimationForState("prunjump");
        } else if(speed > this.constants.idleThresholdSpeed) {
          this.jumpAcceleration(-this.constants.walkJumpAcceleration);
          this.player.playAnimationForState(JUMP);
        } else {
          this.jumpAcceleration(-this.constants.idleJumpAcceleration);
          this.player.playAnimationForState(JUMP);
        }

        this.setDrag(this.constants.airDrag);
        break;
      }
      case FALL: {
        this.player.playAnimationForState(FALL);
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
    if (!this.player.body.onFloor()) {
      this.changeState(FALL);
      return true;
    }
    return false;
  }

  checkDuck() {
    if (this.inputMultiplexer.downPressed()) {
      this.changeState(DUCK);
      return true;
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