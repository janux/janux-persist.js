/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
export class StateProvinceEntity {

    public name: string;

    public code: string;

    // Id of the country
    public idCountry: string;

    public sortOrder: number;

    constructor(name: string, code: string, idCountry: string, sortOrder: number) {
        this.idCountry = idCountry;
        this.name = name;
        this.code = code;
        this.sortOrder = sortOrder;
    }
}
