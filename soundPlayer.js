import { INSTRUMENT_ORDER, INSTRUMENT_FOLDER_MAP } from './js/config.js';

export class SoundPlayer {
  constructor() {
    // localStorageから音量設定を読み込むか、デフォルト値を設定
    const storedBgmVolume = localStorage.getItem('bgmVolume');
    this.bgmVolume = storedBgmVolume !== null ? parseFloat(storedBgmVolume) : 0.5;

    const storedInstrumentVolume = localStorage.getItem('instrumentVolume');
    this.instrumentVolume = storedInstrumentVolume !== null ? parseFloat(storedInstrumentVolume) : 1.0;

    const storedGameSoundVolume = localStorage.getItem('gameSoundVolume');
    this.gameSoundVolume = storedGameSoundVolume !== null ? parseFloat(storedGameSoundVolume) : 0.7;

    this.gameSounds = {
      jump: new Audio("./sound/game/jump.wav"), // ファイル名を変更
      score: new Audio("./sound/game/click.wav"), // ファイル名を変更
      gameOver: new Audio("./sound/game/gameOver.wav"), // ファイル名を変更
      game_bgm: new Audio("./sound/game/game_bgm.wav"),
      gameover_bgm: new Audio("./sound/game/gameover_bgm.wav"),
      home_bgm: new Audio("./sound/game/home_bgm.wav"),
      tree_fall: new Audio("./sound/game/tree_fall.wav"), // ファイル名を変更
    };
    
    // 各音量の設定 (localStorageから読み込んだ値を適用)
    // セッターメソッドを呼び出すことで、Audioオブジェクトに反映させる
    // コンストラクタ内ではプレビュー音を鳴らさないように、直接volumeを設定
    this.gameSounds.game_bgm.volume = this.bgmVolume;
    this.gameSounds.gameover_bgm.volume = this.bgmVolume;
    this.gameSounds.home_bgm.volume = this.bgmVolume;
    
    this.gameSounds.jump.volume = this.gameSoundVolume;
    this.gameSounds.score.volume = this.gameSoundVolume;
    this.gameSounds.gameOver.volume = this.gameSoundVolume;
    this.gameSounds.tree_fall.volume = this.gameSoundVolume;

    this.sounds = {}; // loadSoundでロードした音源を格納するオブジェクト
    this.currentBGM = null; // 現在再生中のBGMを追跡

    // BGMのループ設定
    this.gameSounds.home_bgm.loop = true;
    this.gameSounds.game_bgm.loop = true;

    // 各楽器のtrack01.wavをロード
    INSTRUMENT_ORDER.forEach(instrumentName => {
      // INSTRUMENT_FOLDER_MAP を使用して正しいフォルダ名を取得
      const folderName = INSTRUMENT_FOLDER_MAP[instrumentName];
      if (folderName) { // マッピングが存在する場合のみロード
        const soundPath = `./sound/${folderName}/track01.wav`;
        this.loadSound(`${instrumentName}_track01`, soundPath);
      } else {
        console.warn(`楽器名 "${instrumentName}" に対応するフォルダ名が見つかりません。`);
      }
    });
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
      console.warn('BGM音量は0から1の間に設定してください。');
    }
  }

  // 楽器用音量を設定するセッター
  setInstrumentVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.instrumentVolume = volume;
      // ロード済みの楽器音の音量も更新
      for (const name in this.sounds) {
        if (this.sounds[name]) {
          const multiplier = this.sounds[name].customMultiplier || 1.0;
          this.sounds[name].volume = Math.min(1.0, volume * multiplier);
        }
      }
      localStorage.setItem('instrumentVolume', volume);
    } else {
      console.warn('楽器音量は0から1の間に設定してください。');
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
      console.warn('ゲーム効果音量は0から1の間に設定してください。');
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
      console.warn(`BGMが見つかりません: ${bgmName}`);
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
      console.log(`サウンドを再生中: ${name}`);
      this.sounds[name].currentTime = 0;
      this.sounds[name].play();
    } else {
      console.warn(`サウンドが見つかりません: ${name}`);
    }
  }

  loadSound(name, path, volumeMultiplier = 1.0) {
    const audio = new Audio(path);
    audio.customMultiplier = volumeMultiplier; // カスタムプロパティとして倍率を保持
    audio.volume = Math.min(1.0, this.instrumentVolume * volumeMultiplier);
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