var Url = require('url');
var ChildProcess = require('child_process');

module.exports = new function() {
    this.createDatabaseFrom = function(databaseConfiguration) {
        var databaseConfigurationArray =
            dbConfArr = this.parseConfig(databaseConfiguration);

        switch(dbConfArr.options.dialect) {

            default:

                var argumentsArray =
                    argArr =    [ '-h' + dbConfArr.options.host ];

                if(dbConfArr.username) {
                    argArr.push('-u' + dbConfArr.username);
                }

                if(dbConfArr.password) {
                    argArr.push('-p' + dbConfArr.password);
                }

                if(dbConfArr.options.port) {
                    dbConfArr.push('-P' + dbConfArr.options.port);
                }

                var createDatabaseString =
                    cds = 'CREATE DATABASE IF NOT EXIST ' + dbConfArr.database;

                /*
                var addUserString =
                    aus = 'GRANT ALL ON `' + dbConfArr.database +
                        '`.* to \'' + dbConfArr.username +
                        '\'@\'' + dbConfArr.options.host +
                        '\' IDENTIFIED BY \'' + dbConfArr.password +
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
        var databaseConfigurationArray =
        dbConfArr = {
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

                    dbConfArr.options.dialect   = pu.protocol;
                    dbConfArr.options.host      = pu.hostname;
                    dbConfArr.options.port      = pu.port;
                    dbConfArr.database          = pu.pathname.split('/')[1];
                    dbConfArr.username          = (pu.auth[0] ? pu.auth[0] : null);
                    dbConfArr.password          = (pu.auth[1] ? pu.auth[1] : null);

                    //TODO: Check configuration values!
                    return databaseConfigurationArray;
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
