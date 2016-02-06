module Watcher where

import Json.Encode as Json
import Dict exposing (Dict)

import Native.SocketIO
import Native.Watcher



type SocketConnection = SocketConnection

type alias Snapshot =
    { from : String
    , snapshot : Json.Value
    , action : Json.Value
    }

connect : String -> SocketConnection
connect =
    Native.Watcher.connect

listen : SocketConnection -> Signal (Snapshot)
listen =
    Native.Watcher.listen

