import {IEntity} from "../../persistence/interfaces/entity";
/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
export class CountryEntity implements IEntity {

    public id: string;

    /** the International Code used to place a telephone call in this Country */
    public name: string;

    public phoneCode: string;
    /** the unique two-letter ISO code identifying this Country */
    public isoCode: string;
    sortOrder: number;

    constructor(name: string, isoCode: string, phoneCode: string, sortOrder: number) {
        this.name = name;
        this.phoneCode = phoneCode;
        this.isoCode = isoCode;
        this.sortOrder = sortOrder;
    }
}
