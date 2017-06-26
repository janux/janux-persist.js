/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

import {IEntity} from "../../persistence/interfaces/entity";

export class CityEntity implements IEntity {
    public id: string;
    public name: string;
    public code: string;
    public idStateProvince: string;

    constructor(name: string, code: string, idStateProvince: string) {
        this.name = name;
        this.code = code;
        this.idStateProvince = idStateProvince;
    }
}
