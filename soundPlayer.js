export class SoundPlayer {
  constructor() {
    this.gameSounds = {
      jump: new Audio("./sound/game/track01.wav"),
      score: new Audio("./sound/game/track02.wav"),
      gameOver: new Audio("./sound/game/track03.wav"),
      game_bgm: new Audio("./sound/game/game_bgm.mp3"),
      gameover_bgm: new Audio("./sound/game/gameover_bgm.mp3"),
      home_bgm: new Audio("./sound/game/home_bgm.mp3"),
      ki_patan: new Audio("./sound/game/木が倒れる音.wav"),
    };
    this.gameSounds.score.volume = 0.3; // スコア音の音量を調整

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
    this.sounds[name] = new Audio(path);
  }
}

export const soundPlayer = new SoundPlayer();