/**
 * Project glarus-services
 * Created by ernesto on 12/6/17.
 */

import * as _ from 'lodash';
import * as moment from 'moment';
import * as logger from "utils/logger-api/logger-api";
import {isBlankString} from "utils/string/blank-string-validator";

export class DateUtil {

	static logger = logger.getLogger("TimeEntryServiceImpl");

	/**
	 * Converts a string to a Date.
	 * @param {string} object The string to  convert.
	 * @return {Date} Returns undefined if the object is null or undefined or a blank string, otherwise returns a date object.
	 * Returns the same object if this one is a date.
	 * The method throws an error if moment.js can't interpret the string.
	 */
	public static stringToDate(object: any): Date {
		this.logger.debug("Call to stringToDate with object %j", object);

		if (_.isNil(object)) return undefined;

		if (_.isDate(object)) return object;

		if (isBlankString(object)) return undefined;

		const date = moment(object);
		if (date.isValid()) {
			return date.toDate();
		} else {
			this.logger.error("Invalid date parsing with value %j " + object);
			// Let it crash.
			// TODO: Find a better way to handle errors.
			throw new Error("Invalid date parsing with");
		}

	}
}
