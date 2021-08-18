export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Misc
    this.load.image('font-small', 'assets/fonts/atari_like.png');
    this.load.image('title', 'assets/images/title.png');
    this.load.image('title-big', 'assets/images/title_big.png');
    this.load.image('crown', 'assets/images/crown.png');
    this.load.image('cathedral', 'assets/images/cathedral.png');
    this.load.image('moon', 'assets/images/moon.png');
    this.load.image('skull-big', 'assets/images/skull.png');
    this.load.image('skull-small', 'assets/images/skull_small.png');
    this.load.image('skull-grass', 'assets/images/skull_grass.png');
    this.load.image('shovel', 'assets/images/shovel.png');

    this.load.image('door-stars', 'assets/images/door-stars.png');
    this.load.image('exit-door', 'assets/images/exit-door.png');
    this.load.spritesheet('door', 'assets/images/door.png', {
      frameWidth: 16,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('doorseed-flash', 'assets/images/doorseed-flash.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });

    this.load.spritesheet('veggies', 'assets/images/veggies/veggies.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });

    // Maps
    this.load.tilemapTiledJSON('level-2-1', 'assets/images/map/level-2-1.json');
    this.load.tilemapTiledJSON('level-2-2', 'assets/images/map/level-2-2.json');
    this.load.tilemapTiledJSON('level-3-1', 'assets/images/map/level-3-1.json');
    this.load.image('tileset', 'assets/images/map/tileset.png');

    // Backgrounds
    this.load.image('green-background', 'assets/images/map/backgrounds/green-background.png');
    this.load.image('green-background-small', 'assets/images/map/backgrounds/green-background-small.png');
    this.load.image('blue-background-small', 'assets/images/map/backgrounds/blue-background-small.png');

    // Sprites
    this.load.spritesheet('player', 'assets/images/player/tundo_spritesheet.png', {
      frameWidth: 18,
      frameHeight: 24,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('enemy-roja', 'assets/images/enemies/roja.png', {
      frameWidth: 24,
      frameHeight: 24,
      margin: 0,
      spacing: 0
    });

    // Audio
    this.load.audio('enter', 'assets/audio/sfx_menu_select2.wav');
    this.load.audio('next-level', 'assets/audio/sfx_sounds_fanfare2.wav');
    this.load.audio('game-over', 'assets/audio/sfx_sounds_negative2.wav');
    this.load.audio('new-game', 'assets/audio/sfx_menu_select2.wav');
    
    this.load.audio('walk', 'assets/audio/sfx_movement_footstepsloop4_fast.wav');
    this.load.audio('jump', 'assets/audio/sfx_movement_jump1.wav');
    
    this.load.audio('dig', 'assets/audio/sfx_wpn_punch1.wav');
    this.load.audio('fill', 'assets/audio/sfx_damage_hit2.wav');
    this.load.audio('hit', 'assets/audio/sfx_wpn_punch3.wav');
    this.load.audio('stone', 'assets/audio/sfx_wpn_punch4.wav');
    
    this.load.audio('dump', 'assets/audio/sfx_movement_dooropen4.wav');
    
    this.load.audio('pestilence', 'assets/audio/sfx_sound_neutral5.wav');
    this.load.audio('infection', 'assets/audio/sfx_sound_neutral8.wav');
  }

  create() {
    this.scene.start('TitleScene');
  }
}
