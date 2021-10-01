import properties from "../properties";

import CollisionBehavior from "../systems/CollisionBehavior";

import Enemy from "./Enemy";

export default class Enemies {
  constructor(scene, map, player, characterSystem) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.characterSystem = characterSystem;

    this.enemies = map.tilemap.createFromObjects('enemies', [
      {
        name: "roja",
        key: "enemy-roja",
        classType: Enemy,
      }
    ]).map(enemy => {
      const gravity = characterSystem.constants.gravity * characterSystem.gravityFactor;
      enemy.initialize(gravity);
      
      const mapCollider = map.registerCollision(enemy, CollisionBehavior.enemyTileProcess, CollisionBehavior.enemyTileCollide);
      const playerCollider = scene.physics.add.collider(player, enemy, CollisionBehavior.enemyPlayerCollide, null, this);
      scene.physics.world.on('worldbounds', CollisionBehavior.enemyWorldBoundsCollide, this)
      
      enemy.colliders = { mapCollider, playerCollider };
      return enemy;
    });

    this.enemies.forEach(enemy => {
      this.registerCollision(enemy, null, CollisionBehavior.enemyEnemyCollide);
    });
  }

  registerCollision(character, processCollision, afterCollision) {
    this.enemies.forEach(enemy => this.scene.physics.add
      .collider(character, enemy, afterCollision, processCollision, character));
  }

  update(delta) {
    this.enemies
      .filter(enemy => enemy.alive)
      .forEach(enemy => {
        enemy.update(delta);
      });
  }
}