/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
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
