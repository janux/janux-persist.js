/*
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as logger from 'log4js';
import {EntityPropertiesImpl} from "../implementations/dao/entity-properties";

/**
 * This class generates the timestamp values and insert the values inside the object.
 */
export class TimeStampGenerator {

    public static DATE_UPDATED_PROPERTY: string = "lastUpdate";
    public static DATE_CREATED_PROPERTY: string = "dateCreated";

    /**
     * Generate a dateCreated attribute and store it in the object.
     * @param entityProperties This object indicates if this method needs to add the dateCreated attribute.
     * @param objectToInsert The object to insert in the database.
     */
    public static generateTimeStampForInsert(entityProperties: EntityPropertiesImpl, objectToInsert: any) {
        this._log.debug("generateTimeStampForInsert with entityProperties: %j, objectToInsert:%j"
            , entityProperties,
            objectToInsert);
        // If the object has an AUTO_TIME_STAMP_PROPERTY, let's add the
        // current date.
        if (entityProperties != null && entityProperties.timeStamp === true) {
            this._log.debug("Inserting %j", this.DATE_CREATED_PROPERTY);
            objectToInsert[this.DATE_CREATED_PROPERTY] = new Date();
        } else {
            this._log.debug("Not inserting %j", this.DATE_CREATED_PROPERTY);
        }
    }

    /**
     * Generate a lastUpdate attribute and store it in the object.
     * @param entityProperties This object indicates if this method needs to add the lastUpdate attribute.
     * @param objectToUpdate The object to update in the database.
     */
    public static generateTimeStampForUpdate(entityProperties: EntityPropertiesImpl, objectToUpdate: any) {
        this._log.debug("generateTimeStampForUpdate with entityProperties: %j, objectToUpdate %j",
            entityProperties,
            objectToUpdate);
        if (entityProperties != null && entityProperties.timeStamp === true) {
            this._log.debug("Inserting %j", this.DATE_UPDATED_PROPERTY);
            objectToUpdate[this.DATE_UPDATED_PROPERTY] = new Date();
        } else {
            this._log.debug("Not inserting %j", this.DATE_UPDATED_PROPERTY);
        }
    }

    private static _log = logger.getLogger("TimeStampGenerator");
}
