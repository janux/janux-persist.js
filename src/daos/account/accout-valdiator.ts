/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */
import * as _ from 'lodash';
import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {Account} from "./account";
export class AccountValidator {

    public static readonly ANOTHER_USER: string = "There is another user with the same username";

    /**
     * Validate the account
     * @param account Account to be validated
     * @return {ValidationError[]} A list ov validation errors.
     */
    public static  validateAccount(account: Account): ValidationError[] {
        this._log.debug("Call to validateAccount with account: %j:", account);
        const errors: ValidationError[] = [];
        if (_.isEmpty(account.username)) {
            errors.push(new ValidationError("username", "Username is empty", account.username));
        }
        if (_.isEmpty(account.password)) {
            errors.push(new ValidationError("password", "Password is empty", account.password));
        }
        // TODO: validate contact info
        this._log.debug("Errors: %j", errors);
        return errors;
    }

    public static validateBeforeInsertQueryResult(accounts: Account[], objectToInsert: Account): ValidationError[] {
        this._log.debug("Call to validateBeforeInsertQueryResult with accounts: %j objectToInsert: %j",
            accounts, objectToInsert);
        const errors: ValidationError[] = [];
        if (accounts.length > 0) {
            errors.push(
                new ValidationError(
                    "username",
                    this.ANOTHER_USER,
                    objectToInsert.username));
        }
        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = logger.getLogger("AccountValidator");
}
