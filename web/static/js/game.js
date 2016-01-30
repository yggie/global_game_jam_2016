import player from './game/player';

function initialize() {
  // get role

  player.connect().then(() => {
    console.log('Player connected successfully');
  });
}

export default { initialize: initialize };
