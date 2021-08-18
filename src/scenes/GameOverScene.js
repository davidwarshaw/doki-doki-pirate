import properties from '../properties';

import Font from '../ui/Font';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    this.images = [];

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images.push(this.add.image(centerX, centerY + 30, 'player'));

    const message = `That's all folks!`;
    this.images.push(this.font.render(centerX + this.offsetForText(message), centerY, message));  
    this.input.keyboard.on('keydown', () => this.keyDown());
    this.buttonIsPressed = false;
    this.gamePadListeners = false;

    this.sounds = {
      enter: this.sound.add('enter'),
    }
  }

  update() {
    if (!this.gamePadListeners && this.input.gamepad && this.input.gamepad.pad1) {
      this.input.gamepad.pad1.on('down', () => {
        if (!this.buttonIsPressed) {
          this.keyDown();
        }
      });
      this.input.gamepad.pad1.on('up', () => this.buttonIsPressed = false);
      this.gamePadListeners = true;
    }
  }

  offsetForText(text) {
    const offset = - ((text.length * 8) / 2) - 80;
    return offset;
  }

  keyDown() {
    this.sounds.newGame.play();
    this.input.gamepad.removeAllListeners();
    this.scene.start('LevelTitleScene', this.playState);
  }

}
