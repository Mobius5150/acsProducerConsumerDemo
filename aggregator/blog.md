# Azure Container Service Blog

Today we will be building a simple application running on the Azure Container Service (ACS). ACS is a scalable service for hosting your containerized workloads built with open source orchestration systems Mesos and Docker Swarm.

The application will consist of three components: a producer, an aggregator, and a web client for displaying aggregated data. Holding all of this together will be a Jenkins continuous integration & deployment system that will help automate the deployment of workloads to ACS after they have been validated.

## Requirements
Before you dive in you'll need following tools installed on your system. We also expected that you're running the commands from a debian-based linux. If you aren't, you may have to adjust a few commands to work for your environment. Fortunately the code and the remainder of the tutorial should work fine in Windows, or other operating systems.

 - [NodeJS](https://nodejs.org/en/) version 4.3 or higher
 - [Docker Compose](https://docs.docker.com/compose/)
 - [Docker](https://docs.docker.com/engine/installation/)
 - A text editor you're comfortable with

## The Producer
The producer will consist of a simple NodeJS application that will produce random data at a random interval. This data will be provided to consumers through a websocket stream.

First create a package.json to describe the producer and to track the NodeJS dependencies, and then install dependencies:
```
mkdir producer
cd producer
npm init # Specify producer information
npm install --save socket.io express crypto
```

Next we'll write the simple DataGenerator module. This module will generate random data on an interval and emit it.
```
var crypto = require('crypto');
var util = require('util');
var EventEmitter = require('events');

function valueIfDefined(thing, defaultVal) {
    return typeof thing === typeof defaultVal ? thing : defaultVal;
}

function DataGenerator(options) {
    EventEmitter.call(this);
    var opts = valueIfDefined(options, {});
    this.dataLength = valueIfDefined(opts.dataLength, 12);
    this.maxInterval = valueIfDefined(opts.maxInterval, 2);
    this.setRandomTimeout();
}

util.inherits(DataGenerator, EventEmitter);

DataGenerator.prototype.generateData = function() {
    this.emit('data', crypto.randomBytes(this.dataLength).toString('hex'));
    this.setRandomTimeout();
}

DataGenerator.prototype.setRandomTimeout = function() {
    var self = this;
    // Set a random timeout before we generate data next
    setTimeout(function () { self.generateData(); }, Math.random() * this.maxInterval);
}

module.exports = DataGenerator;
```

Now all that's left to do is to use the data generator and send its data through a stream to any clients that connect.

```
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var DataGenerator = require('./data_generator.js');

var dataGen = new DataGenerator({
    dataLength: 12,   // Max number of bytes of data to generate 
    maxInterval: 5000 // Max time between data events
});

dataGen.on('data', function(data) {
    io.emit('data', { time: new Date(), data: data });
});
```
