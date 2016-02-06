var make = function make(elm) {
    elm.Native = elm.Native || {};
    elm.Native.Reporter = elm.Native.Reporter || {};


    if (elm.Native.Reporter.values) {
        return elm.Native.Reporter.values;
    }
    // we want snapshots on the window so we can send out things if elm dies
    window._elmSnapshots = [];
    var socket = io('http://localhost:8009');
    var originalNotify = elm.notify.bind({});

    var consoleLogger = function(stuff){
        console.log(stuff);
    };

    var remoteLogger = function(stuff){
        console.log(stuff);
    };

    socket.on('snapshot', function(data){
        console.log("got snapshot: ", data._id, data._value);
        originalNotify(data._id, data._value);
    });

    var reporter = consoleLogger;

    var stealNotify = function(a) {

        elm.notify = function(id, value){
            try {
                var changed = originalNotify(id, value);
            } catch (e) {
                report(window._elmSnapshots);
            }

            var snapshot = takeSnapshot(flattenSignalGraph(elm));
            snapshot._id = id;
            snapshot._value = value;

            window._elmSnapshots.push(snapshot);
            console.log('here', id, value);
            socket.emit('snapshot', snapshot);
            return changed;
        }

        return a;
    }

    var report = function(stuff){
        console.warn("Reporter was called!");
        reporter(stuff.slice());
        return stuff;
    };


    var reportNow = function(_){
        report(window._elmSnapshots);
        return [];
    };

    var setReporter = function(reporterSwitch){
        switch (reporterSwitch.ctor){
            case 'Logger':
                reporter = consoleLogger;
                break;
            case 'RemoteLogger':
                reporter = remoteLogger;
                break;
        }

        return reporter;
    };

    // returns array of node references, indexed by node id (?)
    function flattenSignalGraph(runtime) {
        var nodesById = {};

        function addAllToDict(node)
        {
            nodesById[node.id] = node;
            if(node.kids) {
                node.kids.forEach(addAllToDict);
            }
        }
        runtime.inputs.forEach(addAllToDict);

        return nodesById;
    }


    // returns snapshot
    function takeSnapshot(signalGraphNodes)
    {
        var nodeValues = {};

        Object.keys(signalGraphNodes).forEach(function(nodeId) {
            var node = signalGraphNodes[nodeId];
            nodeValues[nodeId] = node.value;
        });

        return nodeValues;
    }


    return {
        stealNotify: stealNotify,
        setReporter: setReporter,
        reportNow: reportNow
    };

    return elm.Native.Reporter.values;
};

Elm.Native.Reporter = {};
Elm.Native.Reporter.make = make;
