/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */

(function () {
    'use strict';

    var os = require('os'),
        request = require('request'),
        spawn = require('child_process').spawn,
        net = require('net');

    var _omnisharpProcess,
        _domainManager,
        _omnisharpLocation,
        _port;
    
    function findFreePort(callback) {
        var server = net.createServer(),
            port = 0;
    
        server.on('listening', function () {
            port = server.address().port;
            server.close();
        });
        
        server.on('close', function () {
            callback(null, port);
        });
        
        server.listen(0, '127.0.0.1');
    }
    
    function getOmnisharpLocation() {
        var indexOf = __dirname.lastIndexOf('/');
        var location = __dirname.substring(0, indexOf);
        return location + '/omnisharp';
    }
    
    function startOmnisharp(projectLocation, callback) {
        console.info('launching omnisharp');
        projectLocation = '/users/mjmcloug/documents/test';
        findFreePort(function (err, port) {
            if (err !== null) {
                callback(err);
            }
            
            _port = port;
            _omnisharpProcess = spawn('mono', [ _omnisharpLocation + '/omnisharp.exe', '-p', _port, '-s', projectLocation]);
            
            _omnisharpProcess.stdout.on('data', function (data) {
                console.info(data.toString());
            });
            
            _omnisharpProcess.stderr.on('data', function (data) {
                console.error(data.toString());
                _domainManager.emitEvent('phoenix', 'onmisharpError', data);
            });
            
            _omnisharpProcess.on('close', function (data) {
                console.log(data);
            });
            
            callback(null, _port);
        });
    }
    
    function callService(service, data, callback) {
        console.info('making omnisharp request: ' + service);
        var url = 'http://localhost:' + _port + '/' + service;
        request.post(url, { json: data }, function (err, res, body) {
            console.info(body);
            if (!err && res.statusCode === 200) {
                callback(null, body);
            } else {
                callback(err);
            }
        });
    }
    
//    function cmdSendRequest(url, line, column, buffer, filename, callbackfn) {
//
//        var httpbody = {};
//        httpbody.line = line || 1;
//        httpbody.column = column || 1;
//        httpbody.buffer = buffer || 'namespace MyApp {     using System;      class Program     {         public static void Main(string[] args)         {             Console.WriteLine("Running a http server on port 1924");                              Console.ReadKey()         }     } }';
//        httpbody.filename = filename || 'main.cs';
//
//        var omniurl = url || "/syntaxerrors";
//
//        request.post('http://localhost:2000' + omniurl, {
//            json: httpbody
//        }, function (error, response, body) {
//            console.info(body);
//            console.info(callbackfn);
//            if (!error && response.statusCode === 200) {
//                callbackfn(null, body);
//            } else {
//                callbackfn('oops:' + response);
//            }
//        });
//    }
//
    function init(domainManager) {
        _domainManager = domainManager;
        _omnisharpLocation = getOmnisharpLocation();
        
        if (!_domainManager.hasDomain('phoenix')) {
            _domainManager.registerDomain('phoenix', {
                major: 0,
                minor: 1
            });
        }
        
        _domainManager.registerCommand(
            'phoenix', // domain name
            'startOmnisharp', // command name
            startOmnisharp, // command handler function
            true, // this command is synchronous
            'Starts omnisharp server',
            [{
                name: 'projectLoction',
                type: 'string',
                description: 'The root location of the project'
            }],
            []
        );
        
        _domainManager.registerCommand(
            'phoenix',
            'callService',
            callService,
            true,
            'Make a request to omnisharp server',
            [
                {
                    name: 'service',
                    type: 'string',
                    description: 'The name of the onmisharp service'
                },
                {
                    name: 'data',
                    type: 'json',
                    description: 'Data to send to omnisharp service'
                }
            ]
        );
                 
        
        _domainManager.registerEvent(
            'phoenix',
            'onmisharpError',
            [{
                name: 'data',
                type: 'string',
                description: 'stderr output'
            }]
        );
    }

    exports.init = init;
}());