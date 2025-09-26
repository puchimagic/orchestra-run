/**
 * 楽器別の効果音再生関数群
 * 各関数は楽器名と番号を受け取り、共通関数に渡す
 */

function playPianoSound(num) {
  playInstrumentSound('piano', num);
}

function playDrumSound(num) {
  playInstrumentSound('drum', num);
}

function playTambourineSound(num) {
  playInstrumentSound('tambourine', num);
}

function playTriangleSound(num) {
  playInstrumentSound('triangle', num);
}

function playGuitarSound(num) {
  playInstrumentSound('guitar', num);
}
function playtaikoSound(num) {
  playInstrumentSound('taiko', num);
}
function playgameSound(num) {
  playInstrumentSound('game', num);
}


/**
 * 共通処理：楽器名と番号に応じて音声ファイルを再生
 * @param {string} instrument - 楽器名（フォルダ名）
 * @param {number} num - 1〜１０の番号
 */
function playInstrumentSound(instrument, num) {
  if (isNaN(num) || num < 1 || num > 10) {
    alert('エラー');
    return;
  }

  const paddedNum = String(num).padStart(2, '0'); 
  const soundPath = `sound/${instrument}/track${paddedNum}.wav`;
  //音のファイル名は楽器ごとにtrack01から連番で扱う
  //gameは１がジャンプ、２が決定、３がゲームオーバー
  const audio = new Audio(soundPath);
  audio.play();
}