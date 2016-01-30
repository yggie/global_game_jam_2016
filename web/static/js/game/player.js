import Cookies from 'js-cookie';
import qwest from 'qwest';

window.Cookies = Cookies;

let player = {};

player.connect = function () {
  return qwest.get('/api/sessions/validate')
    .then((xhr, response) => {
      if (response.status !== 200) {
      return qwest.get('/api/sessions/join-game?id=1');
      } else {
        return response;
      }
    });
};

player.id = function () {
  return Cookies.get('player_id');
};

export default player;
