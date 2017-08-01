/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */

import * as logger from 'log4js';
import uuid = require("uuid");
import {EntityPropertiesImpl} from "../implementations/dao/entity-properties";

/**
 * Generates a uuid to the object before insert it.
 */
export class UuidGenerator {

    public static UUID_PROPERTY = "uuid";

    /**
     * Inserts a uuid attribute with a unique value only if entityProperties has the identifiable as true.
     * @param entityProperties
     * @param objectToInsert
     */
    public static assignUuid(entityProperties: EntityPropertiesImpl, objectToInsert: any) {
        this._log.debug("Call to assignUuid with entityProperties: %j, objectToInsert %j:",
            entityProperties,
            objectToInsert);
        if (entityProperties != null && entityProperties.identifiable === true) {
            this._log.debug("Inserting %j", this.UUID_PROPERTY);
            objectToInsert[this.UUID_PROPERTY] = uuid.v4();
        } else {
            this._log.debug("Not inserting uuid");
        }
    }

    private static _log = logger.getLogger("UuidGenerator");
}
