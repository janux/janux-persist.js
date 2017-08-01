import {EntityProperties} from "../../api/dao/entity-properties";
/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */

/**
 * This class helps to define extra properties to the entity.
 * The purpose to this object is to define the extra properties that
 * are the same for each every entity.
 */
export class EntityPropertiesImpl implements EntityProperties {

    // Generates an automatic uuid string
    public identifiable: boolean;

    // Generates date for inserted record date and last modified date.
    public timeStamp: boolean;

    constructor(identifiable: boolean, timeStamp: boolean) {
        this.identifiable = identifiable;
        this.timeStamp = timeStamp;
    }
}
