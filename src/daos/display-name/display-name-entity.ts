/**
 * Project janux-persistence
 * Created by ernesto on 6/14/17.
 */

import {IEntity} from "../../persistence/interfaces/entity";

export class DisplayNameEntity implements IEntity {
    public id: string;
    public displayName: string;
}
