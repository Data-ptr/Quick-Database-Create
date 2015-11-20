var Url = require('url');
var ChildProcess = require('child_process');

module.exports = new function() {
    this.createDatabaseFrom = function(databaseConfiguration) {
        var databaseConfigurationStructure =
            dbConfStruct = this.parseConfig(databaseConfiguration);

        switch(dbConfStruct.options.dialect) {

            default:

                var argumentsArray =
                    argArr =    [ '-h' + dbConfStruct.options.host ];

                if(dbConfStruct.username) {
                    argArr.push('-u' + dbConfStruct.username);
                }

                if(dbConfStruct.password) {
                    argArr.push('-p' + dbConfStruct.password);
                }

                if(dbConfStruct.options.port) {
                    argArr.push('-P' + dbConfStruct.options.port);
                }

                var createDatabaseString =
                    cds = 'CREATE DATABASE IF NOT EXISTS `' +
                        dbConfStruct.database + '`;';

                /*
                var addUserString =
                    aus = 'GRANT ALL ON `' + dbConfStruct.database +
                        '`.* to \'' + dbConfStruct.username +
                        '\'@\'' + dbConfStruct.options.host +
                        '\' IDENTIFIED BY \'' + dbConfStruct.password +
                        '\';';
                */

                // Call out to local mysql client
                ChildProcess.execFileSync(  'mysql',
                                            argArr,
                                            {
                                                input: cds
                                            });
            break;

        };
    };

    this.parseConfig = function(databaseConfiguration) {
        var databaseConfigurationStructure =
        dbConfStruct = {
            options: {
                //Valid: 'mysql'|'mariadb'|'sqlite'|'postgres'|'mssql'
                dialect: undefined,
                host: undefined,
                port: undefined
            },
            database: undefined,
            username: null,
            password: null
        };

        // Build configuration by parsing connection string
        if(databaseConfiguration.use_env_variable) {
            var environmentVariable =
            envVar = process.env[databaseConfiguration.use_env_variable];

            if(envVar) {
                var parsedUrl =
                    pu = Url.parse(envVar);

                    // Seperate user and password
                    pu.auth = pu.auth.split(':');

                    dbConfStruct.options.dialect   = pu.protocol;
                    dbConfStruct.options.host      = pu.hostname;
                    dbConfStruct.options.port      = pu.port;
                    dbConfStruct.database          = pu.pathname.split('/')[1];
                    dbConfStruct.username          = (pu.auth[0] ? pu.auth[0] : null);
                    dbConfStruct.password          = (pu.auth[1] ? pu.auth[1] : null);

                    //TODO: Check configuration values!
                    return databaseConfigurationStructure;
            }
            else {
                console.error('Environment variable "' +
                    databaseConfiguration.use_env_variable + '" is not set');
            }
        }
        else {
            //TODO: Check configuration values!
            return databaseConfiguration;
        }
    };
};
