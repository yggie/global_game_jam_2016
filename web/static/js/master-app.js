import {randomColor} from 'randomcolor';
import googleMapsStyle from './google-maps-style';
import player from './game/player';
import {Chat} from './chat'
import {Sound} from './sound'
import tracking from './player-app/tracking';

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

    tracking.once((position) => {
      map.setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });

    channel.on('player:update', (payload) => {
      renderPlayer(payload);
    });

    channel.on('target:update:red', (payload) => {
      renderTarget(payload, 'red');
    });

    channel.on('target:update:blue', (payload) => {
      console.log('BLUE TARGET:', payload.coords);
      renderTarget(payload, 'blue');
    });

    channel.on('target:captured', (payload) => {
      console.log('TARGET CAPTURED:', payload);
      let target = targets[payload.id];
      target.setMap(null);
      delete targets[payload.id];
    });

    channel.on('team:update', (payload) => {
      console.log('TEAM POINTS: (', payload.name, ':', payload.points, ')');
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

    let targets = {};
    function renderTarget(targetData, color) {
      if (!map) {
        return;
      }

      let target = targets[targetData.id];
      if (!target) {
        target = new google.maps.Marker({
          map: map,
          icon: (color === 'blue' ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'),
          animation: google.maps.Animation.DROP
        });
        targets[targetData.id] = target;
      }

      target.setPosition(new google.maps.LatLng(targetData.coords.lat, targetData.coords.lng));
    }

    // TODO REMOVE DEBUG CODE
    google.maps.event.addListener(map, 'click', (event) => {
      channel.push('debug_create_target', {
        team: player.team(),
        coords: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      });
    });
  });
};

export default masterApp;
