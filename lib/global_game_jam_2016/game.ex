defmodule GlobalGameJam_2016.Game do
  defstruct uid: nil, red_players: %{}, blue_players: %{}

  defmodule Player do
    defstruct id: nil, coords: nil, accuracy: nil
  end

  alias GlobalGameJam_2016.Game

  def has_player?(game, player_id) do
    Map.has_key?(game.blue_players, player_id) || Map.has_key?(game.red_players, player_id)
  end

  def new_blue_player(game) do
    player = new_player()
    game = %Game{game | blue_players: Map.put(game.blue_players, player.id, player)}
    {player.id, game}
  end

  def new_red_player(game) do
    player = new_player()
    game = %Game{game | red_players: Map.put(game.red_players, player.id, player)}
    {player.id, game}
  end

  def update_player(game, id, %{ "coords" => coords , "accuracy" => accuracy }) do
    case team_name_for_player(game, id) do
      "blue" ->
        player = Map.get(game.blue_players, id)
        player = %Player{player | coords: coords, accuracy: accuracy}
        %Game{game | blue_players: Map.put(game.blue_players, id, player)}

      "red" ->
        player = Map.get(game.red_players, id)
        player = %Player{player | coords: coords, accuracy: accuracy}
        %Game{game | red_players: Map.put(game.red_players, id, player)}
    end
  end

  def team_name_for_player(game, player_id) do
    cond do
      Map.has_key?(game.blue_players, player_id) ->
        "blue"

      Map.has_key?(game.red_players, player_id) ->
        "red"
    end
  end

  defp new_player do
    new_player_id = UUID.uuid1()
    %Game.Player{ id: new_player_id }
  end
end
