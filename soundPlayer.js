export class SoundPlayer {
  constructor() {
    this.bgmVolume = 0.5; // BGM用音量変数
    this.instrumentVolume = 1.0; // 楽器用音量変数
    this.gameSoundVolume = 0.7; // ゲーム効果音用音量変数

    this.gameSounds = {
      jump: new Audio("./sound/game/track01.wav"),
      score: new Audio("./sound/game/track02.wav"),
      gameOver: new Audio("./sound/game/track03.wav"),
      game_bgm: new Audio("./sound/game/game_bgm.wav"),
      gameover_bgm: new Audio("./sound/game/gameover_bgm.wav"),
      home_bgm: new Audio("./sound/game/home_bgm.wav"),
      tree_fall: new Audio("./sound/game/木が倒れる音.wav"),
    };
    
    // 各音量の設定
    this.gameSounds.jump.volume = this.gameSoundVolume;
    this.gameSounds.score.volume = this.gameSoundVolume;
    this.gameSounds.gameOver.volume = this.gameSoundVolume;
    this.gameSounds.tree_fall.volume = this.gameSoundVolume;

    this.gameSounds.game_bgm.volume = this.bgmVolume; // BGMの音量を変数で設定
    this.gameSounds.gameover_bgm.volume = this.bgmVolume; // BGMの音量を変数で設定
    this.gameSounds.home_bgm.volume = this.bgmVolume; // BGMの音量を変数で設定

    this.sounds = {}; // loadSoundでロードした音源を格納するオブジェクト
    this.currentBGM = null; // 現在再生中のBGMを追跡

    // BGMのループ設定
    this.gameSounds.home_bgm.loop = true;
    this.gameSounds.game_bgm.loop = true;
  }

  playBGM(bgmName) {
    // 現在再生中のBGMがあれば停止
    if (this.currentBGM && this.currentBGM !== this.gameSounds[bgmName]) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
    }

    const newBGM = this.gameSounds[bgmName];
    if (newBGM) {
      newBGM.play();
      this.currentBGM = newBGM;
    } else {
      console.warn(`BGM not found: ${bgmName}`);
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
    if (this.gameSounds[key]) {
      this.gameSounds[key].currentTime = 0;
      this.gameSounds[key].play();
    }
  }

  playSound(name) {
    if (this.sounds[name]) {
      console.log(`Playing sound: ${name}`); // ★追加
      this.sounds[name].currentTime = 0;
      this.sounds[name].play();
    } else {
      console.warn(`Sound not found: ${name}`); // ★追加
    }
  }

  loadSound(name, path) {
    const audio = new Audio(path);
    audio.volume = this.instrumentVolume; // 楽器用音量を適用
    this.sounds[name] = audio;
  }
}

export const soundPlayer = new SoundPlayer();