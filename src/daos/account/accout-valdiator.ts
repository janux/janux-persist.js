/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import * as logger from 'log4js';
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlank} from "../../util/blank-string-validator";
import {AccountEntity} from "./account-entity";

export class AccountValidator {

    public static ANOTHER_USER: string = "There is another user with the same username";
    public static PERSON_TYPE: string = "person";
    public static ORGANIZATION_TYPE: string = "organization";

    /**
     * Validate the accountEntity
     * @param accountEntity AccountEntity to be validated
     * @return {ValidationError[]} A list ov validation errors.
     */
    public static  validateAccount(accountEntity: AccountEntity): ValidationError[] {
        this._log.debug("Call to validateAccount with accountEntity: %j:", accountEntity);
        const errors: ValidationError[] = [];
        if (isBlank(accountEntity.username)) {
            errors.push(new ValidationError("username", "Username is empty", accountEntity.username));
        }
        if (isBlank(accountEntity.password)) {
            errors.push(new ValidationError("password", "Password is empty", accountEntity.password));
        }

        if (isBlank(accountEntity.contactId)) {
            errors.push(new ValidationError("contact", "Contact id is empty", ""));
        }

        this._log.debug("Errors: %j", errors);
        return errors;
    }

    public static validateResultQueryBeforeBdOperation(accounts: AccountEntity[],
                                                       objectToInsert: AccountEntity): ValidationError[] {
        this._log.debug("Call to validateResultQueryBeforeBdOperation with accounts: %j objectToInsert: %j",
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
