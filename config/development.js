/**
 * Project janux-persistence
 * Created by ernesto on 6/2/17.
 */

/*
 This config configure the server for the default environment
 */
module.exports = {
    serverAppContext: {
        db: {
            //Default db engine to use. Could be mongodb or lokijs
            dbEngine: "lokijs",
            //If mongodb is chosen. You must define the connection url.
            mongoConnUrl: "mongodb://localhost/janux-persistence-dev",
            //If lokijs is defined you must define the path of the file database.
            lokiJsDBPath: "./janux-persistence-local.db"
        }
    },
    //Log4js settings
    log4js: {
        config: {
            appenders: [
                {
                    type: "file",
                    filename: "server-dev.log",
                    layout: {
                        type: "pattern",
                        pattern: "%d | %p | %c | %m"
                    }
                },
                {
                    type: "logLevelFilter",
                    level: "DEBUG",
                    appender: {
                        type: "console",
                        layout: {
                            type: "pattern",
                            pattern: "%[%d | %p | %c |%] %m"
                        }
                    }
                }
            ],
            replaceConsole: false
        },
        globalLogLevel: "DEBUG"
    }
};
