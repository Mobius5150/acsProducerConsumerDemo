var util = require('util');

function valueIfDefined(thing, defaultVal) {
    return typeof thing === typeof defaultVal ? thing : defaultVal;
}

function DataAggregator(options) {
    var opts = valueIfDefined(options, {});
    this.aggregateMinutes = valueIfDefined(opts.aggregateMinutes, 15);
    this._startTime = (new Date()).getTime();
    this._data = [];
    this._arrivalTimeDiffs = [];
}

DataAggregator.prototype.addData = function (data) {
    this._data.push(data);
    
    if (this._data.length > 1) {
        this._arrivalTimeDiffs.push(data.time.getTime() - this._data[this._data.length - 2].time.getTime());
    } else {
        this._arrivalTimeDiffs.push(data.time.getTime() - this._startTime);
    }

    this._trimOldData();
}

DataAggregator.prototype._trimOldData = function() {
    var cutoffDate = new Date();
    cutoffDate.setMinutes(-this.aggregateMinutes);
    var cutoff = cutoffDate.getTime();
    while (this._data.length > 0 && this._data[0].time.getTime() < cutoff) {
        this._data.splice(0, 1);
        this._arrivalTimeDiffs.splice(0, 1);
    }
}

DataAggregator.prototype.getSummary = function() {
    this._trimOldData();
    
    return {
        period: util.format('%d minutes', this.aggregateMinutes),
        dataEntries: this._data.length,
        avgSecondsBetweenEntries: Math.round(this.getAverageSecondsBetweenEntries()),
    };
}

DataAggregator.prototype.getAverageSecondsBetweenEntries = function() {
    var total = 0;
    
    for (var i in this._arrivalTimeDiffs) {
        total += this._arrivalTimeDiffs[i];
    }
    
    return total/this._arrivalTimeDiffs.length;
}

module.exports = DataAggregator;
