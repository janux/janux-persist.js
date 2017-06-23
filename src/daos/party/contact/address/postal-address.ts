/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {IContactMethod} from "../contact-method";

export class PostalAddress implements IContactMethod {
    type: string;
    primary: boolean;

    public line1: string;
    public line2: string;
    public line3: string;
    public postalCode: string;

    // City data, if one is filled, the other is undefined
    public cityText: string;
    public idCity: string;

    // State province data, if one is filled, the other is undefined
    public stateText: string;
    public idStateProvince: string;

    // Iso country code
    public isoCountryCode: string;

    constructor(type: string, primary: boolean, line1: string, line2: string, line3: string, cityText: string, idCity: string, postalCode: string, stateText: string, idStateProvince: string, isoCountryCode: string) {
        this.type = type;
        this.primary = primary;
        this.line1 = line1;
        this.line2 = line2;
        this.line3 = line3;
        this.postalCode = postalCode;
        this.cityText = cityText;
        this.idCity = idCity;
        this.stateText = stateText;
        this.idStateProvince = idStateProvince;
        this.isoCountryCode = isoCountryCode;
    }
}
