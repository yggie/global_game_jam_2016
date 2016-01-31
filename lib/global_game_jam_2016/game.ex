defmodule GlobalGameJam_2016.Game do
  alias GlobalGameJam_2016.Game
  alias GlobalGameJam_2016.Game.Team

  defstruct uid: nil,
    red_team: %Team{name: "red"},
    blue_team: %Team{name: "blue"}

  def has_player?(game, player_id) do
    Team.has_player?(game.red_team, player_id) || Team.has_player?(game.blue_team, player_id)
  end

  def new_blue_player(game) do
    {blue_team, player_id} = Team.new_player(game.blue_team)
    game = %Game{game | blue_team: blue_team}
    {player_id, game}
  end

  def new_red_player(game) do
    {red_team, player_id} = Team.new_player(game.red_team)
    game = %Game{game | red_team: red_team}
    {player_id, game}
  end

  def update_player(game, id, location) do
    case team_name_for_player(game, id) do
      "blue" ->
        {blue_team, captured_targets} = Team.update_player(game.blue_team, id, location)
        {%Game{game | blue_team: blue_team}, {"blue", captured_targets}}

      "red" ->
        {red_team, captured_targets} = Team.update_player(game.red_team, id, location)
        {%Game{game | red_team: red_team}, {"red", captured_targets}}
    end
  end

  def team_name_for_player(game, player_id) do
    cond do
      Team.has_player?(game.blue_team, player_id) ->
        "blue"

      Team.has_player?(game.red_team, player_id) ->
        "red"
    end
  end
end
