defmodule GlobalGameJam_2016.Game.Worker do
  use GenServer

  alias GlobalGameJam_2016.Game

  def start_link() do
    uuid = UUID.uuid1()
    GenServer.start_link(__MODULE__, uuid, name: __MODULE__)
  end

  def init(_uuid) do
    send self, {:ping}
    {:ok, %Game{ uid: "public" }}
  end

  def update_location(uid, location) do
    GenServer.cast(__MODULE__, {:update_location, uid, location})
  end

  def push_state(push_function) do
    GenServer.cast(__MODULE__, {:push_state, push_function})
  end

  def handle_cast({:push_state, push_function}, state) do
    push_state(state, push_function)

    {:noreply, state}
  end

  def handle_cast({:update_location, uid, %{"uid" => _, "coords" => _} = location}, state) do
    IO.puts "updated game state"
    {:noreply, %Game{state | players: Map.put(state.players, uid, location)}}
  end

  def handle_info({:ping}, state) do
    push_state(state, fn (message, payload) ->
      channel_name = GlobalGameJam_2016.GameChannel.channel_name(state.uid)

      GlobalGameJam_2016.Endpoint.broadcast!(channel_name, message, payload)
    end)

    Process.send_after self, {:ping}, 5000
    {:noreply, state}
  end

  defp push_state(state, push_function) do
    for {uid, location} <- state.players do
      push_function.("player:update", location)
    end
  end

  # def handle_call({:new_player, _team}, _from, state) do
  #   {:reply, "player_id", state}
  # end
end
