import Cookies from 'js-cookie';
import q from 'q';
import qwest from 'qwest';
import socket from '../socket';

let player = {};
let playerConnectApiPromise = null;
let playerConnectDeferred = q.defer();

player.connect = function () {
  if (playerConnectApiPromise) {
    console.error('Multiple attempts to connect the player, the last one is ignored');
  } else {
    playerConnectApiPromise = qwest.get('/api/sessions/validate')
      .then((xhr, response) => {
        if (response.status !== 200) {
          return qwest.get('/api/sessions/join-game?id=1')
            .then((xhr, resp) => { return resp; });
        } else {
          return response;
        }
      })
      .then((response) => {
        let channel = socket.channel(response.channel_name, {});

        channel.join()
          .receive('ok', resp => { console.log("Joined successfully", resp) })
          .receive('error', resp => { console.log("Unable to join", resp) })

        return channel;
      })
      .then(playerConnectDeferred.resolve);
  }

  return playerConnectDeferred.promise;
};

player.whenConnected = function (callback) {
  return playerConnectDeferred.promise.then(callback);
};

player.id = function () {
  return Cookies.get('player_id');
};

player.nick = function () {
  return this.id().substring(0, 2);
};

player.team = function() {
  return Cookies.get('team_name');
};

export default player;
