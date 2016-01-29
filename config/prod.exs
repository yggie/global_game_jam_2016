use Mix.Config

config :global_game_jam_2016, GlobalGameJam_2016.Endpoint,
  http: [port: {:system, "PORT"}],
  url: [host: "localhost", port: 80],
  cache_static_manifest: "priv/static/manifest.json",
  secret_key_base: System.get_env("SECRET_KEY_BASE")

# Do not print debug messages in production
config :logger, level: :info

