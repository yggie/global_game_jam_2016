defmodule GlobalGameJam_2016.Endpoint do
  use Phoenix.Endpoint, otp_app: :global_game_jam_2016

  socket "/socket", GlobalGameJam_2016.UserSocket

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phoenix.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/", from: :global_game_jam_2016, gzip: false,
    only: ~w(css fonts images sounds js favicon.ico robots.txt)

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Logger

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Poison

  plug Plug.MethodOverride
  plug Plug.Head

  plug Plug.Session,
    store: :cookie,
    key: "_global_game_jam_2016_key",
    signing_salt: "0Use9MuS"

  plug GlobalGameJam_2016.Router
end
