/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as _ from "lodash";
import * as logger from 'log4js';
import {IEntityProperties} from "../interfaces/entity-properties";
export class TimeStampGenerator {

    public static generateTimeStampForInsert(entityProperties: IEntityProperties, objectToInsert: any) {
        this._log.debug("generateTimeStampForInsert with entityProperties: %j, objectToInsert:%j"
            , entityProperties,
            objectToInsert);
        // If the object has an AUTO_TIME_STAMP_PROPERTY, let's add the
        // current date.
        if (!_.isNull(entityProperties) && entityProperties.timeStamp === true) {
            this._log.debug("Inserting %j", this.DATE_CREATED_PROPERTY);
            objectToInsert[this.DATE_CREATED_PROPERTY] = new Date();
        } else {
            this._log.debug("Not inserting %j", this.DATE_CREATED_PROPERTY);
        }
    }

    public static generateTimeStampForUpdate(entityProperties: IEntityProperties, objectToUpdate: any) {
        this._log.debug("generateTimeStampForUpdate with entityProperties: %j, objectToUpdate %j",
            entityProperties,
            objectToUpdate);
        if (!_.isNull(entityProperties) && entityProperties.timeStamp === true) {
            this._log.debug("Inserting %j", this.AUTO_TIME_STAMP_PROPERTY);
            objectToUpdate[this.DATE_UPDATED_PROPERTY] = new Date();
        } else {
            this._log.debug("Not inserting %j", this.AUTO_TIME_STAMP_PROPERTY);
        }
    }

    private static _log = logger.getLogger("TimeStampGenerator");
    private static AUTO_TIME_STAMP_PROPERTY: string = "autoTimestamp";
    private static DATE_CREATED_PROPERTY: string = "dateCreated";
    private static DATE_UPDATED_PROPERTY: string = "dateUpdated";
}
