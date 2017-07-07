/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
export class StateProvinceEntity {
    public id: string;
    public name: string;
    public code: string;

    // Iso country id of the sate.
    public countryIsoCode: string;

    public sortOrder: number;

    constructor(name: string, code: string, countryIsoCode: string, sortOrder: number) {
        this.countryIsoCode = countryIsoCode;
        this.name = name;
        this.code = code;
        this.sortOrder = sortOrder;
    }
}
