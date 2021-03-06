defmodule GlobalGameJam_2016.Game.Worker do
  alias GlobalGameJam_2016.Game

  use GenServer

  @max_offset 0.003
  @min_offset 0.002
  @seconds_in_game 600
  @seconds_to_restart 15

  def start_link() do
    uuid = UUID.uuid1()
    GenServer.start_link(__MODULE__, uuid, name: __MODULE__)
  end

  def init(_uuid) do
    send self, :ping
    send self, {:second_tick, @seconds_in_game}

    game = %Game{ uid: "public" }

    blue_target = %{ "lat" => 50.93726 - 0.07*@min_offset, "lng" => -1.397723 + 0.1*@min_offset }
    GenServer.cast(self, {:create_target, "blue", blue_target})

    red_target = %{ "lat" => 50.93724 + 0.2*@min_offset, "lng" => -1.397723 }
    GenServer.cast(self, {:create_target, "red", red_target})

    {:ok, game}
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

  def push_state(team_name, push_function) do
    GenServer.cast(__MODULE__, {:push_state, team_name, push_function})
  end

  def team_name_for_player(player_id) do
    GenServer.call(__MODULE__, {:team_name, player_id})
  end

  def debug_create_target(team_name, coords) do
    GenServer.cast(__MODULE__, {:create_target, team_name, coords})
  end

  def handle_call({:team_name, player_id}, _from, state) do
    {:reply, Game.team_name_for_player(state, player_id), state}
  end

  def handle_call({:has_player?, player_id}, _from, state) do
    {:reply, Game.has_player?(state, player_id), state}
  end

  def handle_call(:new_player, _from, state) do
    if Game.Team.size(state.blue_team) < Game.Team.size(state.red_team) do
      {player_id, state} = Game.new_blue_player(state)
      {:reply, {player_id, "blue"}, state}
    else
      {player_id, state} = Game.new_red_player(state)
      {:reply, {player_id, "red"}, state}
    end
  end

  def handle_cast({:push_state, "blue", push_function}, state) do
    push_blue_state(state, push_function)
    {:noreply, state}
  end

  def handle_cast({:create_target, "blue", coords}, state) do
    {blue_team, target} = Game.Team.create_target(state.blue_team, coords)
    state = %Game{state | blue_team: blue_team}

    blue_channel = channel_name(state, "blue")
    red_channel = channel_name(state, "red")
    push_target_update("blue", target, fn (message, payload) ->
      GlobalGameJam_2016.Endpoint.broadcast!(blue_channel, message, payload)
      GlobalGameJam_2016.Endpoint.broadcast!(red_channel, message, payload)
    end)

    {:noreply, state}
  end

  def handle_cast({:create_target, "red", coords}, state) do
    {red_team, target} = Game.Team.create_target(state.red_team, coords)
    state = %Game{state | red_team: red_team}

    blue_channel = channel_name(state, "blue")
    red_channel = channel_name(state, "red")
    push_target_update("red", target, fn (message, payload) ->
      GlobalGameJam_2016.Endpoint.broadcast!(blue_channel, message, payload)
      GlobalGameJam_2016.Endpoint.broadcast!(red_channel, message, payload)
    end)
    {:noreply, state}
  end

  def handle_cast({:push_state, "red", push_function}, state) do
    push_red_state(state, push_function)
    {:noreply, state}
  end

  def handle_cast({:update_location, id, location}, state) do
    if Game.has_player?(state, id) do
      IO.puts "updated player ID: #{id}"
      {state, {team_name, captured_targets}} = Game.update_player(state, id, location)

      blue_channel = channel_name(state, "blue")
      red_channel = channel_name(state, "red")
      message = "target:captured"
      for claimed_target <- captured_targets do
        payload = %{
          "id" => claimed_target.id
        }
        GlobalGameJam_2016.Endpoint.broadcast!(blue_channel, message, payload)
        GlobalGameJam_2016.Endpoint.broadcast!(red_channel, message, payload)
      end

      {:noreply, state}
    else
      IO.puts "Could not find player with ID: #{id}"
      {:noreply, state}
    end
  end

  def handle_info(:ping, state) do
    blue_channel = channel_name(state, "blue")
    push_blue_state(state, fn (message, payload) ->
      GlobalGameJam_2016.Endpoint.broadcast!(blue_channel, message, payload)
    end)

    red_channel = channel_name(state, "red")
    push_red_state(state, fn (message, payload) ->
      GlobalGameJam_2016.Endpoint.broadcast!(red_channel, message, payload)
    end)

    Process.send_after self, :ping, 5000
    {:noreply, state}
  end

  def handle_info({:second_tick, remaining_seconds}, state) do
    blue_channel = channel_name(state, "blue")
    red_channel = channel_name(state, "red")
    message = "game-state:update"

    payload = if remaining_seconds <= 0 do
      Process.send_after self, {:restart_tick, @seconds_to_restart - 1}, 1000

      %{ "state" => "ended", "remaining_time" => 0, "restart_time" => @seconds_to_restart}
    else
      Process.send_after self, {:second_tick, remaining_seconds - 1}, 1000

      %{ "state" => "playing", "remaining_time" => remaining_seconds}
    end

    GlobalGameJam_2016.Endpoint.broadcast!(blue_channel, message, payload)
    GlobalGameJam_2016.Endpoint.broadcast!(red_channel, message, payload)

    {:noreply, state}
  end

  def handle_info({:restart_tick, remaining_seconds}, state) do
    blue_channel = channel_name(state, "blue")
    red_channel = channel_name(state, "red")
    message = "game-state:update"

    payload = if remaining_seconds <= 0 do
      Process.send_after self, {:second_tick, @seconds_in_game - 1}, 1000

      %{"state" => "playing", "remaining_time" => @seconds_in_game}
    else
      Process.send_after self, {:restart_tick, remaining_seconds - 1}, 1000

      %{"state" => "ended", "remaining_time" => 0, "restart_time" => remaining_seconds}
    end

    GlobalGameJam_2016.Endpoint.broadcast!(blue_channel, message, payload)
    GlobalGameJam_2016.Endpoint.broadcast!(red_channel, message, payload)

    {:noreply, state}
  end

  def channel_name(state, team_name) do
    GlobalGameJam_2016.GameChannel.channel_name(state.uid, team_name)
  end

  defp push_blue_state(state, push_function) do
    push_shared_state(state, push_function, state.blue_team.players)
  end

  defp push_red_state(state, push_function) do
    push_shared_state(state, push_function, state.red_team.players)
  end

  defp push_shared_state(state, push_function, players) do
    push_function.("team:update", %{
      "name" => state.red_team.name,
      "points" => state.red_team.points,
      "team_size": Game.Team.size(state.red_team),
      "targets_remaining": Game.Team.number_of_targets(state.red_team)
    })

    push_function.("team:update", %{
      "name" => state.blue_team.name,
      "points" => state.blue_team.points,
      "team_size": Game.Team.size(state.blue_team),
      "targets_remaining": Game.Team.number_of_targets(state.blue_team)
    })

    for {_id, target} <- state.red_team.targets do
      push_target_update("red", target, push_function)
    end

    for {_id, target} <- state.blue_team.targets do
      push_target_update("blue", target, push_function)
    end

    for {_id, player} <- players do
      push_function.("player:update", %{
        "id" => player.id,
        "coords" => player.coords,
        "accuracy" => player.accuracy
      })
    end
  end

  defp push_target_update(team, target, push_function) do
    push_function.("target:update:" <> team, %{
      "id" => target.id,
      "coords" => target.coords
    })
  end

  # def handle_call({:new_player, _team}, _from, state) do
  #   {:reply, "player_id", state}
  # end
end
