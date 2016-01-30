let tracking = {};
let callbacks = [];
let timeout = null;

function queueTrackLocation() {
  timeout = setTimeout(trackLocation, 5000);
}

function trackLocation() {
  window.navigator.geolocation.getCurrentPosition((position) => {
    callbacks.each((callback) => {
      callback(position);
    });
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

tracking.start = function (callback) {
  if (!timeout) {
    queueTrackLocation();
  }

  callbacks.push(callback);
};

export default tracking;
