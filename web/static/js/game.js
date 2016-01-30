import player from './game/player';

function initialize() {
  // get role

  player.connect().then((response) => {
    console.log('Player connected successfully, your channel is:', response.channel_name);
  }, () => {
    console.error('Could not connect to the game');
  });
}

export default { initialize: initialize };
