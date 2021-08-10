import properties from '../properties';

import Font from '../ui/Font';

export default class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene' });
  }

  create() {
    this.font = new Font(this);

    this.barLength = 10;
    this.xPadding = 20;

    this.bodiesLeft = this.font.render(8, 6, '0-0');

    const gameScene = this.scene.get('GameScene');

    gameScene.events.on(
      'bodies-left',
      payload => {
        const {night, bodiesLeft} = payload;
        this.bodiesLeft.setText(`${night}-${bodiesLeft}`);
      },
      this
    );
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}
