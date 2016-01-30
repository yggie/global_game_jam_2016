defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  alias GlobalGameJam_2016.Game.Worker

  def channel_name(game_id) do
    "game:" <> game_id
  end

  def join("game:" <> _game_id, _message, socket) do
    send self, :after_join
    {:ok, socket}
  end

  def handle_in("location", location = %{ "id" => id }, socket) do
    Worker.update_location(id, location)
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    Worker.push_state(fn (message, payload) ->
      push socket, message, payload
    end)

    {:noreply, socket}
  end
end
