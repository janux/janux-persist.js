/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

/**
 * This function returns false if the value is null, or undefined, or empty, or empty after a trim.
 * @param value The string to validate.
 * @return {boolean} Return true if value is a non empty string.
 */

export function isBlankString(value: any) {
    let result: boolean = false;
    if (typeof  value !== 'string') {
        result = true;
    } else {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            result = true;
        }
    }

    return result;
}
