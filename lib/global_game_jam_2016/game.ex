defmodule GlobalGameJam_2016.Game do
  defstruct uid: nil, players: %{}

  defmodule Player do
    defstruct coords: nil
  end
end
