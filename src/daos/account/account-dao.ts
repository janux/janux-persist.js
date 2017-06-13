/**
 * Project janux-persistence
 * Created by ernesto on 6/13/17.
 */

import {DataAccessObjectWithEngine} from "../../persistence/impl/data-access-object-with-engine";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import Promise = require("bluebird");
import {Account} from "./account";

export class AccountDao extends DataAccessObjectWithEngine<Account> {
    protected validateEntity<t>(objectToValidate: t): IValidationError[] {
        throw new Error("Method not implemented.");
    }

    protected validateBeforeInsert<t>(objectToInsert: t): Promise<IValidationError[]> {
        throw new Error("Method not implemented.");
    }

    protected validateBeforeUpdate<t>(objectToUpdate: t): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
