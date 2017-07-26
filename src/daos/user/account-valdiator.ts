/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";
import {LoggerFactory} from "../../util/log4js/log4js_factory";
import {AccountEntity} from "./account-entity";

/**
 * Class that contains the validation methods for the userEntity.
 */
export class AccountValidator {

    public static ANOTHER_USER: string = "There is another account with the same username";
    public static ANOTHER_CONTACT: string = "There is another account with the same contactId";

    /**
     * Validate the accountEntity
     * @param accountEntity AccountEntity to be validated
     * @return {ValidationError[]} A list of validation errors.
     */
    public static  validateAccount(accountEntity: AccountEntity): ValidationError[] {
        this._log.debug("Call to validateAccount with accountEntity: %j:", accountEntity);
        let errors: ValidationError[] = [];
        errors = errors.concat(this.validateAccountExceptContactId(accountEntity));
        if (isBlankString(accountEntity.contactId)) {
            errors.push(new ValidationError("contact", "Contact id is empty", ""));
        }
        this._log.debug("Errors: %j", errors);
        return errors;
    }

    /**
     * Same as validateAccount, but this method doesn't validate if the "contactId" attribute is empty.
     * @param accountEntity
     * @return {ValidationError[]} A list of validation errors.
     */
    public static validateAccountExceptContactId(accountEntity: AccountEntity): ValidationError[] {
        this._log.debug("Call to validateAccountExceptContactId with accountEntity: %j:", accountEntity);
        const errors: ValidationError[] = [];
        if (isBlankString(accountEntity.username)) {
            errors.push(new ValidationError("username", "Username is empty", accountEntity.username));
        }
        if (isBlankString(accountEntity.password)) {
            errors.push(new ValidationError("password", "Password is empty", accountEntity.password));
        }

        this._log.debug("Errors: %j", errors);
        return errors;
    }

    /**
     * Validate the cause of the duplicated record. Could be a duplicated username or a duplicated
     * contactId.
     * @param accounts
     * @param reference
     * @return {ValidationError[]}
     */
    public static validateResultQueryBeforeBdOperation(accounts: AccountEntity[],
                                                       reference: AccountEntity): ValidationError[] {
        this._log.debug("Call to validateResultQueryBeforeBdOperation with accounts: %j reference: %j",
            accounts, reference);
        const errors: ValidationError[] = [];
        if (accounts.length > 0) {
            if (accounts[0].username === reference.username) {
                errors.push(
                    new ValidationError(
                        "username",
                        this.ANOTHER_USER,
                        reference.username));
            } else {
                errors.push(
                    new ValidationError(
                        "contactId",
                        this.ANOTHER_CONTACT,
                        reference.username));
            }
        }
        this._log.debug("Returning %j", errors);
        return errors;
    }

    private static _log = LoggerFactory.getLogger("AccountValidator");
}
