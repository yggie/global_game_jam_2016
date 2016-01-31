import player from './game/player';

player.whenConnected((channel) => {
  let timeLeft = $("#time-left")
  let cellsCollected = $("#cells-collected")

  timeLeft.text("Time: 10 mins")
  cellsCollected.text("Energy Cells: 0 of 5 found")

  channel.on('team:update', (payload) => {
    if (payload.name === player.team()) {
      let collected = payload.points;
      let total = collected + payload.targets_remaining;
      cellsCollected.text(`Energy Cells: ${collected} of ${total} found`)
    }
  });
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
