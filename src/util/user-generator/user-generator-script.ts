/**
 * Project janux-persistence
 * Created by ernesto on 7/10/17.
 */
import config = require('config');
import {BootstrapService} from "../../services/bootstrap/bootstrap-service";
import {UserGenerator} from "./user-generator";
import Bluebird = require("bluebird");
const serverAppContext = config.get("serverAppContext");
const lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
const mongoConnUrl = serverAppContext.db.mongoConnUrl;
const dbEngine = serverAppContext.db.dbEngine;
const dbParams = dbEngine === BootstrapService.LOKIJS ? lokiJsDBPath : mongoConnUrl;
BootstrapService.start(dbEngine, dbParams)
    .then(() => {
        console.log("Inserting users at " + dbEngine + " in the path/url " + dbParams);
        console.log("Users are being generated");
        return UserGenerator.generateUserDateInTheDatabase();
    })
    .then(() => {
        console.log("Users generated successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.log("There was an error inserting the users.\n" + JSON.stringify(error));
        process.exit(-1);
    });
