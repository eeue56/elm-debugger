var make = function make(elm) {
    elm.Native = elm.Native || {};
    elm.Native.Watcher = elm.Native.Watcher || {};


    if (elm.Native.Watcher.values) {
        return elm.Native.Watcher.values;
    }

    var NS = Elm.Native.Signal.make(elm);
    var Utils = Elm.Native.Utils.make(elm);
    var Tuple2 = Utils['Tuple2'];
    var List = Elm.Native.List.make(elm);
    var Dict = Elm.Dict.make(elm);

    var jsObjectToElmDict = function(obj){
        var keyPair = [];
        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++){
            var key = keys[i];
            var value = obj[key];

            keyPair.push(Tuple2(key, value));
        }

        return Dict.fromList(List.fromArray(keyPair));
    };

    function connect(url) {
        var connection = {
            ctor: "SocketConnection",
            socket: io(url)
        };

        connection.socket.emit('debug_connect', {});

        return connection;
    };


    function listen(socketConnection) {
        var stream = NS.input('snapshot',
            {}
        );

        socketConnection.socket.on('snapshot', function (data) {
            var item = {
                from: data._from,
                snapshot: data[20],
                action: data._value
            };

            console.log(item);

            elm.notify(stream.id, item);
        });

        return stream;
    };

    return {
        connect: connect,
        listen: listen
    };
};

Elm.Native.Watcher = {};
Elm.Native.Watcher.make = make;
