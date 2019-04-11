/*
 * Project janux-persist.js
 * Created by ernesto on 4/11/19
 */

import * as md5 from "md5";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

/**
 * Password service
 */
export class PasswordService {
	private static logger = logger.getLogger("PasswordService");

	/**
	 * Validates is the password is valid.
	 * @param hash
	 * @param password
	 */
	public isValidPassword(hash: string, password: string): boolean {
		if (isBlankString(hash) || isBlankString(password)) {
			PasswordService.logger.error("Calling isValidPassword with empty values");
			return false;
		}
		return md5(password) === hash;
	}

	/**
	 * Generates a hash base on password.
	 * @param password
	 */
	public hashPassword(password: string): string {
		if (isBlankString(password)) {
			PasswordService.logger.error("Calling hashPassword with empty value");
			return "";
		}
		return md5(password);
	}
}
