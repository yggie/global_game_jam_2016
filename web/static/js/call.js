class Call {
  constructor(socket) {
    this.channel = socket.channel("call", {})
    this.channel.join()
      .receive("ok", () => { console.log("Successfully joined call channel") })
      .receive("error", () => { console.log("Unable to join") })

    this.localStream;
    this.peerConnection;
    this.localVideo = $("#localVideo");
    this.remoteVideo = $("#remoteVideo");
    this.connectButton = $("#connect")[0];
    this.callButton = $("#call")[0];
    this.hangupButton = $("#hangup")[0];

    this.hangupButton.disabled = true;
    this.callButton.disabled = true;
    this.connectButton.onclick = this.connectButtonHandler.bind(this);
    this.callButton.onclick = this.callButtonHandler.bind(this);
    this.hangupButton.onclick = this.hangupButtonHandler.bind(this);

    this.channel.on("message", payload => {
      console.log("message", payload.body);
      let message = JSON.parse(payload.body);
      if (message.sdp) {
        this.gotRemoteDescription(message);
      } else {
        this.gotRemoteIceCandidate(message);
      }
    })
  }

  connectButtonHandler() {
    console.log("Requesting local stream");
    navigator.getUserMedia({audio:true, video:true}, this.gotStream.bind(this), error => {
      console.log("getUserMedia error: ", error);
    });
  }

  gotStream(stream) {
    console.log("Received local stream", stream);
    this.localVideo.src = URL.createObjectURL(stream);
    this.setupPeerConnection(stream);
  }

  setupPeerConnection(stream) {
    this.connectButton.disabled = true;
    this.callButton.disabled = false;
    this.hangupButton.disabled = false;
    console.log("Waiting for call");

    let servers = {
      "iceServers": [{
        "url": "stun:stun.example.org"
      }]
    };

    this.peerConnection = new RTCPeerConnection(servers);
    console.log("Created local peer connection", this.peerConnection);
    this.peerConnection.onicecandidate = this.gotLocalIceCandidate.bind(this);
    this.peerConnection.onaddstream = this.gotRemoteStream.bind(this);
    this.peerConnection.addStream(stream);
    console.log("Added localStream to localPeerConnection");
  }

  callButtonHandler() {
    this.callButton.disabled = true;
    console.log("Starting call");
    this.peerConnection.createOffer(this.gotLocalDescription.bind(this), this.handleError.bind(this));
  }

  gotLocalDescription(description){
    console.log("gotLocalDescription", description);
    this.peerConnection.setLocalDescription(description, () => {
      this.channel.push("message", { body: JSON.stringify({
        "sdp": this.peerConnection.localDescription
      })});
    }, this.handleError.bind(this));
    console.log("Offer from localPeerConnection: \n" + description.sdp);
  }

  gotRemoteDescription(description){
    console.log("Answer from remotePeerConnection: \n" + description.sdp);
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(description.sdp));
    this.peerConnection.createAnswer(this.gotLocalDescription.bind(this), this.handleError.bind(this));
  }

  gotRemoteStream(event) {
    this.remoteVideo.src = URL.createObjectURL(event.stream);
    console.log("Received remote stream");
  }

  gotLocalIceCandidate(event) {
    console.log("gotLocalIceCandidate", event);
    if (event.candidate) {
      console.log("Local ICE candidate: \n" + event.candidate.candidate);
      this.channel.push("message", {body: JSON.stringify({
        "candidate": event.candidate
      })});
    }
  }

  gotRemoteIceCandidate(event) {
    console.log("gotRemoteIceCandidate", event);
    this.callButton.disabled = true;
    if (event.candidate) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
      console.log("Remote ICE candidate: \n " + event.candidate.candidate);
    }
  }

  hangupButtonHandler() {
    console.log("Ending call");
    this.peerConnection.close();
    this.localVideo.src = null;
    this.peerConnection = null;
    this.hangupButton.disabled = true;
    this.connectButton.disabled = false;
    this.callButton.disabled = true;
  }

  handleError(error) {
    console.log(error.name + ": " + error.message);
  }

}

import socket from './socket'
let callApp = new Call(socket)

export default callApp
