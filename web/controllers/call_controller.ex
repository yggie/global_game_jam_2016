defmodule GlobalGameJam_2016.CallController do
  use GlobalGameJam_2016.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
