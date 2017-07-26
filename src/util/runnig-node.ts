/**
 * Project janux-persistence
 * Created by ernesto on 7/26/17.
 */

/**
 * Return true if the code is running in a node
 * environment, false if the code is running in a
 * browser environment.
 * @return {boolean}
 */
export function isRunningInNode(): boolean {
    let isNode = false;
    if (typeof process === 'object') {
        if (typeof process.versions === 'object') {
            if (typeof process.versions.node !== 'undefined') {
                isNode = true;
            }
        }
    }
    return isNode;
}
