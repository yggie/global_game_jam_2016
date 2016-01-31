import player from './game/player';

player.whenConnected((channel) => {
  let blueTeamScore = $('.blue-team-score');
  let redTeamScore = $('.red-team-score');
  let timeLeft = $(".time-left")
  let cellsCollected = $("#cells-collected")

  channel.on('team:update', (payload) => {
    if (payload.name === player.team()) {
      let collected = payload.points;
      let total = collected + payload.targets_remaining;
      cellsCollected.text(`${collected} of ${total} found`)
    }

    if (payload.name === 'blue') {
      blueTeamScore.text(payload.points);
    } else {
      redTeamScore.text(payload.points);
    }
  });

  channel.on('game-state:update', (payload) => {
    if (payload.state === 'playing') {
      let seconds = Math.floor(payload.remaining_time + 0.0001);
      let minutes = Math.floor(seconds / 60 + 0.0001);
      timeLeft.text(`${pad(minutes, 2)}:${pad(seconds % 60, 2)}`)
    } else {
      let seconds = Math.floor(payload.restart_time + 0.0001);
      let minutes = Math.floor(seconds / 60 + 0.0001);
      timeLeft.text(`Restarting in: ${pad(minutes, 2)}:${pad(seconds % 60, 2)}`)
    }
  });

  function pad(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length-size);
  }
});

export class Chat {
  constructor(channel, sound, role) {
    let msgContainer = $('.chat-message-history')
    let msgInput = $('.chat-input')

    player.whenConnected(() => {
      let id = player.id();
      let nickname = player.nick();

      channel.on("new_message", payload => {
        sound.new_message();
        this.appendMessage(payload, msgContainer);
      });

      msgInput.on("keypress", e => {
        if (e.which !== 13) { return }
        let message = `${nickname} >> <span class="message">${msgInput.val()}<span>`

        channel.push("new_message", {
          id: id,
          sender: nickname,
          role: role,
          timestamp: new Date(),
          contents: msgInput.val()
        });

        msgInput.val('');
      })
    });
  }

  appendMessage(payload, msgContainer) {
    let $text = $('<span class="message-contents"></span>');
    $text.text(payload.contents);

    let $line = $('<p class="message"></p>');
    if (payload.id === player.id()) {
      $line.addClass('my-message');
    }

    $line.append(`<span class="message-sender">${payload.role}-${payload.sender}</span> >> `);
    $line.append($text);

    msgContainer.append($line)

    let lineHeight = msgContainer.children().first().height() + 10;
    let numberOfLines = msgContainer.children().length;
    let height = lineHeight * numberOfLines;

    msgContainer.animate({scrollTop: height});
  }
}
