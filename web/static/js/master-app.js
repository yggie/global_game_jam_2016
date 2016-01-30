import {randomColor} from 'randomcolor';
import googleMapsStyle from './google-maps-style';
import player from './game/player';
import {Chat} from './chat'
import {Sound} from './sound'

let map = null;

window.initMap = () => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 50.9372123, lng: -1.3977227 },
    styles: googleMapsStyle,
    zoom: 17
  });
};

let masterApp = {};

masterApp.initialize = function () {
  player.connect().then((channel) => {
    let sound = new Sound()
    new Chat(channel, sound)

    let teamName = $("#team-name")
    let timeLeft = $("#time-left")
    let cellsCollected = $("#cells-collected")

    teamName.append("Team: " + player.team())
    timeLeft.append("Time: 10 mins")
    cellsCollected.append("Energy Cells: 1 of 5 found")

    let markers = {};

    map.setCenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });

    channel.on('player:update', (payload) => {
      renderPlayer(payload);
    });

    function renderPlayer(playerData) {
      if (!map) {
        return;
      }

      let marker = markers[playerData.id];
      if (!marker) {
        let color = randomColor({
          luminosity: 'light',
          hue: 'random'
        });
        let center = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWidth: 1.0,
          fillColor: color,
          fillOpacity: 0.9,
          map: map,
          radius: 2.0,
          animation: google.maps.Animation.DROP
        });
        let radius = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWidth: 1.0,
          fillColor: color,
          fillOpacity: 0.5,
          map: map,
          radius: playerData.accuracy,
          animation: google.maps.Animation.DROP
        });
        marker = {
          center: center,
          radius: radius
        };
        markers[playerData.id] = marker;
      }

      marker.center.setCenter(playerData.coords);
      marker.radius.setCenter(playerData.coords);
    }
  });
};

export default masterApp;
