var fs = require('fs');
var webEndpoint = require('express')();
var http = require('http');
var httpServer = http.Server(webEndpoint);

var config = {
    httpPort: 80,
    aggregationServerHostname: 'aggregator',
    templateFile: 'index.html',
    fileEncoding: 'utf8',
};

webEndpoint.get('/', function(req, res) {
    requestStatsAggregation(function (data) {
        loadTemplateFile(function (template) {
            res.send(replaceTemplateTags(data, template));
        });
    });
});

function requestStatsAggregation(callback) {
    http.get({ host: config.aggregationServerHostname, path: '/' }, function(response) {
        var resp = '';

        response.on('data', function (chunk) {
    	    resp += chunk;
    	});

    	response.on('end', function () {
	        callback(JSON.parse(resp));
    	});
    });    
}

function loadTemplateFile(callback) {
    fs.readFile(config.templateFile, config.fileEncoding, function (err, contents) {
        callback(contents);
    });
}

function replaceTemplateTags(data, template) {
    for (var d in data) {
        template = template.replace("{{" + d + "}}", data[d]);
    }

    return template;
}

httpServer.listen(config.httpPort, function(){
    console.log('listening on *:%d', config.httpPort);
});
