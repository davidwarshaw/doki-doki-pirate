import properties from "../properties";

import Pestilence from "../sprites/Pestilence";

export default class DiseaseSystem {
  constructor(scene, map, bodies, player) {
    this.scene = scene;
    this.map = map;
    this.bodies = bodies;
    this.player = player;

    this.numBodiesExposed = 0;

    this.barLength = 10;

    this.oldPestilence = 0;
    this.pestilence = 0;
    this.pestilenceIncreaseFactor = 0.001;
    this.pestilenceDiminishFactor = 0.005;

    this.oldInfection = 0;
    this.infection = 0;
    this.infectionIncreaseFactor = 0.02;
    this.infectionDiminishFactor = 0.02;

    this.pestilences = {};

    this.sounds = {
      pestilence: scene.sound.add('pestilence'),
      infection: scene.sound.add('infection'),
    };
  }

  allBodiesBuried() {
    return this.numBodiesExposed === 0;
  }

  bodyExposedInColumn(column) {
    const tile = { x: column, y: 0 };
    while (tile.y < properties.tileHeight && this.map.tileIsClear(tile)) {
      tile.y += 1;
    }
    if (tile.y >= properties.tileHeight) {
      return false;
    }
    const bodyExposed = this.map.tileIsBody(tile);

    // If this tile is exposed, add pestilence sprite
    if (bodyExposed) {
      const tileKey = `${tile.x}-${tile.y}`;
      if (tileKey in this.pestilences) {
        this.pestilences[tileKey].foundInMap = true;
      } else {
        this.pestilences[tileKey] = new Pestilence(this.scene, this.map, tile);
      }
    }

    return bodyExposed;
  }

  updatePestilence(delta) {
    // Set the dirty flags for the pestilence sprites
    Object.entries(this.pestilences).forEach((e) => (e[1].foundInMap = false));

    const bodiesExposed = [...Array(properties.tileHeight).keys()]
      .map((column) => this.bodyExposedInColumn(column))
      .map((exposed) => (exposed ? 1 : 0))
      .reduce((acc, curr) => acc + curr, 0);

    this.numBodiesExposed = bodiesExposed;

    // If the dirty flags are still set, destroy the sprite and leave them out of the copy
    const newPestilences = {};
    Object.entries(this.pestilences).forEach((e) => {
      if (!e[1].foundInMap) {
        e[1].destroy();
      } else {
        newPestilences[e[0]] = e[1];
      }
    });
    this.pestilences = newPestilences;

    // console.log(`bodiesExposed: ${bodiesExposed}`);
    const change = bodiesExposed
      ? bodiesExposed * this.pestilenceIncreaseFactor * delta
      : -1 * this.pestilenceDiminishFactor * delta;

    // console.log(
    //   `bodiesExposed: ${bodiesExposed} add: ${add} subtract: ${subtract} newValue: ${newValue}`
    // );
    this.pestilence = Phaser.Math.Clamp(this.pestilence + change, 0, 100);
  }
  updateInfection(delta) {
    const numBodiesTouching = ["left", "right", "up", "down"]
      .map((direction) => this.player.touchingBody[direction])
      .filter((touching) => touching).length;

    const change = numBodiesTouching
      ? numBodiesTouching * this.infectionIncreaseFactor * delta
      : -1 * this.infectionDiminishFactor * delta;

    // console.log(
    //   `numBodiesTouching: ${numBodiesTouching} add: ${add} subtract: ${subtract} newValue: ${newValue}`
    // );
    this.infection = Phaser.Math.Clamp(this.infection + change, 0, 100);
  }

  update(delta) {
    this.updatePestilence(delta);
    this.updateInfection(delta);

    const oldPestilenceBar = Math.floor((this.oldPestilence / 100) * this.barLength);
    const pestilenceBar = Math.floor((this.pestilence / 100) * this.barLength)
    if (oldPestilenceBar < pestilenceBar) {
      this.sounds.pestilence.play('', { detune: pestilenceBar * 150 });
    }
    const oldInfectionBar = Math.floor((this.oldInfection / 100) * this.barLength);
    const infectionBar = Math.floor((this.infection / 100) * this.barLength)
    if (oldInfectionBar < infectionBar) {
      this.sounds.infection.play('', { detune: infectionBar * 150 });
    }
    this.oldPestilence = this.pestilence;
    this.oldInfection = this.infection;

    // console.log(`pestilence: ${this.pestilence} infection: ${this.infection}`);
    return { pestilence: this.pestilence, infection: this.infection };
  }
}
