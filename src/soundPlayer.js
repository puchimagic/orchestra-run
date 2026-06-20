import { INSTRUMENT_ORDER, INSTRUMENT_FOLDER_MAP } from './config.js';

export class SoundPlayer {
  constructor() {
    this.bgmVolume      = this._loadVolume('bgmVolume', 0.5);
    this.instrumentVolume = this._loadVolume('instrumentVolume', 1.0);
    this.gameSoundVolume  = this._loadVolume('gameSoundVolume', 0.7);

    this.gameSounds = {
      jump:         new Audio("./assets/sound/game/jump.wav"),
      score:        new Audio("./assets/sound/game/click.wav"),
      gameOver:     new Audio("./assets/sound/game/gameOver.wav"),
      game_bgm:     new Audio("./assets/sound/game/game_bgm.wav"),
      gameover_bgm: new Audio("./assets/sound/game/gameover_bgm.wav"),
      home_bgm:     new Audio("./assets/sound/game/home_bgm.wav"),
      tree_fall:    new Audio("./assets/sound/game/tree_fall.wav"),
    };

    this.gameSounds.game_bgm.volume     = this.bgmVolume;
    this.gameSounds.gameover_bgm.volume = this.bgmVolume;
    this.gameSounds.home_bgm.volume     = this.bgmVolume;
    this.gameSounds.jump.volume         = this.gameSoundVolume;
    this.gameSounds.score.volume        = this.gameSoundVolume;
    this.gameSounds.gameOver.volume     = this.gameSoundVolume;
    this.gameSounds.tree_fall.volume    = this.gameSoundVolume;

    this.gameSounds.home_bgm.loop = true;
    this.gameSounds.game_bgm.loop = true;

    this.sounds = {};
    this.currentBGM = null;

    INSTRUMENT_ORDER.forEach(instrumentName => {
      const folderName = INSTRUMENT_FOLDER_MAP[instrumentName];
      if (folderName) {
        this.loadSound(`${instrumentName}_track01`, `./assets/sound/${folderName}/track01.wav`);
      }
    });
  }

  _loadVolume(key, defaultValue) {
    const stored = localStorage.getItem(key);
    return stored !== null ? parseFloat(stored) : defaultValue;
  }

  _clampVolume(volume) {
    return Math.max(0, Math.min(1, volume));
  }

  setBgmVolume(volume) {
    this.bgmVolume = this._clampVolume(volume);
    this.gameSounds.game_bgm.volume     = this.bgmVolume;
    this.gameSounds.gameover_bgm.volume = this.bgmVolume;
    this.gameSounds.home_bgm.volume     = this.bgmVolume;
    localStorage.setItem('bgmVolume', this.bgmVolume);
  }

  setInstrumentVolume(volume) {
    this.instrumentVolume = this._clampVolume(volume);
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        sound.volume = Math.min(1.0, this.instrumentVolume * (sound.customMultiplier || 1.0));
      }
    }
    localStorage.setItem('instrumentVolume', this.instrumentVolume);
  }

  setGameSoundVolume(volume) {
    this.gameSoundVolume = this._clampVolume(volume);
    this.gameSounds.jump.volume     = this.gameSoundVolume;
    this.gameSounds.score.volume    = this.gameSoundVolume;
    this.gameSounds.gameOver.volume = this.gameSoundVolume;
    this.gameSounds.tree_fall.volume = this.gameSoundVolume;
    localStorage.setItem('gameSoundVolume', this.gameSoundVolume);
  }

  playBGM(bgmName) {
    if (this.currentBGM && this.currentBGM !== this.gameSounds[bgmName]) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
    }
    const newBGM = this.gameSounds[bgmName];
    if (newBGM) {
      newBGM.play();
      this.currentBGM = newBGM;
    }
  }

  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
  }

  playGameSound(key) {
    const sound = this.gameSounds[key];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  playSound(name) {
    if (this.sounds[name]) {
      this.sounds[name].currentTime = 0;
      this.sounds[name].play();
    }
  }

  loadSound(name, path, volumeMultiplier = 1.0) {
    const audio = new Audio(path);
    audio.customMultiplier = volumeMultiplier;
    audio.volume = Math.min(1.0, this.instrumentVolume * volumeMultiplier);
    this.sounds[name] = audio;
  }

  stopAllSounds() {
    this.stopBGM();
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    }
    for (const [key, sound] of Object.entries(this.gameSounds)) {
      if (!key.endsWith('_bgm') && sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  }
}

export const soundPlayer = new SoundPlayer();
