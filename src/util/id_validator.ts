/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import * as _ from "lodash";
import {isBlankString} from "./blank-string-validator";
export function isValidId(value: any): boolean {
    let result = true;

    if (_.isNull(value)) {
        result = false;
    } else if (_.isUndefined(value)) {
        result = false;
    } else if (_.isNumber(value) && value <= 0) {
        result = false;
    } else if (_.isString(value) && isBlankString(value)) {
        result = false;
    }
    return result;
}
