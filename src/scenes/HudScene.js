import properties from '../properties';

import Font from '../ui/Font';

export default class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    this.barLength = 10;
    this.xPadding = 20;

    const outer = this.playState.level.name.split("-")[1];
    const inner = this.playState.level.currentNumber;

    this.bodiesLeft = this.font.render(8, 6, `${outer}-${inner}`);

    const gameScene = this.scene.get('GameScene');

    gameScene.events.on(
      'change-level',
      payload => {
        const {outer, inner} = payload;
        this.bodiesLeft.setText(`${outer}-${inner}`);
      },
      this
    );
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}
