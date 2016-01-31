export class Sound {
  constructor() {
    this.beep = new Howl({
      src: ["sounds/beep3.wav", "sounds/beep3.ogg", "sounds/beep3.mp3"]
    });
    this.laser = new Howl({
      src: ["sounds/laser-01.wav", "sounds/laser-01.ogg", "sounds/laser-01.mp3"]
    });
  }

  new_message() {
    this.laser.play();
  }

  power_cell() {
    this.beep.play();
  }
}
