/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

/**
 * This function returns false if the value is null, or undefined, or empty, or empty after a trim.
 * @param value The string to validate.
 * @return {boolean} Return true if value is a non empty string.
 */

import * as _ from "lodash";

export function isBlankString(value: any) {
    let result: boolean = false;
    if (_.isString(value) === false) {
        result = true;
    } else {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            result = true;
        }
    }

    return result;
}
