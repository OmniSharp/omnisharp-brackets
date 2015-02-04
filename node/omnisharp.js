/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global module, process */

(function () {
    'use strict';

    var path = require('path'),
        request = require('request'),
        spawn = require('child_process').spawn,
        exec = require('child_process').exec,
        net = require('net'),
        psTree = require('ps-tree');

    var _domainName = 'omnisharp-brackets',
        _omnisharpProcess,
        _domainManager,
        _port,
        _checkStatusCount = 3,
        _checkStatusTimeout = 10000;

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

    function reallyKillIt(pid) {
        if (process.platform === 'win32') {
            exec('taskkill /PID ' + pid + ' /T /F');
            return;
        }

        var signal = 'SIGKILL',
            killTree = true;

        if (killTree) {
            psTree(pid, function (err, children) {
                [pid].concat(
                    children.map(function (p) {
                        return p.PID;
                    })
                ).forEach(function (tpid) {
                    try {
                        process.kill(tpid, signal);
                    } catch (ignore) { }
                });
            });
        } else {
            try {
                process.kill(pid, signal);
            } catch (ignore) { }
        }
    }

    function checkReady(checkStatusCount) {
        console.info('Checking omnisharp status');

        if (checkStatusCount <= 0) {
            _omnisharpProcess.kill('SIGKILL');
            _omnisharpProcess = null;

            console.error('Omnisharp faied to start');
            _domainManager.emitEvent(_domainName, 'omnisharpError', { message: 'Omnisharp failed to start'});
            return;
        }

        request.post('http://localhost:' + _port + '/checkreadystatus', { }, function (err, res, body) {
            if (!err && res.statusCode === 200 && body === 'true') {
                _domainManager.emitEvent(_domainName, 'omnisharpReady');
            } else {
                console.info('checkready count: ' + checkStatusCount);
                setTimeout(function () {
                    checkReady(checkStatusCount - 1);
                }, _checkStatusTimeout);
            }
        });
    }

    function getOmnisharpLocation() {
        var script = process.platform === 'win32' ? 'omnisharp.cmd' : 'omnisharp';
        return process.env['OMNISHARP'] || path.join(__dirname, '..', 'omnisharp', script);
    }

    function startOmnisharp(projectLocation, callback) {
        _domainManager.emitEvent(_domainName, 'omnisharpStarting');

        console.info('Launching Omnisharp');

        findFreePort(function (err, port) {
            if (err !== null) {
                callback(err);
            }

            _port = port;

            var location = getOmnisharpLocation(),
                isMono = process.platform !== 'win32',
                args = ['-p', _port, '-s', projectLocation, '--hostPID', process.pid],
                executable;

            console.info(location);

            if (isMono && path.extname(location) === '.exe') {
                executable = 'mono';
                args.unshift(location);
            } else {
                executable = location;
            }

            console.log(executable);
            console.log(args);

            _omnisharpProcess = spawn(executable, args);

            _omnisharpProcess.stdout.on('data', function (data) {
                console.info(data.toString());
            });

            _omnisharpProcess.stderr.on('data', function (data) {
                console.info(data.toString());
            });

            _omnisharpProcess.on('close', function (data) {
                console.info(data);
                _domainManager.emitEvent(_domainName, 'omnisharpQuit', data);
            });
        });

        callback(null, _port);

        setTimeout(function () {
            checkReady(_checkStatusCount);
        }, _checkStatusTimeout);
    }

    function stopOmnisharp() {
        if (_omnisharpProcess !== null) {
            console.info('Killing Omnisharp');

            _omnisharpProcess.stdout.pause();
            _omnisharpProcess.stderr.pause();

            reallyKillIt(_omnisharpProcess.pid);
            _omnisharpProcess = null;
        }
    }

    function callService(service, data, callback) {
        data.filename = path.resolve(data.filename);

        var url = 'http://localhost:' + _port + '/' + service;

        console.info('making omnisharp request: ' + url);
        console.info(data);

        request.post(url, {
            json: data
        }, function (err, res, body) {
            console.info(body);
            if (!err && res.statusCode === 200) {
                callback(null, body);
            } else {
                callback(err);
            }
        });
    }

    function init(domainManager) {
        _domainManager = domainManager;

        if (!_domainManager.hasDomain(_domainName)) {
            _domainManager.registerDomain(_domainName, {
                major: 0,
                minor: 1
            });
        }

        _domainManager.registerCommand(
            _domainName,
            'startOmnisharp',
            startOmnisharp,
            true,
            'Starts omnisharp server',
            [{
                name: 'projectLoction',
                type: 'string',
                description: 'The root location of the project'
            }],
            []
        );

        _domainManager.registerCommand(
            _domainName,
            'stopOmnisharp',
            stopOmnisharp,
            false,
            'Stops omnisharp server',
            [],
            []
        );

        _domainManager.registerCommand(
            _domainName,
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
            _domainName,
            'omnisharpError',
            [{
                name: 'data',
                type: 'string',
                description: 'stderr output'
            }]
        );

        _domainManager.registerEvent(_domainName, 'omnisharpStarting', []);
        _domainManager.registerEvent(_domainName, 'omnisharpReady', []);
        _domainManager.registerEvent(_domainName, 'omnisharpQuit', []);
    }

    exports.init = init;
}());