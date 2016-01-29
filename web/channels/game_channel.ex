defmodule GlobalGameJam_2016.GameChannel do
  use Phoenix.Channel

  def join("game:" <> _game_id, _message, socket) do
    {:ok, socket}
  end

  def handle_in("location", %{ "coords" => coords }, socket) do
    IO.puts "Message received"
    IO.inspect coords
    {:noreply, socket}
  end
end
