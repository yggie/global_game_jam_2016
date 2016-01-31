export class Chat {
  constructor(channel, sound) {
    let msgContainer = $("#messages")
    let msgInput = $("#message-input")

    channel.on("new_message", msg => {
      sound.new_message()
      this.appendMessage(msg, msgContainer, channel)
    })

    msgInput.on("keypress", e => {
      if(e.which !== 13) { return }
      let message = `${new Date().toLocaleString()} <span class="message">${msgInput.val()}<span>`
      channel.push("new_message", {body: message})
      msgInput.val("")
    })
  }

  appendMessage(msg, msgContainer, channel) {
    msgContainer.append(`<p>${msg.body}</p>`)

    let lineHeight = msgContainer.children().first().height() + 10;
    let numberOfLines = msgContainer.children().length;
    let height = lineHeight * numberOfLines;

    msgContainer.animate({scrollTop: height});
  }
}
