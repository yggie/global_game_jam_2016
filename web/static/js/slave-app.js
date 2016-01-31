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
    let distanceText = $('#distance');

    let targets = {};

    if (player.team() === 'blue') {
      channel.on('target:update:blue', (payload) => {
        targets[payload.id] = new google.maps.LatLng(payload.coords.lat, payload.coords.lng);
      });
    } else {
      channel.on('target:update:red', (payload) => {
        targets[payload.id] = new google.maps.LatLng(payload.coords.lat, payload.coords.lng);
      });
    }

    channel.on('target:captured', (payload) => {
      delete targets[payload.id];
    });

    var rad = function(x) {
      return x * Math.PI / 180;
    };

    var getDistance = function(p1, p2) {
      var R = 6378137; // Earth’s mean radius in meter
      var dLat = rad(p2.lat() - p1.lat());
      var dLong = rad(p2.lng() - p1.lng());
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);

      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d; // returns the distance in meter
    };

    tracking.start((position) => {
      let point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      channel.push('location', {
        id: player.id(),
        accuracy: position.coords.accuracy,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });

      let closestDistance = Object.keys(targets).reduce((lowest, id) => {
        let latLng = targets[id];
        let dist = getDistance(latLng, point);

        if (dist < lowest) {
          return dist;
        } else {
          return lowest;
        }
      }, 1e6);

      if (Object.keys(targets).length !== 0) {
        distanceText.text(`${closestDistance.toFixed(1)}m to nearest cell`);
      } else {
        distanceText.text('No cells found');
      }

      location.text(`${position.coords.latitude.toFixed(8)} ${position.coords.longitude.toFixed(8)}`);
    });
  });
};

export default slaveApp;
