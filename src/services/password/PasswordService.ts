/*
 * Project janux-persist.js
 * Created by ernesto on 4/11/19
 */

import * as bcrypt from "bcryptjs";
import * as md5 from "md5";
import * as logger from "utils/logger-api/logger-api";
import { isBlankString } from "utils/string/blank-string-validator";

// Unmistakably md5-shaped: 32 lowercase hex characters, nothing bcrypt ever
// produces (bcrypt hashes start with "$2a$"/"$2b$"/"$2y$"). Used to detect a
// pre-JAM-41 hash for the lazy migration below.
const MD5_HASH_PATTERN = /^[a-f0-9]{32}$/i;

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Password service.
 *
 * Hashes with bcrypt (via bcryptjs - pure JS, no native bindings, so no
 * compile/prebuilt-binary risk across the different Node versions the three
 * downstream apps run). Passwords hashed before this change are plain,
 * unsalted md5 (JAM-41) - isValidPassword() still accepts those via a lazy
 * migration shim rather than forcing a mass password reset. There is no
 * per-account salt to manage separately: bcrypt generates and stores its own
 * salt as part of the returned hash string.
 */
export class PasswordService {
	private static logger = logger.getLogger("PasswordService");

	/**
	 * Validates whether `password` matches the stored `hash`, whether that
	 * hash is the current bcrypt format or a pre-migration md5 one.
	 *
	 * Does not itself upgrade a matched legacy hash to bcrypt - it has no
	 * access to persist the change. Callers should check isLegacyHash(hash)
	 * after a successful match and, if true, call hashPassword() and save
	 * the result via whatever account-update path they already have.
	 *
	 * @param hash
	 * @param password
	 */
	public isValidPassword(hash: string, password: string): boolean {
		if (isBlankString(hash) || isBlankString(password)) {
			PasswordService.logger.error("Calling isValidPassword with empty values");
			return false;
		}
		if (bcrypt.compareSync(password, hash)) {
			return true;
		}
		return this.isLegacyHash(hash) && md5(password) === hash;
	}

	/**
	 * True if `hash` is a pre-JAM-41, unsalted md5 hash rather than the
	 * current bcrypt format. A successful isValidPassword() match against a
	 * legacy hash is the caller's cue to re-hash and persist the upgrade.
	 *
	 * @param hash
	 */
	public isLegacyHash(hash: string): boolean {
		return !isBlankString(hash) && MD5_HASH_PATTERN.test(hash);
	}

	/**
	 * Generates a bcrypt hash for `password`.
	 * @param password
	 */
	public hashPassword(password: string): string {
		if (isBlankString(password)) {
			PasswordService.logger.error("Calling hashPassword with empty value");
			return "";
		}
		return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
	}
}
