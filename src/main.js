import 'phaser';

import properties from './properties';

import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import LevelTitleScene from './scenes/LevelTitleScene';
import GameScene from './scenes/GameScene';
import HudScene from './scenes/HudScene';
import GameOverScene from './scenes/GameOverScene';
import WinScene from './scenes/WinScene';

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  roundPixels: true,
  scale: {
    width: properties.width,
    height: properties.height,
    zoom: properties.scale
  },
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: properties.debug,
    }
  },
  input: {
    gamepad: true
  },
  scene: [BootScene, TitleScene, LevelTitleScene, GameScene, HudScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
