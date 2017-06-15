import {IEntityProperties} from "../interfaces/entity-properties";
/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
export class EntityProperties implements IEntityProperties {

    public identifiable: boolean;
    public timeStamp: boolean;

    constructor(identifiable: boolean, timeStamp: boolean) {
        this.identifiable = identifiable;
        this.timeStamp = timeStamp;
    }
}
