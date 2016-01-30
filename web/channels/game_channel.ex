defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  alias GlobalGameJam_2016.Game.Worker

  def join("game:" <> _game_id, _message, socket) do
    {:ok, socket}
  end

  def handle_in("location", %{"uid" => uid, "coords" => coords , "accuracy" => accuracy}, socket) do
    IO.puts "Message received"
    IO.inspect coords
    Worker.set_position(uid, {coords["lat"], coords["lng"]})
    broadcast! socket, "player:update", %{"uid" => uid, "coords" => coords, "accuracy" => accuracy}
    {:noreply, socket}
  end
end
