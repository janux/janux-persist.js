/**
 * Project janux-persistence
 * Created by ernesto on 7/26/17.
 */

import {isRunningInNode} from "../runnig-node";

/**
 * This class encapsulates the lof4js in order to be used
 * the node library or the browser library.
 */
export class LoggerFactory {

    /**
     * Ge the logger is going to be used.
     * If the code is running in a node environment. Then the method returns the
     * node log4js logger.
     * If the code is running in a browser environment. then the method return
     * a logger previously defined by the method setBrowserLogger.
     * @param {string} name
     * @return {any}
     */
    public static getLogger(name: string): any {
        let result: any;
        const logger: any = require('log4js');
        result = new logger.getLogger(name);
        // if (isRunningInNode()) {
        //    // Load log4js from node.
        //    result = logger.getLogger(name);
        // } else {
        //    // Load log4js from the browser.
        //    // http://stritti.github.io/log4js/docu/users-guide.html
        //
        // }
        return result;
    }
}
