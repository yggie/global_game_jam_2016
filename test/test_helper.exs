ExUnit.start

Mix.Task.run "ecto.create", ~w(-r GlobalGameJam_2016.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r GlobalGameJam_2016.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(GlobalGameJam_2016.Repo)

