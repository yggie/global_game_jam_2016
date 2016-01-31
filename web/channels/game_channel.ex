defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  alias GlobalGameJam_2016.Game.Worker

  def channel_name(game_id, "red") do
    "game:red:" <> game_id
  end

  def channel_name(game_id, "blue") do
    "game:blue:" <> game_id
  end

  def join("game:" <> game_meta, _message, socket) do
    [team_name, _game_id] = String.split(game_meta, ":")
    send self, {:after_join, team_name}
    {:ok, socket}
  end

  def handle_in("location", location = %{"id" => id}, socket) do
    Worker.update_location(id, location)
    {:noreply, socket}
  end

  def handle_in("debug_create_target", %{"team" => team, "coords" => coords}, socket) do
    Worker.debug_create_target(team, coords)
    {:noreply, socket}
  end

  def handle_info({:after_join, team_name}, socket) do
    Worker.push_state(team_name, fn (message, payload) ->
      push socket, message, payload
    end)

    {:noreply, socket}
  end

  def handle_in("new_message", payload, socket) do
    broadcast socket, "new_message", payload
    {:noreply, socket}
  end
end
