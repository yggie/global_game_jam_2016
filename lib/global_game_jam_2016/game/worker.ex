defmodule GlobalGameJam_2016.Game.Worker do
  use GenServer

  alias GlobalGameJam_2016.Game

  def start_link() do
    uuid = UUID.uuid1()
    GenServer.start_link(__MODULE__, uuid, name: __MODULE__)
  end

  def init(_uuid) do
    {:ok, %Game{ uid: "public" }}
  end

  def set_position(uid, {lat, lng}) do
    GenServer.cast(__MODULE__, {:set_position, uid, {lat, lng}})
  end

  def handle_cast({:set_position, uid, {lat, lng}}, state) do
    IO.puts "updated game state"
    {:noreply, %Game{state | players: Map.put(state.players, uid, {lat, lng})}}
  end

  # def handle_call({:new_player, _team}, _from, state) do
  #   {:reply, "player_id", state}
  # end
end
