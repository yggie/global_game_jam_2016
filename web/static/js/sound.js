export class Sound {
  constructor() {

    this.beep = new Howl({
      src: ["sounds/beep.wav"]
    });
    this.laser = new Howl({
      src: ["sounds/laser-01.wav", "sounds/laser-01.ogg"]
    });
    this.button = new Howl({src: ["sounds/button-09.wav"]});
  }

  new_message() {
    this.laser.play();
  }
}
