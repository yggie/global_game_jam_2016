import player from './game/player';
import {Chat} from './chat'
import {Sound} from './sound'
import tracking from './player-app/tracking';

let slaveApp = {};

slaveApp.initialize = function () {
  player.connect().then((channel) => {
    let sound = new Sound()
    new Chat(channel, sound)

    let teamName = $("#team-name")
    let location = $("#location")
    let timeLeft = $("#time-left")
    let cellsCollected = $("#cells-collected")

    teamName.append("Team: " + player.team())
    timeLeft.append("Time: 10 mins")
    cellsCollected.append("Energy Cells: 1 of 5 found")

    $(document.body).css('background-color', player.team());

    tracking.start((position) => {
      channel.push('location', {
        id: player.id(),
        accuracy: position.coords.accuracy,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
      location.append(`${position.coords.latitude} ${position.coords.longitude}`);
    });
  });
};

export default slaveApp;
