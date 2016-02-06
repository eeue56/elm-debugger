module Debugger where

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Watcher exposing (connect, listen, Snapshot)
import StartApp
import Effects
import Dict exposing (Dict)
import Json.Encode exposing (Value)

socket =
    connect "http://localhost:8009"

type alias Model =
    { snapshots : List Snapshot
    , filterId : Maybe String
    , isSyncing : Bool
    }

model =
    { snapshots = []
    , filterId = Nothing
    , isSyncing = False
    }

type Action
    = Noop
    | NewSnapshot Snapshot
    | SetFilter (Maybe String)
    | ToggleSyncing

snapshotSignal : Signal Snapshot
snapshotSignal =
    listen socket

update : Action -> Model -> (Model, Effects.Effects (Action))
update action model =
    case action of
        Noop ->
            (model, Effects.none)
        NewSnapshot snapshot ->
            ( { model | snapshots = snapshot :: model.snapshots }
            , Effects.none
            )
        SetFilter id ->
            ( { model | filterId = id }
            , Effects.none
            )
        ToggleSyncing ->
            ( { model | isSyncing = not model.isSyncing }
            , Effects.none
            )


assignColors : List String -> List String
assignColors ids =
    ids

viewClient : Signal.Address Action -> String -> List Snapshot -> Html.Html
viewClient address id snapshots =
    li
        [ onClick address (SetFilter <| Just id) ]
        [ ul
            [ ]
            [ li [] [text ("Id: " ++ id) ]
            , li [] [text ("number of snapshots: " ++ (toString <| List.length snapshots) )]
            ]
        ]

viewClients : Signal.Address Action -> List Snapshot -> Html.Html
viewClients address snapshots =
    let
        onlyIds : List String
        onlyIds =
            List.foldl (\snapshot xs ->
                if List.member snapshot.from xs then
                    xs
                else
                    (snapshot.from) :: xs
                )
            []
            snapshots
    in
        ul
            []
            <| List.map (\id -> viewClient address id <| byId id snapshots) onlyIds

byId id snapshots =
    List.filter (\x -> x.from == id) snapshots

viewSnapshots : Model -> List Html.Html
viewSnapshots model =
    case model.filterId of
        Nothing ->
            List.map (\x -> li [] [ text <| toString x ]) model.snapshots
        Just id ->
            byId id model.snapshots
                |> List.map (\x -> li [] [ text <| toString x.action ])

viewSyncButton : Signal.Address Action -> Model -> Html.Html
viewSyncButton address model =
    button
        [ onClick address ToggleSyncing ]
        [
            (
                if model.isSyncing then
                    "Disable syncing"
                else
                    "Enable syncing"
            )
                |> text

        ]

view : Signal.Address Action -> Model -> Html.Html
view address model =
    div []
        [ button [] []
        , viewClients address model.snapshots
        , ul [] (viewSnapshots model)
        ]


app : StartApp.App Model
app =
    StartApp.start
        { init = (model, Effects.none)
        , view = view
        , update = update
        , inputs =
            [ Signal.map NewSnapshot snapshotSignal
            ]
        }

main = app.html
