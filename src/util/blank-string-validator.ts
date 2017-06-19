/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

/**
 * This function returns false if the value is null, or undefined, or empty, or empty after a trim.
 * @param value The string to validate.
 * @return {boolean} Return true if value is a non empty string.
 */
export function isBlank(value: string) {
    // const result: boolean = (!value || 0 === value.length);
    let result: boolean = false;
    if (!value) {
        result = true;
    } else {
        const value2 = value.trim();
        if (value2.length === 0) {
            result = true;
        }
    }
    return result;
}
