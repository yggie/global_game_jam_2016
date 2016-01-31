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
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 17
  });
};

let masterApp = {};

masterApp.initialize = function () {
  player.connect().then((channel) => {
    let sound = new Sound()
    new Chat(channel, sound, 'master')

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

    let playerIconPath = 'M17.508 13.941l.492.493c-1.127 1.72-3.199 3.566-5.999 3.566-2.801 0-4.874-1.846-6.001-3.566l.492-.493c1.513 1.195 3.174 1.931 5.509 1.931 2.333 0 3.994-.736 5.507-1.931zm6.492-1.941c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-21.159-4h2.51c.564-1.178 1.758-2 3.149-2 1.281 0 2.396.698 3.004 1.729.1.168.28.271.475.271.219 0 .423-.115.536-.302.611-1.014 1.716-1.698 2.985-1.698 1.391 0 2.585.822 3.149 2h2.51c-1.547-3.527-5.068-6-9.159-6s-7.612 2.473-9.159 6zm12.659 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm-7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm13.5 4c0-.685-.07-1.354-.202-2h-2.849c-.245 1.691-1.691 3-3.449 3-1.552 0-2.454-.878-2.955-1.677-.11-.176-.304-.283-.512-.283-.208.001-.4.109-.51.287-.619 1.008-1.75 1.673-3.023 1.673-1.758 0-3.204-1.309-3.449-3h-2.849c-.132.646-.202 1.315-.202 2 0 5.514 4.486 10 10 10s10-4.486 10-10z';
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

        var playerIcon = {
          path: playerIconPath,
          fillColor: color,
          fillOpacity: 0.8,
          scale: 1.0,
          strokeColor: color,
          strokeWeight: 0.5
        };

        marker = new google.maps.Marker({
          map: map,
          icon: playerIcon,
          animation: google.maps.Animation.DROP
        });
        markers[playerData.id] = marker;
      }

      marker.setPosition(playerData.coords);
    }

    let targets = {};
    let targetPath = 'M0 18h21v-12h-21v12zm9.599-6.157v-2.843l6.401 4.686-4.408-1.296v2.61l-6.592-4.488 4.599 1.331zm14.401-1.593v3.5c0 .69-.56 1.25-1.25 1.25h-.75v-6h.75c.69 0 1.25.56 1.25 1.25z';
    function renderTarget(targetData, color) {
      if (!map) {
        return;
      }

      let target = targets[targetData.id];
      if (!target) {
        var energyCell = {
          path: targetPath,
          fillColor: color,
          fillOpacity: 0.8,
          scale: 1.0,
          strokeColor: color,
          strokeWeight: 1
        };
        target = new google.maps.Marker({
          map: map,
          icon: energyCell,
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
