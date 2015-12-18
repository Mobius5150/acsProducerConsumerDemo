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
