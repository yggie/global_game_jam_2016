let tracking = {};
let callbacks = [];
let timeout = null;

function queueTrackLocation() {
  timeout = setTimeout(trackLocation, 5000);
}

function trackLocation() {
  window.navigator.geolocation.getCurrentPosition((position) => {
    callbacks.forEach((callback) => {
      callback(position);
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

tracking.once = function (callback) {
  window.navigator.geolocation.getCurrentPosition(callback);
};

export default tracking;
