import properties from "../properties";


export default class DoorSystem {
  constructor(scene, map, player, level) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.level = level;
    
    this.starsScrollFactor = 0.01;

    this.doors = [];

    scene.anims.create({
      key: "door_open",
      frames: scene.anims.generateFrameNumbers("door", { start: 0, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });
    scene.anims.create({
      key: "doorseed-flash_flash",
      frames: scene.anims.generateFrameNumbers("doorseed-flash", { start: 0, end: 2 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });

    this.addExit(95, 17);

    this.level.doors
      .filter(door => door.from === this.level.currentNumber)
      .forEach(door => {
        this.add(door.id, door.x, door.y, door.from, door.to);
      });
  }

  addNew(tileX, tileY) {
    const newDoorId = -1;
    const from = this.level.currentNumber;
    const to = this.level.currentNumber + 1;
    this.add(newDoorId, tileX, tileY, from, to);
  }

  add(existingDoorId, tileX, tileY, from, to) {
    const newDoor = existingDoorId === -1;
    const doorId = newDoor ? this.getNextDoorId() : existingDoorId;

    const { tileWidth } = this.map.tilemap;
    const { x, y } = this.map.tilemap.tileToWorldXY(tileX, tileY);
    const doorSprite = this.scene.add
      .sprite(x + tileWidth / 2, y, 'door', 2)
      .setOrigin(0.5, 0.5)
      .setDepth(11);
    const doorStarsSprite = this.scene.add
      .tileSprite(x + tileWidth / 2, y, 14, 30, 'door-stars')
      .setOrigin(0.5, 0.5)
      .setDepth(12)
      .setScrollFactor(1.0, 1.0);

    const thisDoorDefinition = {
      id: doorId,
      x: tileX, y: tileY,
      from: from, to: to
    };
    const door = {
      ...thisDoorDefinition,
      sprite: doorSprite,
      starsSprite: doorStarsSprite,
    };
    this.doors.push(door);

    if (newDoor) {
      const counterDoorDefinition = {
        id: this.getNextDoorId(),
        x: tileX, y: tileY,
        from: to, to: from
      };
      this.level.doors.push(thisDoorDefinition);
      this.level.doors.push(counterDoorDefinition);

      doorSprite.anims.play("door_open", true);
      this.flashWhileAdding(x + tileWidth / 2, y + tileWidth / 2);
    }
    
  }

  addExit(tileX, tileY) {
    const { tileWidth } = this.map.tilemap;
    const { x, y } = this.map.tilemap.tileToWorldXY(tileX, tileY);
    const doorSprite = this.scene.add
      .sprite(x + tileWidth / 2, y, 'exit-door', 2)
      .setOrigin(0.5, 0.60)
      .setDepth(11);
    const doorStarsSprite = this.scene.add
      .tileSprite(x + tileWidth / 2, y, 14, 30, 'door-stars')
      .setOrigin(0.5, 0.5)
      .setDepth(12)
      .setScrollFactor(1.0, 1.0);
    const doorId = this.getNextDoorId();
    const from = this.level.currentNumber;
    const thisDoorDefinition = {
      id: doorId,
      x: tileX, y: tileY,
      from,
      exit: true,
    };
    const door = {
      ...thisDoorDefinition,
      sprite: doorSprite,
      starsSprite: doorStarsSprite,
    };
    this.doors.push(door);
  }

  flashWhileAdding(x, y) {
    const doorseedFlash = this.scene.add
      .sprite(x, y, 'doorseed-flash')
      .setOrigin(0.5, 0.5)
      .setDepth(13);
    const animationKey = "doorseed-flash_flash";
    doorseedFlash.anims.play(animationKey, true);
    doorseedFlash.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey, () => {
      doorseedFlash.destroy();
    });
  }

  getNextDoorId() {
    return this.doors.length ? Math.max(...this.doors.map(door => door.id)) + 1 : 0;
  }

  isDoor(worldX, worldY) {
    const { x, y } = this.map.tilemap.worldToTileXY(worldX, worldY);
    return this.doors
      .some(door =>
        door.from === this.level.currentNumber &&
        door.x === x && door.y === y);
  }

  enter(worldX, worldY) {
    const { x, y } = this.map.tilemap.worldToTileXY(worldX, worldY);
    const enterDoors = this.doors
      .filter(door =>
        door.from === this.level.currentNumber &&
        door.x === x && door.y === y);
    if (enterDoors.length === 0) {
      return;
    }
    const door = enterDoors[0];
    console.log(door);
    if (door.exit) {
      this.scene.enterExitDoor();
    } else {
      this.scene.enterDoor(x, y, door.from, door.to);
    }
  }

  update(delta) {
    const scroll = delta * this.starsScrollFactor
    this.doors
      .filter(door => door.from === this.level.currentNumber && door.starsSprite)
      .map(door => door.starsSprite)
      .forEach(starsSprite => {
        const x = starsSprite.tilePositionX;
        const y = starsSprite.tilePositionY;
        starsSprite.setTilePosition(x, y + scroll);
      });
  }
}