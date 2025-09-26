export class SoundPlayer {
  constructor() {
    this.gameSounds = {
      jump: new Audio("./sound/game/track01.wav"),
      score: new Audio("./sound/game/track02.wav"),
      gameOver: new Audio("./sound/game/track03.wav"),
      game_bgm: new Audio("./sound/game/game_bgm.wav"),
      gameover_bgm: new Audio("./sound/game/gameover_bgm.wav"),
      home_bgm: new Audio("./sound/game/home_bgm.wav"),
      ki_patan: new Audio("./sound/game/ki_patan.wav"),

    };
    this.sounds = {}; // loadSoundでロードした音源を格納するオブジェクト
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