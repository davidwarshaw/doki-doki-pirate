import properties from '../properties';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Cart from '../sprites/Cart';
import Body from '../sprites/Body';

import InputMultiplexer from '../utils/InputMultiplexer';

import BodySystem from '../systems/BodySystem';
import DiseaseSystem from '../systems/DiseaseSystem';
import DigSystem from '../systems/DigSystem';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {

    this.numBodies = 4 + this.playState.level * 2;
    this.allBodiesDropped = false;
    this.gameIsOver = false;

    // Physics
    // this.matter.world.setBounds(0, 0, widthInPixels, heightInPixels);

    // this.collisionCategories = {};
    // this.collisionCategories['main'] = this.matter.world.nextCategory();
    // this.collisionCategories['none'] = this.matter.world.nextCategory();

    // Map and player
    this.map = new Map(this, this.playState.level);
    const { widthInPixels, heightInPixels } = this.map.tilemap;

    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);

    this.player = new Player(this, this.map, { x: 5, y: 3 });

    this.map.registerCollision(this.player);

    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.inputMultiplexer = new InputMultiplexer(this);

    this.buttonIsPressed = true;
    this.gamePadListeners = false;
    
    this.sounds = {
      gameOver: this.sound.add('game-over'),
      nextLevel: this.sound.add('next-level'),
    }
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

    this.player.update(this, delta, this.inputMultiplexer);
    const playerTile = this.map.tilemap.worldToTileXY(this.player.x, this.player.y);
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
