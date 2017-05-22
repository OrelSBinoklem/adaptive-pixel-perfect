'use strict';
var io = require('socket.io');
var express = require('express');
var http = require('http');
var fs   = require('fs');
var path = require('path');
var through2 = require("through2").obj;
var gulp = require('gulp');
var proxy = require('express-http-proxy');
var externalip = require('externalip');
var diff = require('diff');

var pageManagerVisualizator   = require('./lib/page-manager-visualizator');
var pixelPerfect   = require('./lib/pixel-perfect');
var sessionModel   = require('./lib/session-model.js');

var ____;
var __ = function() {};

__.create = function() {
    ____ = new __();
    this.serverInit = false;
    return ____;
}

__.prototype.start = function(port, dirDesignScreenshots, browserSyncPort) {
    if(!____.serverInit && (____.serverInit = !!1)) {
        this.serverInit = true;

        this.pageManagerVisualizator = new pageManagerVisualizator();
        this.pixelPerfect = new pixelPerfect();

        if (browserSyncPort !== undefined) {
            this.browserSyncPort = browserSyncPort;
        }
        this.port = port;
        this.dirDesignScreenshots = dirDesignScreenshots;

        this.sessionModel = sessionModel.startSession(this.dirDesignScreenshots);

        this.app = express();
        this.server = http.createServer(this.app);
        this.io = io(this.server);
        this.io = this.io.of('/a-pp');

        this.cacheStile = {};

        //var myip = require('quick-local-ip');
        //console.log(myip.getLocalIP4());


        /*var localtunnel = require('localtunnel');

         var tunnel = localtunnel(3010, {subdomain: "bb", local_host: "localhost"}, function(err, tunnel) {
         //if (err)

         // the assigned public url for your tunnel
         // i.e. https://abcdefgjhij.localtunnel.me
         //console.log(tunnel.url);
         //tunnel.url;
         });*/

        this.app.use('/a-pp-design-screenshots', express.static(dirDesignScreenshots));
        this.app.use('/a-pp-public', express.static(__dirname + '/public'));
        if (browserSyncPort !== undefined) {
            this.app.use('/', function (req, res, next) {
                if ("a-pp" in req.query && req.query["a-pp"] == 1) {
                    express.static(__dirname + '/public').apply(this, arguments);
                } else {
                    proxy('http://localhost:' + browserSyncPort).apply(this, arguments);
                }
            });
        } else {
            this.app.use('/', function (req, res, next) {
                if ("a-pp" in req.query && req.query["a-pp"] == 1) {
                    express.static(__dirname + '/public').apply(this, arguments);
                } else {
                    next();
                }
            });
        }

        ____.sessionModel.get().then(____.init);
    }
}

__.prototype.init = function() {
    pixelPerfect.refreshThumbnails(____.dirDesignScreenshots);

    ____.server.listen( ____.port || 3010 );

    ____.io.on('connection', function (socket) {
        ____.sessionModel.connect(socket);
        ____.socket = socket;

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

__.prototype.changeStyle = function(o) {
    ____.stylePath = o.filepath;
    ____.runTask = o.runTask;
    //var contents = fs.readFileSync(filepath);

    //Пропускаем только те файлы которые были модифицированы не калибратором стилей

    var mtime = JSON.stringify(fs.statSync(____.stylePath).mtime.getTime());
    if(____.stylePath in ____.cacheStile) {
        if(____.cacheStile[____.stylePath].mtime < mtime) {
            sendBrowser();
        }
    } else {
        ____.cacheStile[____.stylePath] = {};
        addCache();
    }

    function sendBrowser() {
        var fold = ____.cacheStile[____.stylePath].string;
        addCache();
        var fnew = ____.cacheStile[____.stylePath].string;

        var compare = diff.diffChars(fold, fnew);
        var cursors = [];
        var lastRangeModified = false;
        compare.forEach(function(el, i) {
            if(!("added" in el || "removed" in el)) {
                cursors.push((cursors.length)?cursors[cursors.length - 1] + el.count:el.count);
                lastRangeModified = false;
            } else {
                lastRangeModified = true;

                if(i == 0) {
                    cursors.push(0);
                }

                if("added" in el && el.added === true) {
                    cursors[cursors.length - 1] += el.count;
                }
            }
        });
        //Если в последнем куске небыло модификаций
        if(cursors.length && !lastRangeModified) {
            cursors.pop();
        }

        ____.io.emit("modifyStile", {
            file: {
                path: ____.stylePath,
                string: fnew,
                cursors: cursors
            }
        });
    }

    function addCache() {
        ____.cacheStile[____.stylePath].mtime = mtime;
        ____.cacheStile[____.stylePath].string = fs.readFileSync(____.stylePath).toString();
    }
}

__.prototype.endStyleTask = function() {
    console.log("endd");
    /*return through2(function(file, enc, callback){
        console.log(file);
        /!*resizeImg(file.contents, {width: 320}).then(buf => {
            file.contents = buf;
            callback(null, file);
        });*!/
    });*/
}

module.exports = __;