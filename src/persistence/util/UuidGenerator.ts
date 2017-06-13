/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */

import * as logger from 'log4js';
import uuid = require("uuid");
import {IEntityProperties} from "../interfaces/entity-properties";

export class UuidGenerator {

    public static assignUuid(entityProperties: IEntityProperties, objectToInsert: any) {
        this._log.debug("Call to assignUuid with entityProperties: %j, objectToInsert %j:",
            entityProperties,
            objectToInsert);
        if (entityProperties != null && entityProperties.versionable === true) {
            this._log.debug("Inserting %j", this.UUID_PROPERTY);
            objectToInsert[this.UUID_PROPERTY] = uuid.v4();
        } else {
            this._log.debug("Not inserting uuid");
        }
    }

    private static UUID_PROPERTY = "uuid";
    private static _log = logger.getLogger("UuidGenerator");
}
