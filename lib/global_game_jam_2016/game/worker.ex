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

  def update_location(id, location) do
    GenServer.cast(__MODULE__, {:update_location, id, location})
  end

  def new_player do
    GenServer.call(__MODULE__, :new_player)
  end

  def has_player?(player_id) do
    GenServer.call(__MODULE__, {:has_player?, player_id})
  end

  def push_state(push_function) do
    GenServer.cast(__MODULE__, {:push_state, push_function})
  end

  def handle_call({:has_player?, player_id}, _from, state) do
    {:reply, Map.has_key?(state.players, player_id), state}
  end

  def handle_call(:new_player, _from, state) do
    new_player_id = UUID.uuid1()
    player = %Game.Player{ id: new_player_id }

    {:reply, new_player_id, %Game{state | players: Map.put(state.players, new_player_id, player)}}
  end

  def handle_cast({:push_state, push_function}, state) do
    push_state(state, push_function)

    {:noreply, state}
  end

  def handle_cast({:update_location, id, %{"id" => _, "coords" => _} = location}, state) do
    if Map.has_key?(state.players, id) do
      IO.puts "updated player ID: #{id}"
      {:noreply, %Game{state | players: Map.put(state.players, id, location)}}
    else
      IO.puts "Could not find player with ID: #{id}"
      {:noreply, state}
    end
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
    for {_id, player} <- state.players do
      push_function.("player:update", player)
    end
  end

  # def handle_call({:new_player, _team}, _from, state) do
  #   {:reply, "player_id", state}
  # end
end
