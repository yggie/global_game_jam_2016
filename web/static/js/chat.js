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
      channel.push("new_message", {body: msgInput.val()})
      msgInput.val("")
    })
  }

  appendMessage(msg, msgContainer, channel) {
    console.log("hello")
    msgContainer.append(`<br/>${msg.body}`)
    msgContainer.scrollTop(msgContainer.prop("scrollHeight"))
  }
}
