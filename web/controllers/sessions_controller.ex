defmodule GlobalGameJam_2016.SessionsController do
  use GlobalGameJam_2016.Web, :controller

  alias GlobalGameJam_2016.Game.Worker

  def validate(conn, _params) do
    conn = conn |> fetch_session
    if current_player_exists?(conn) do
      json conn, %{
        "status" => 200,
        "channel_name" => "game:public"
      }
    else
      conn |> Plug.Conn.configure_session(drop: true)
      |> json(%{
        "status" => 401,
        "message" => "game or player was not found"
      })
    end
  end

  def join_game(conn, _params) do
    IO.puts "JOINING GAME"
    if current_player_exists?(conn) do
      json conn, %{
        "status" => 200,
        "channel_name" => "game:public"
      }
    else
      player_id = Worker.new_player
      conn = conn |> fetch_session |> put_resp_cookie("player_id", player_id, http_only: false)

      json conn, %{
        "status" => 200,
        "channel_name" => "game:public"
      }
    end
  end

  defp current_player_exists?(conn) do
    Map.has_key?(conn.cookies, "player_id") &&
      Worker.has_player?(conn.cookies["player_id"])
  end
end
