export class SoundPlayer {
  constructor() {
    this.gameSounds = {
      jump: new Audio("./sound/game/track01.wav"),
      score: new Audio("./sound/game/track02.wav"),
      gameOver: new Audio("./sound/game/track03.wav"),
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