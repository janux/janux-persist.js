/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
import {IContactMethod} from "../contact-method";
export class PhoneNumber implements IContactMethod {
    public type: string;
    public primary: boolean;
    public countryCode: string;
    public areaCode: string;
    public number: string;
    public extension: string;

    constructor(type: string, primary: boolean, number: string, extension: string, areaCode: string, countryCode: string) {
        this.type = type;
        this.primary = primary;
        this.countryCode = countryCode;
        this.areaCode = areaCode;
        this.number = number;
        this.extension = extension;
    }
}
