export class Chat {
  constructor(socket) {
    this.socket = socket
    this.msgContainer = $("#messages")
    this.msgInput = $("#message-input")

    // this.channel = socket.channel('game:public', {})
    // this.channel.on('new_message', msg => {
    //   this.appendMessage(msg)
    // })

    // console.log(this.msgInput)

    // this.msgInput.on("keypress", e => {

    //   console.log(e.which)
    //   // if(e.which !== 13) { return }
    //   // this.channel.push('new_message', { body: this.msgInput.val()})
    //   // this.msgInput.val("")
    // })
  }

  appendMessage(msg) {
    this.msgContainer.append(`<br/>${msg.body}`)
    this.msgContainer.scrollTop(this.msgContainer.prop("scrollHeight"))
  }
}
