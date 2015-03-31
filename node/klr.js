/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global module, process */

(function () {
    'use strict';

    var _domainName = 'omnisharp-klr',
        _domainManager,
        _path = '/Users/mat-mcloughlin/.k/runtimes/kre-mono.1.0.0-beta3/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        _klrProcess;

    function launch(projectFile, command) {
        var args = [projectFile, command];

        _klrProcess = spawn('klr', args);

        _klrProcess.stdout.on('data', function (data) {
            _domainManager.emitEvent(_domainName, 'klrStd', data.toString());
        });

        _klrProcess.stderr.on('data', function (data) {
            _domainManager.emitEvent(_domainName, 'klrStd', data.toString());
        });
    }

    exports.init = function(domainManager) {
        _domainManager = domainManager;
        process.env['PATH'] = _path;

        if (!_domainManager.hasDomain(_domainName)) {
            _domainManager.registerDomain(_domainName, {
                major: 0,
                minor: 1
            });
        }

        _domainManager.registerCommand(
            _domainName,
            'launch',
            launch,
            true,
            'Run klr process',
            [{
                name: 'projectFile',
                type: 'string',
                description: 'Location of project.json'
            },
            {
                name: 'command',
                type: 'string',
                description: 'The command to run'
            }],
            []
        );

        _domainManager.registerEvent(
            _domainName,
            'klrStd',
            [{
                name: 'data',
                type: 'string',
                description: 'std output'
            }]
        );
    };
});
