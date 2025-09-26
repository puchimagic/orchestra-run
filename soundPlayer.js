export class SoundPlayer {
  constructor() {
    // localStorageから音量設定を読み込むか、デフォルト値を設定
    this.bgmVolume = parseFloat(localStorage.getItem('bgmVolume')) || 0.5;
    this.instrumentVolume = parseFloat(localStorage.getItem('instrumentVolume')) || 1.0;
    this.gameSoundVolume = parseFloat(localStorage.getItem('gameSoundVolume')) || 0.7;

    this.gameSounds = {
      jump: new Audio("./sound/game/track01.wav"),
      score: new Audio("./sound/game/track02.wav"),
      gameOver: new Audio("./sound/game/track03.wav"),
      game_bgm: new Audio("./sound/game/game_bgm.wav"),
      gameover_bgm: new Audio("./sound/game/gameover_bgm.wav"),
      home_bgm: new Audio("./sound/game/home_bgm.wav"),
      tree_fall: new Audio("./sound/game/木が倒れる音.wav"),
    };
    
    // 各音量の設定 (localStorageから読み込んだ値を適用)
    // セッターメソッドを呼び出すことで、Audioオブジェクトに反映させる
    this.setBgmVolume(this.bgmVolume);
    this.setInstrumentVolume(this.instrumentVolume); // ロード済みの楽器音がないため、ここでは効果なし
    this.setGameSoundVolume(this.gameSoundVolume);

    this.sounds = {}; // loadSoundでロードした音源を格納するオブジェクト
    this.currentBGM = null; // 現在再生中のBGMを追跡

    // BGMのループ設定
    this.gameSounds.home_bgm.loop = true;
    this.gameSounds.game_bgm.loop = true;
  }

  // BGM音量を設定するセッター
  setBgmVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.bgmVolume = volume;
      this.gameSounds.game_bgm.volume = volume;
      this.gameSounds.gameover_bgm.volume = volume;
      this.gameSounds.home_bgm.volume = volume;
      localStorage.setItem('bgmVolume', volume);
    } else {
      console.warn('BGM volume must be between 0 and 1.');
    }
  }

  // 楽器用音量を設定するセッター
  setInstrumentVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.instrumentVolume = volume;
      // ロード済みの楽器音の音量も更新
      for (const name in this.sounds) {
        if (this.sounds[name]) {
          this.sounds[name].volume = volume;
        }
      }
      localStorage.setItem('instrumentVolume', volume);
    } else {
      console.warn('Instrument volume must be between 0 and 1.');
    }
  }

  // ゲーム効果音用音量を設定するセッター
  setGameSoundVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.gameSoundVolume = volume;
      this.gameSounds.jump.volume = volume;
      this.gameSounds.score.volume = volume;
      this.gameSounds.gameOver.volume = volume;
      this.gameSounds.tree_fall.volume = volume;
      localStorage.setItem('gameSoundVolume', volume);
    } else {
      console.warn('Game sound volume must be between 0 and 1.');
    }
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
      console.log(`Playing sound: ${name}`);
      this.sounds[name].currentTime = 0;
      this.sounds[name].play();
    } else {
      console.warn(`Sound not found: ${name}`);
    }
  }

  loadSound(name, path) {
    const audio = new Audio(path);
    audio.volume = this.instrumentVolume; // 楽器用音量を適用
    this.sounds[name] = audio;
  }

  // すべての音を停止するメソッド (BGM、楽器音、ゲーム効果音)
  stopAllSounds() {
    // 現在再生中のBGMがあれば停止
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
    // ロードされたすべての楽器音を停止
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        this.sounds[key].pause();
        this.sounds[key].currentTime = 0;
      }
    }
    // ゲーム効果音も停止
    for (const key in this.gameSounds) {
      // BGMはcurrentBGMで処理済みなのでスキップ
      if (key.endsWith('_bgm')) continue; 
      if (this.gameSounds[key]) {
        this.gameSounds[key].pause();
        this.gameSounds[key].currentTime = 0;
      }
    }
  }
}

export const soundPlayer = new SoundPlayer();