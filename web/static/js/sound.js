export class Sound {
  constructor() {

    this.beep = new Howl({src: ["sounds/beep.wav"]});
    this.button = new Howl({src: ["sounds/button-09.wav"]});
  }

  new_message() {
    this.button.play();
  }
}
