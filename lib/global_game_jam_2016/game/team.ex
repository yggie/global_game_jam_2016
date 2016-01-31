defmodule GlobalGameJam_2016.Game.Team do
  alias GlobalGameJam_2016.Game.Team
  alias GlobalGameJam_2016.Game.Player
  alias GlobalGameJam_2016.Game.Target

  @capture_distance 0.0005

  defstruct name: "unknown", players: %{}, targets: %{}, points: 0

  def has_player?(team, player_id) do
    Map.has_key?(team.players, player_id)
  end

  def new_player(team) do
    player_id = UUID.uuid1()
    player = %Player{ id: player_id }

    {%Team{team | players: Map.put(team.players, player_id, player)}, player_id}
  end

  def size(team) do
    team.players |> Map.keys |> Enum.count
  end

  def update_player(team, id, %{ "coords" => coords , "accuracy" => accuracy }) do
    player = team.players[id]
    player = %Player{player | coords: coords, accuracy: accuracy}
    captured_targets = Enum.reduce(team.targets, [], fn ({_id, target}, captured) ->
      if distance(target.coords, player.coords) < @capture_distance do
        [target | captured]
      else
        captured
      end
    end)

    team = Enum.reduce(captured_targets, team, fn (target, team) ->
      %Team{team | targets: Map.delete(team.targets, target.id)}
    end)

    {%Team{team | players: Map.put(team.players, id, player), points: Enum.count(captured_targets) + team.points}, captured_targets}
  end

  defp distance(coords_0, coords_1) do
    lat_diff = coords_0["lat"] - coords_1["lat"]
    lng_diff = coords_0["lng"] - coords_1["lng"]
    :math.sqrt(lat_diff*lat_diff + lng_diff*lng_diff)
  end
end
