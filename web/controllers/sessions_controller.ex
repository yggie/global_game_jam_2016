defmodule GlobalGameJam_2016.SessionsController do
  use GlobalGameJam_2016.Web, :controller

  alias GlobalGameJam_2016.Game.Worker
  alias GlobalGameJam_2016.GameChannel

  def validate(conn, _params) do
    conn = conn |> fetch_session
    if current_player_exists?(conn) do
      team_name = current_player_team_name(conn)
      json conn, json_response(team_name)
    else
      conn |> Plug.Conn.configure_session(drop: true)
      |> json(%{
        "status" => 401,
        "message" => "game or player was not found"
      })
    end
  end

  def join_game(conn, _params) do
    if current_player_exists?(conn) do
      team_name = current_player_team_name(conn)
      json conn, json_response(team_name)
    else
      {player_id, team_name} = Worker.new_player
      conn = conn |> fetch_session
                  |> put_resp_cookie("player_id", player_id, http_only: false)
                  |> put_resp_cookie("team_name", team_name, http_only: false)

      team_name = current_player_team_name(conn)
      json conn, json_response(team_name)
    end
  end

  defp current_player_exists?(conn) do
    Map.has_key?(conn.cookies, "player_id") &&
      Worker.has_player?(conn.cookies["player_id"])
  end

  defp current_player_team_name(conn) do
    conn.cookies["player_id"] |> Worker.team_name_for_player
  end

  defp json_response(team_name) do
    %{
      "status" => 200,
      "channel_name" => GameChannel.channel_name("public", team_name)
    }
  end
end
