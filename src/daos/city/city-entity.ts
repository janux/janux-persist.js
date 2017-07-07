/**
 * Project janux-persistence
 * Created by ernesto on 6/21/17.
 */

export class CityEntity {
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
