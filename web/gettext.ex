defmodule GlobalGameJam_2016.Gettext do
  @moduledoc """
  A module providing Internationalization with a gettext-based API.

  By using [Gettext](http://hexdocs.pm/gettext),
  your module gains a set of macros for translations, for example:

      import GlobalGameJam_2016.Gettext

      # Simple translation
      gettext "Here is the string to translate"

      # Plural translation
      ngettext "Here is the string to translate",
               "Here are the strings to translate",
               3

      # Domain-based translation
      dgettext "errors", "Here is the error message to translate"

  See the [Gettext Docs](http://hexdocs.pm/gettext) for detailed usage.
  """
  use Gettext, otp_app: :global_game_jam_2016
end
