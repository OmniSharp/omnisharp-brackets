/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */

(function () {
    'use strict';

    var os = require('os'),
        request = require('request'),
        spawn = require('child_process').spawn,
        net = require('net');

    var omniserverProcess;
    
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
    
    function startOmnisharp(projectLocation, callback) {
        projectLocation = '/users/mjmcloug/documents/test';
        findFreePort(function (err, port) {
            if (err !== null) {
                callback(err, null);
            }

            omniserverProcess = spawn('mono ../omnisharp/omnisharp.exe', ['-p ' + port, '-s ' + projectLocation]);
            
            omniserverProcess.stdout.on('data', function (data) {
                callback(null, port);
            });
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
        if (!domainManager.hasDomain("phoenix")) {
            domainManager.registerDomain("phoenix", {
                major: 0,
                minor: 1
            });
        }
        domainManager.registerCommand(
            "phoenix", // domain name
            "startOmnisharp", // command name
            startOmnisharp, // command handler function
            true, // this command is synchronous
            "Starts Omnisharp server",
            [
                {
                    name: "projectLoction",
                    type: "string",
                    description: "The root location of the project"
                }
            ],
            []
        );
    }

    exports.init = init;
}());