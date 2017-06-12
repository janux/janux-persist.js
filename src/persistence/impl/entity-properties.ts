import {IEntityProperties} from "../interfaces/entity-properties";
/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
export class EntityProperties implements IEntityProperties {

    public versionable: boolean;
    public timeStamp: boolean;

    constructor(versionable: boolean, timeStamp: boolean) {
        this.versionable = versionable;
        this.timeStamp = timeStamp;
    }
}
