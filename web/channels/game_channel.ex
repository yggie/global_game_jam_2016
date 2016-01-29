defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  alias GlobalGameJam_2016.Game.Worker

  def join("game:" <> _game_id, _message, socket) do
    {:ok, socket}
  end

  def handle_in("location", %{ "coords" => coords }, socket) do
    IO.puts "Message received"
    IO.inspect coords
    Worker.set_position({coords["lat"], coords["lng"]})
    broadcast! socket, "player:update", %{ "coords" => coords }
    {:noreply, socket}
  end
end
