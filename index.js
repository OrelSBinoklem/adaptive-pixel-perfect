'use strict';
var io = require('socket.io');
var express = require('express');
var http = require('http');
var fs   = require('fs');
var path = require('path');
var gulp = require('gulp');
var proxy = require('express-http-proxy');

var pageManagerVisualizator   = require('./lib/page-manager-visualizator');
var pixelPerfect   = require('./lib/pixel-perfect');
var sessionModel   = require('./lib/session-model.js');

var ____;
var __ = function(port, dirDesignScreenshots, browserSyncPort) {
    this.pageManagerVisualizator = new pageManagerVisualizator();
    this.pixelPerfect = new pixelPerfect();

    if(browserSyncPort !== undefined) {this.browserSyncPort = browserSyncPort;}
    this.port = port;
    this.dirDesignScreenshots = dirDesignScreenshots;
    this.serverInit = false;

    this.sessionModel = sessionModel.startSession(this.dirDesignScreenshots);

    this.app = express();
    this.server = http.createServer(this.app);
    this.io = io(this.server);
    this.io = this.io.of('/a-pp');
    
    if(browserSyncPort !== undefined) {
        this.app.use('/a-pp-design-screenshots', function (req, res, next) {
            //console.log(req._parsedUrl.path);
            if("a-pp" in req.query && req.query["a-pp"] == 1) {
                express.static(dirDesignScreenshots).apply(this, arguments);
            } else {
                proxy('http://localhost:'+browserSyncPort).apply(this, arguments);
            }
        });

        this.app.use('/', function (req, res, next) {
            //console.log(req._parsedUrl.path);
            if("a-pp" in req.query && req.query["a-pp"] == 1) {
                express.static(__dirname + '/public').apply(this, arguments);
            } else {
                proxy('http://localhost:'+browserSyncPort).apply(this, arguments);
            }
        });
    } else {
        this.app.use('/a-pp-design-screenshots', function (req, res, next) {
            if("a-pp" in req.query && req.query["a-pp"] == 1) {
                express.static(dirDesignScreenshots).apply(this, arguments);
            } else {
                next();
            }
        });

        this.app.use('/', function (req, res, next) {
            if("a-pp" in req.query && req.query["a-pp"] == 1) {
                express.static(__dirname + '/public').apply(this, arguments);
            } else {
                next();
            }
        });
    }
};

__.start = function(port, dirDesignScreenshots, browserSyncPort) {
    ____ = new __(port, dirDesignScreenshots, browserSyncPort);
    ____.sessionModel.get().then(____.init);
    return ____;
}

__.prototype.init = function() {

    if( !____.serverInit && (____.serverInit = !!1) ) {
        pixelPerfect.refreshThumbnails(____.dirDesignScreenshots);

        ____.server.listen( ____.port || 3010 );

        ____.io.on('connection', function (socket) {
            if("browserSyncPort" in ____) {
                socket.emit("browserSyncPort", ____.browserSyncPort);
            }

            ____.sessionModel.connect(socket);

            /*socket.on('disconnect', function () {
                console.log('user disconnected');
            });*/
        });

        setInterval(function() {
            if(____.sessionModel.sessionChange) {
                ____.sessionModel.save();
                ____.sessionModel.sessionChange = false;
            }
        }, 2000);
    }
}

module.exports = __;