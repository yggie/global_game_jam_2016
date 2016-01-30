defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  alias GlobalGameJam_2016.Game.Worker

  def channel_name(game_uid) do
    "game:" <> game_uid
  end

  def join("game:" <> _game_id, _message, socket) do
    send self, :after_join
    {:ok, socket}
  end

  def handle_in("location", location = %{ "uid" => uid }, socket) do
    Worker.update_location(uid, location)
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    Worker.push_state(fn (message, payload) ->
      push socket, message, payload
    end)

    {:noreply, socket}
  end
end
