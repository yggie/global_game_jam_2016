// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel('game:public', {})
channel.join()
  .receive('ok', resp => { console.log("Joined successfully", resp) })
  .receive('error', resp => { console.log("Unable to join", resp) })

function queueTrackLocation() {
  setTimeout(trackLocation, 5000);
}

var tempId = Math.round(Math.random() * 1e6);

function trackLocation() {
  window.navigator.geolocation.getCurrentPosition((position) => {
    channel.push('location', {
      uid: 'player-' + tempId,
      coords: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    });
    queueTrackLocation();
  }, (error) => {
    console.log('error', error);
    queueTrackLocation();
  }, {
    enableHighAccuracy: true
  });
}

channel.on('player:update', (payload) => {
  renderPlayer(payload);
});

let map = null;
let markers = {};

window.initMap = () => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 50.9372123, lng: -1.3977227 },
    styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}],
    zoom: 18
  });

  marker = new google.maps.Marker({
    position: { lat: 50.9372214, lng: 1.3977103 },
    map: map,
    animation: google.maps.Animation.DROP,
    title: 'Player 1'
  });
};

var colors = [
  "blue",
  "red",
  "yellow",
  "green",
  "grey",
  "white",
  "orange",
  "purple"
];

function renderPlayer(player) {
  if (!map) {
    return;
  }

  var marker = markers[player.uid];
  if (!marker) {
    marker = new google.maps.Marker({
      id: player.uid,
      map: map,
      title: 'Player ' + player.uid,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        strokeColor: colors[Math.floor(Math.random() * colors.length)],
        scale: 3
      },
      animation: google.maps.Animation.DROP
    });
    markers[player.uid] = marker;
  }

  marker.setPosition(player.coords);
}

trackLocation();

export default socket
