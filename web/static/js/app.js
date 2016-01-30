// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import {randomColor} from 'randomcolor';
import googleMapsStyle from './google-maps-style';
import player from './game/player';
import game from './game';
import {Chat} from './chat'

game.initialize();

let map = null;

window.initMap = () => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 50.9372123, lng: -1.3977227 },
    styles: googleMapsStyle,
    zoom: 17
  });
};

player.connect().then((channel) => {
  new Chat(null, channel);

  let teamName = $("#team-name")
  let timeLeft = $("#time-left")
  let cellsCollected = $("#cells-collected")

  teamName.append("Team: Blue")
  timeLeft.append("Time: 10 mins")
  cellsCollected.append("Energy Cells: 1 of 5 found")

  function queueTrackLocation() {
    setTimeout(trackLocation, 5000);
  }

  var tempId = Math.round(Math.random() * 1e6);

  let markers = {};

  function trackLocation() {
    window.navigator.geolocation.getCurrentPosition((position) => {
      if (player.id()) {
        channel.push('location', {
          id: player.id(),
          accuracy: position.coords.accuracy,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      }

      map.setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });

      queueTrackLocation();
    }, (error) => {
      console.log('error', error);
      queueTrackLocation();
    }, {
      enableHighAccuracy: true
    });
  }

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

  trackLocation();
});
