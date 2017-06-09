import {IValidationError} from "../interfaces/validation-error";
/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

export class ValidationError implements IValidationError {
    public attribute: string;
    public message: string;
    public value: string;


    constructor(attribute: string, message: string, value: string) {
        this.attribute = attribute;
        this.message = message;
        this.value = value;
    }
}
