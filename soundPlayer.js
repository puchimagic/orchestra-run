class SoundPlayer {
  constructor() {
    this.gameSounds = {
      jump: new Audio("./sound/game/track01.wav"),
      score: new Audio("./sound/game/track02.wav"),
      gameOver: new Audio("./sound/game/track03.wav"),
    };
    this.instrumentSounds = {
      piano: [
        new Audio("./sound/piano/track01.wav"),
        new Audio("./sound/piano/track02.wav"),
        new Audio("./sound/piano/track03.wav"),
        new Audio("./sound/piano/track04.wav"),
        new Audio("./sound/piano/track05.wav"),
        new Audio("./sound/piano/track06.wav"),
        new Audio("./sound/piano/track07.wav"),
      ],
      guitar: [
        new Audio("./sound/guitar/track01.wav"),
        new Audio("./sound/guitar/track02.wav"),
        new Audio("./sound/guitar/track03.wav"),
        new Audio("./sound/guitar/track04.wav"),
      ],
      drum: [
        new Audio("./sound/drum/track01.wav"),
        new Audio("./sound/drum/track02.wav"),
        new Audio("./sound/drum/track03.wav"),
        new Audio("./sound/drum/track04.wav"),
        new Audio("./sound/drum/track05.wav"),
        new Audio("./sound/drum/track06.wav"),
      ],
      taiko: [
        new Audio("./sound/taiko/track01.wav"),
        new Audio("./sound/taiko/track02.wav"),
        new Audio("./sound/taiko/track03.wav"),
      ],
      tambourine: [new Audio("./sound/tambourie/track01.wav")],
      triangle: [new Audio("./sound/triangle/track01.wav")],
    };
  }

  playGameSound(key) {
    if (this.gameSounds[key]) {
      this.gameSounds[key].currentTime = 0;
      this.gameSounds[key].play();
    }
  }

  playInstrumentSound(instrument, index) {
    if (
      this.instrumentSounds[instrument] &&
      this.instrumentSounds[instrument][index]
    ) {
      this.instrumentSounds[instrument][index].currentTime = 0;
      this.instrumentSounds[instrument][index].play();
    }
  }
}

export const soundPlayer = new SoundPlayer();