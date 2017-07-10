/**
 * Project janux-persistence
 * Created by ernesto on 7/7/17.
 */

import * as logger from 'log4js';
import {Util} from "./ciruclar-util";

export class CircularReferenceDetector {
    static detectCircularReferences(toBeStringifiedValue: any, serializationKeyStack: string[] = []) {
        Object.keys(toBeStringifiedValue).forEach((key) => {
            const value = toBeStringifiedValue[key];

            const serializationKeyStackWithNewKey = serializationKeyStack.slice();
            serializationKeyStackWithNewKey.push(key);
            try {
                JSON.stringify(value);
                this.Logger.debug(`path "${Util.joinStrings(serializationKeyStack)}" is ok`);
            } catch (error) {
                this.Logger.debug(`path "${Util.joinStrings(serializationKeyStack)}" JSON.stringify results in error: ${error}`);

                let isCircularValue: boolean;
                let circularExcludingStringifyResult: string = "";
                try {
                    circularExcludingStringifyResult = JSON.stringify(value, CircularReferenceDetector.replaceRootStringifyReplacer(value), 2);
                    isCircularValue = true;
                } catch (error) {
                    this.Logger.debug(`path "${Util.joinStrings(serializationKeyStack)}" is not the circular source`);
                    CircularReferenceDetector.detectCircularReferences(value, serializationKeyStackWithNewKey);
                    isCircularValue = false;
                }
                if (isCircularValue) {
                    throw new Error(`Circular reference detected:\nCircularly referenced value is value under path "${Util.joinStrings(serializationKeyStackWithNewKey)}" of the given root object\n` +
                        `Calling stringify on this value but replacing itself with [Circular object --- fix me] ( <-- search for this string) results in:\n${circularExcludingStringifyResult}\n`);
                }
            }
        });
    }

    private static Logger = logger.getLogger("CircularReferenceDetector");

    private static replaceRootStringifyReplacer(toBeStringifiedValue: any): any {
        let serializedObjectCounter = 0;

        return (key: any, value: any) => {
            if (serializedObjectCounter !== 0 && typeof(toBeStringifiedValue) === 'object' && toBeStringifiedValue === value) {
                this.Logger.error(`object serialization with key ${key} has circular reference to being stringified object`);
                return '[Circular object --- fix me]';
            }
            serializedObjectCounter++;
            return value;
        };
    }
}
