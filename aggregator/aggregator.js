var io = require('socket.io-client');
var DataAggregator = require('./data_aggregator.js');
var webEndpoint = require('express')();
var httpServer = require('http').Server(webEndpoint);

var config = {
    httpPort: 80,
    dataServerPort: 1337,
    dataServerHostname: 'ws://producer',
    minutesToAggregate: 5,
};

var aggregator = new DataAggregator({
    aggregateMinutes: config.minutesToAggregate,
});

webEndpoint.get('/', function(req, res){
    res.send(aggregator.getSummary());
});

httpServer.listen(config.httpPort, function(){
    console.log('listening on *:%d', config.httpPort);
});

var client = io(config.dataServerHostname, { port: config.dataServerPort });
client.on('connect', function (socket) {
    console.log('Connected to producer...');
});

client.on('data', function DataReceived(data) {
    console.log('Received data from producer: ', data.data);
    aggregator.addData({ time: new Date(data.time), data: data.data });
});
