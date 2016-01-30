import Cookies from 'js-cookie';
import q from 'q';
import qwest from 'qwest';
import socket from '../socket';

let player = {};
let playerConnectPromise = null;

player.connect = function () {
  if (!playerConnectPromise) {
    playerConnectPromise = qwest.get('/api/sessions/validate')
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
      });
  }

  return playerConnectPromise;
};

player.id = function () {
  return Cookies.get('player_id');
};

export default player;
