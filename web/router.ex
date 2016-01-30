defmodule GlobalGameJam_2016.Router do
  use GlobalGameJam_2016.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", GlobalGameJam_2016 do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  scope "/api", GlobalGameJam_2016 do
    pipe_through :api

    get "/sessions/validate", SessionsController, :validate
    get "/sessions/join-game", SessionsController, :join_game
  end
end
