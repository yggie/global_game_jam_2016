export class Sound {
  constructor() {
    this.beep = new Audio("sounds/beep.wav");
    this.button = new Audio("sounds/button-09.wav");
  }

  new_message() {
    this.button.play();
  }
}
