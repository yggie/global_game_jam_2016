defmodule GlobalGameJam_2016.Game do
  defstruct uid: nil, players: %{}

  defmodule Player do
    defstruct id: nil, coords: nil
  end
end
