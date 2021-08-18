import properties from "../properties";

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
      
      const mapCollider = map.registerCollision(enemy, this.enemyTileProcessCollision, this.enemyTileAfterCollision);
      const playerCollider = scene.physics.add.collider(player, enemy, this.enemyPlayerAfterCollision, () => true, this);
      scene.physics.world.on('worldbounds', this.afterWorldboundsCollision, this)
      
      enemy.colliders = { mapCollider, playerCollider };
      return enemy;
    });

    this.enemies.forEach(enemy => {
      this.registerCollision(enemy, () => true, this.enemyEnemyAfterCollision);
    });
  }

  registerCollision(character, processCollision, afterCollision) {
    this.enemies.forEach(enemy => this.scene.physics.add
      .collider(character, enemy, afterCollision, processCollision, character));
  }

  enemyEnemyAfterCollision(enemyA, enemyB) {
    if (enemyA.beingThrown || enemyB.beingThrown) {
      enemyA.kill();
      enemyB.kill();
      
      enemyA.sounds.dig.play();
      enemyB.sounds.dig.play();
      return;
    }
    if (!enemyA.justTurned) {
      enemyA.changeDirection();
      enemyA.justTurned = true;
    }
    if (!enemyB.justTurned) {
      enemyB.changeDirection();
      enemyB.justTurned = true;
    }
  }

  enemyPlayerAfterCollision(player, enemy) {
    const { left, right, up, down } = enemy.body.touching;

    if (left || right || down) {
      player.hit();
      return;
    }

    if (up) {
      player.riding = enemy;
      return;
    }

    player.riding = null;
  }

  enemyTileProcessCollision(enemy, tile) {
    if (tile.index === -1) {
      return false;
    }
    return true;
  }

  enemyTileAfterCollision(enemy, tile) {
        
    const hitTile = enemy.body.blocked.left || enemy.body.blocked.right;
    if (hitTile) {
      if (!enemy.justTurned) {
        enemy.changeDirection();
        enemy.justTurned = true;
      }
      return;
    }

    const tileCenterX = tile.pixelX + (tile.width / 2);
    const rightEdge = enemy.moveDirection.x > 0 && tile.faceRight && enemy.x > tileCenterX;
    const leftEdge = enemy.moveDirection.x < 0 && tile.faceLeft && enemy.x < tileCenterX;
    if (hitTile || leftEdge || rightEdge) {
      if (!enemy.justTurned) {
        enemy.changeDirection();
        enemy.justTurned = true;
      }
      return;
    }

    enemy.justTurned = false;
  }

  afterWorldboundsCollision(body, up, down, left, right) {
    if (body.gameObject.alive) {
      if (left || right) {
        body.gameObject.moveDirection.x *= -1;
        body.gameObject.justTurned = true;
      }
    } else {
      body.gameObject.destroy();
    }

    return;
  }

  update(delta) {
    this.enemies
      .filter(enemy => enemy.alive)
      .forEach(enemy => {
        enemy.update(delta);
      });
  }
}