import player from './game/player';
import {Chat} from './chat'
import {Sound} from './sound'
import tracking from './player-app/tracking';

let slaveApp = {};

slaveApp.initialize = function () {
  player.connect().then((channel) => {
    let sound = new Sound()
    new Chat(channel, sound, 'slave')

    let location = $("#location")

    tracking.start((position) => {
      channel.push('location', {
        id: player.id(),
        accuracy: position.coords.accuracy,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
      location.text(`${position.coords.latitude.toFixed(8)} ${position.coords.longitude.toFixed(8)}`);
    });
  });
};

export default slaveApp;
