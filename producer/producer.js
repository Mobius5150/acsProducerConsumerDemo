var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var DataGenerator = require('./data_generator.js');

var config = {
    serverPort: 80,    // Port for the websocket server to list on
    dataLength: 12,    // Max number of bytes of data to generate
    maxInterval: 5000, // Max time between data events
};

var dataGen = new DataGenerator(config);

dataGen.on('data', function(data) {
    console.log('Data: %s', data);
    io.emit('data', { time: new Date(), data: data });
});

http.listen(config.serverPort, function(){
    console.log('listening on *:%d', config.serverPort);
});
