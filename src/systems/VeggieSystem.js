import veggieDefinitions from '../definitions/veggieDefinitions';

import CollisionBehavior from "../systems/CollisionBehavior";

export default class VeggieSystem {
  constructor(scene, map, player, level, enemies) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.level = level;
    this.enemies = enemies;

    this.offsets = {
      veggie: { x: 2, y: -6 },
      enemy: { x: 2, y: -8 },
    };

    this.veggies = [];
    this.carried = null;

    const { carried, picked } = this.level.veggies;
    picked.forEach(veggie => this.removeVeggieTile(veggie.x, veggie.y));
    if (carried) {
      this.carryVeggieForName(this.player.x, this.player.y, carried);
    }

    this.sounds = {
      dig: scene.sound.add('dig'),
      fill: scene.sound.add('fill'),
      hit: scene.sound.add('hit'),
      stone: scene.sound.add('stone'),
    };
  }

  dig() {
    if (this.player.riding) {
      this.digEnemy();
    } else {
      this.digVeggie();
    }
  }

  digEnemy() {
    const { x, y } = this.player;
    const enemy = this.player.riding;
    
    const veggieXOffset = this.player.flipX ? - this.offsets.enemy.x : this.offsets.enemy.x;
    enemy.carry(x, y);
    enemy.setDepth(31);
    
    this.player.riding = null;
    this.carried = enemy;
  }

  digVeggie() {
    const { x, y } = this.player;
    const veggieTile = this.map.getVeggieTileWorldXY(x, y);
    if (!veggieTile) {
      return;
    }
    const { name } = veggieTile.properties;

    this.removeVeggieTile(x, y);
    this.scene.playState.level.veggies.picked.push({ x, y });
    
    this.carryVeggieForName(x, y, name);
    this.scene.playState.level.veggies.carried = name;
  }

  removeVeggieTile(x, y) {
    const replaceWithNull = true;
    const recalculateFaces = true;
    this.map.tilemap.removeTileAtWorldXY(
      x, y, replaceWithNull, recalculateFaces, this.scene.cameras.main, this.map.layers.veggies);
  }

  carryVeggieForName(x, y, name) {
    const definition = veggieDefinitions[name];
    const veggieXOffset = this.player.flipX ? - this.offsets.veggie.x : this.offsets.veggie.x;
    const veggie = this.scene.physics.add
      .sprite(x + veggieXOffset, y + this.offsets.veggie.y, 'veggies', definition.frame);

    veggie.setOrigin(0.5, 1);
    veggie.setDepth(31);

    veggie.body.syncBounds = true;

    if (definition.hitEnemies) {
      this.enemies.registerCollision(veggie, null, CollisionBehavior.veggieEnemyCollide);
    }

    if (definition.collideTerrain) {
      this.map.registerCollision(veggie, null, CollisionBehavior.veggieTileCollide);
    }

    this.veggies.push(veggie);
    this.carried = veggie;
  }

  throw(velocity, upVelocity, gravity) {
    if (!this.carried) {
      return;
    }

    const x = this.player.body.velocity.x + velocity.x;
    const y = this.player.body.velocity.y + velocity.y - upVelocity;
    this.carried.setVelocity(x, y);
    this.carried.setGravityY(gravity);

    if (this.carried.beingCarried) {
      this.carried.throw();
    }

    this.carried = null;
    this.scene.playState.level.veggies.carried = null;

    this.sounds.hit.play();
  }

  worldStep(delta) {
    if (this.carried) {
      const offset = this.carried.beingCarried ? this.offsets.enemy : this.offsets.veggie;
      const offsetX = this.player.flipX ? - offset.x : offset.x;
      this.carried.x = this.player.body.center.x + offsetX;
      this.carried.y = this.player.body.center.y + offset.y;
    }
  }
}