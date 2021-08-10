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

    // Maps
    this.load.tilemapTiledJSON('level-2-1', 'assets/images/map/level-2-1.json');
    this.load.image('tileset', 'assets/images/map/tileset.png');

    // Sprites
    this.load.spritesheet('player', 'assets/images/giallo_spritesheet.png', {
      frameWidth: 18,
      frameHeight: 24,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('cart', 'assets/images/cart_spritesheet.png', {
      frameWidth: 96,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('dig-dirt', 'assets/images/dig_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('pestilence', 'assets/images/pestilence_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    // UI Sprites
    this.load.spritesheet('rat', 'assets/images/rat_spritesheet.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('skull', 'assets/images/skull_spritesheet.png', {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });

    // Audio
    this.load.audio('enter', 'assets/audio/sfx_menu_select2.wav');
    this.load.audio('next-level', 'assets/audio/sfx_sounds_fanfare2.wav');
    this.load.audio('game-over', 'assets/audio/sfx_sounds_negative2.wav');
    this.load.audio('new-game', 'assets/audio/sfx_sounds_fanfare1.wav');
    
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
