/*
 * Project janux-persist.js
 * Created by ernesto on 4/11/19
 */

import * as Bluebird from "bluebird";
import * as md5 from "md5";
import {isBlankString} from "utils/string/blank-string-validator";

/**
 * Password service
 */
export class PasswordService {
	/**
	 * Validates is the password is valid.
	 * @param hash
	 * @param password
	 */
	public async isValidPassword(hash: string, password: string): Bluebird<boolean> {
		if (isBlankString(hash) || isBlankString(password)) {
			return Bluebird.reject("Calling isValidPassword with empty values");
		}
		return md5(password) === hash;
	}

	/**
	 * Generates a hash base on password.
	 * @param password
	 */
	public async hashPassword(password: string): Bluebird<string> {
		if (isBlankString(password)) {
			return Bluebird.reject("Calling hashPassword with empty values");
		}
		return md5(password);
	}
}
