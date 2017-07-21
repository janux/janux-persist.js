/**
 * Project janux-persistence
 * Created by ernesto on 7/10/17.
 */

import config = require('config');
import {DataSourceHandler} from "../../services/datasource-handler/datasource-handler";
import {UserGenerator} from "./user-generator";

const serverAppContext: any = config.get("serverAppContext");
const lokiJsDBPath = serverAppContext.db.lokiJsDBPath;
const mongoConnUrl = serverAppContext.db.mongoConnUrl;
const dbEngine = serverAppContext.db.dbEngine;
const path = dbEngine === DataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

console.log("Inserting users at " + dbEngine + " in the path/url " + path);
console.log("Users are being generated");
UserGenerator.generateUserDateInTheDatabase(dbEngine, path)
    .then(() => {
        console.log("Users generated successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.log("There was an error inserting the users.\n" + JSON.stringify(error));
        process.exit(-1);
    });
