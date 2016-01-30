import Cookies from 'js-cookie';
import q from 'q';

let player = {};

player.connect = function () {
  let deferred = q.defer();

  deferred.resolve('connection success');

  return deferred.promise;
};

export default player;
