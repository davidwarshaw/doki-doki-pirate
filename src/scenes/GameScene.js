import properties from '../properties';

import Map from '../sprites/Map';
import Player from '../sprites/Player';

import InputMultiplexer from '../utils/InputMultiplexer';
import CharacterSystem from '../systems/CharacterSystem';
import VeggieSystem from '../systems/VeggieSystem';
import Enemies from '../sprites/Enemies';
import DoorSystem from '../systems/DoorSystem';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {

    // Map and player
    this.map = new Map(this, this.playState.level);
    const { widthInPixels, heightInPixels } = this.map.tilemap;

    this.player = new Player(this, this.map, this.playState.level.player.tile);

    this.characterSystem = new CharacterSystem(
      this, this.map, this.player, this.playState.level);
    
    this.enemies = new Enemies(this, this.map, this.player, this.characterSystem);
    
    this.veggieSystem = new VeggieSystem(
      this, this.map, this.player,  this.playState.level, this.enemies);

      this.doorSystem = new DoorSystem(
      this, this.map, this.player, this.playState.level);

    this.map.registerCollision(this.player, this.player.processCollision, () => {});

    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);

    this.physics.world.on('worldstep', this.worldStep, this);

    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.inputMultiplexer = new InputMultiplexer(this);

    this.buttonIsPressed = true;
    this.gamePadListeners = false;
    
    this.sounds = {
      gameOver: this.sound.add('game-over'),
      nextLevel: this.sound.add('next-level'),
    }

    this.cameras.main.fadeIn(properties.fadeMillis);
  }

  update(time, delta) {
    if (!this.gamePadListeners && this.input.gamepad && this.input.gamepad.pad1) {
      this.input.gamepad.pad1.on('up', () => this.buttonIsPressed = false);
      this.gamePadListeners = true;
      this.inputMultiplexer.registerPad();
    }

    this.inputMultiplexer.setPadButtons();

    if (this.gameIsOver) {
      return;
    }

    
    this.characterSystem.update(delta, this.inputMultiplexer);
    
    this.player.update(delta, this.inputMultiplexer);

    this.enemies.update(delta);

    this.doorSystem.update(delta);
  }

  worldStep(delta) {
    if (!this.veggieSystem || !this.characterSystem) {
      return;
    }
    this.characterSystem.worldStep(delta);
    this.veggieSystem.worldStep(delta);
  }

  enterDoor(tileX, tileY, fromNumber, toNumber) {
    this.playState.level.previousNumber = fromNumber;
    this.playState.level.currentNumber = toNumber;
    this.playState.level.player.tile = {
      x: tileX,
      y: tileY,
    };

    const outer = this.playState.level.name.split("-")[1];
    const inner = this.playState.level.currentNumber;
    this.events.emit('change-level', { outer, inner });

    this.cameras.main.fadeOut(properties.fadeMillis);
    this.scene.restart(this.playState);
  }

  enterExitDoor() {
    this.playState.level = {};
    this.cameras.main.fadeOut(properties.fadeMillis);
    this.scene.stop('HudScene');
    this.scene.start('WinScene', this.playState);
  }

  updateMeters(pestilence, infection) {
    const meters = { pestilence, infection };
    this.events.emit('update-meters', meters);
  }

  checkMeters() {
    if (this.allBodiesDropped && this.diseaseSystem.allBodiesBuried()) {
      const win = true;
      this.endPlay(win);
      this.events.emit('show-win', {});
    } else if (this.diseaseSystem.pestilence >= 100) {
      const win = false;
      this.endPlay(win);
      this.events.emit('show-loss', 'pestilence');
    } else if (this.diseaseSystem.infection >= 100) {
      const win = false;
      this.endPlay(win);
      this.events.emit('show-loss', 'infection');
    }
  }

  nextLevel() {
    this.playState.level += 1;
    if (this.playState.level < this.playState.maxLevels) {
      this.scene.stop('HudScene');
      this.scene.start('LevelTitleScene', this.playState);
    } else {
      this.scene.stop('HudScene');
      this.scene.start('WinScene', this.playState);
    }
  }

  gameOver() {
    this.scene.stop('HudScene');
    this.scene.start('GameOverScene', this.playState);
  }

  endPlay(win) {
    this.gameIsOver = true;
    
    this.player.anims.play("player_idle", true);
    this.player.setVelocity(0);
    this.player.sounds.walk.stop();
    
    if (win) {
      this.sounds.nextLevel.play();
      this.endPlayTimer = this.time.delayedCall(
        properties.levelWaitMillis,
        () => this.nextLevel(),
        [], this);
    } else {
      this.sounds.gameOver.play();
      this.endPlayTimer = this.time.delayedCall(
        properties.levelWaitMillis,
        () => this.gameOver(),
        [], this);
    }

  }
}
