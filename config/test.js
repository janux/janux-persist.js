/**
 * Project janux-persistence
 * Created by ernesto on 6/2/17.
 */

/*
 This config configure the server for the test environment
 */
module.exports = {
    serverAppContext: {
        db: {
            dbEngine: "lokijs",
            mongoConnUrl: "mongodb://localhost/janux-persistence-test",
            lokiJsDBPath: "./janux-persistence-test.db"
        }
    },
    log4js: {
        config: {
            appenders: [
                {
                    type: "file",
                    filename: "server-test.log",
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
