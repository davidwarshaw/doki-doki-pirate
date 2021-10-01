
const TILE_PUSH_UP_DEPTH = 2;

function playerTileProcess(player, tile) {
  if (tile.index === -1) {
    return false;
  }
  const { collides, collisionStyle } = tile.properties;
  if (!collides) {
    return false;
  }
  switch (collisionStyle) {
    case "solid": return true;
    case "passthroughUp": {
      const goingDown = player.body.velocity.y > 0;
      const closeToTop = tile.getTop() + TILE_PUSH_UP_DEPTH >= player.body._bounds.bottom;
      return goingDown && closeToTop;
    }
  }
}

function enemyPlayerCollide(player, enemy) {
  const { left, right, up, down } = enemy.body.touching;

  if (left || right || down) {
    player.hit();
    return;
  }

  if (up) {
    // const bodyDelta = Math.abs(player.body.x - enemy.body.x);
    // const spriteDelta = Math.abs(player.x - enemy.x);
    // console.log(`body delta: ${bodyDelta} sprite delta: ${spriteDelta}`);
    player.riding = enemy;
    return;
  }

  player.riding = null;
}

function enemyTileProcess(enemy, tile) {
  if (tile.index === -1) {
    return false;
  }
  return true;
}

function enemyTileCollide(enemy, tile) {
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

function enemyEnemyCollide(enemyA, enemyB) {
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

function enemyWorldBoundsCollide(body, up, down, left, right) {
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

function veggieEnemyCollide(veggie, enemy) {
  console.log(enemy);
  enemy.kill();

  enemy.sounds.dig.play();
}

function veggieTileCollide(veggie, tile) {
  const doorTileY = tile.y - 1;
  this.scene.doorSystem.addNew(tile.x, doorTileY);

  veggie.destroy();
}

export default {
  playerTileProcess,
  enemyPlayerCollide,
  enemyTileProcess,
  enemyTileCollide,
  enemyEnemyCollide,
  enemyWorldBoundsCollide,
  veggieEnemyCollide,
  veggieTileCollide,
}