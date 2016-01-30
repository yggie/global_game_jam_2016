defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  alias GlobalGameJam_2016.Game.Worker

  def channel_name(game_uid) do
    "game:" <> game_uid
  end

  def join("game:" <> _game_id, _message, socket) do
    {:ok, socket}
  end

  def handle_in("location", location = %{ "uid" => uid }, socket) do
    Worker.update_location(uid, location)
    {:noreply, socket}
  end
end
