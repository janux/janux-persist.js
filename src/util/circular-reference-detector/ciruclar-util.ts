/**
 * Project janux-persistence
 * Created by ernesto on 7/7/17.
 */
export class Util {

    static joinStrings(arr: string[], separator: string = ":") {
        if (arr.length === 0) return "";
        return arr.reduce((v1, v2) => `${v1}${separator}${v2}`);
    }
}
