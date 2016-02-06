module Reporter where

import Native.SocketIO
import Native.Reporter


type Reporter = Logger | RemoteLogger

-- Hook this in to your main to start storing Elm events in
-- window._elmSnapshots
-- just put it anywhere
stealNotify : a -> a
stealNotify =
    Native.Reporter.stealNotify


-- Has no functionality right now, but will support remote debugging
setReporter : Reporter -> (a -> a)
setReporter =
    Native.Reporter.setReporter

-- call this to force a dump of window._elmSnapshots
-- not really needed.
reportNow : () -> ()
reportNow = Native.Reporter.reportNow

