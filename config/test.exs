use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :global_game_jam_2016, GlobalGameJam_2016.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :global_game_jam_2016, GlobalGameJam_2016.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "global_game_jam_2016_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox
