var app = require('http').createServer(function() {});
var io = require('socket.io')(app);

app.listen(8009);

var clients = [];
var debuggingSessions = [];

io.on('connection', function(socket) {
    clients.push(socket.id);
    console.log("connected", socket.id);

    socket.on('snapshot', function(data) {
        console.log("snapshot from " , socket.id);
        if (typeof data._from !== "undefined"){
            return;
        }
        data._from = socket.id;

        var socketsThatSent = [];

        clients.forEach(function(v, i){
            if (socket.id === v || socketsThatSent.indexOf(v) > -1){
                console.log("same id so not sending");
                return;
            }

            try {
                io.sockets.connected[v].emit('snapshot', data);
                console.log(v);
                socketsThatSent.push(v);
            } catch (e) {

            }
        });

        debuggingSessions.forEach(function(v, i){
            console.log(socket.id);
            try {
                io.sockets.connected[v].emit('snapshot');
            } catch (e) {

            }
        });
    });

    socket.on('debug_connect', function(data){
        var id = socket.id;
        debuggingSessions.push(id);
    });
});
