defmodule GlobalGameJam_2016.PageControllerTest do
  use GlobalGameJam_2016.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "Welcome to Phoenix!"
  end
end
