defmodule GlobalGameJam_2016.PageController do
  use GlobalGameJam_2016.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def player(conn, _params) do
    render conn, "player.html"
  end
end
