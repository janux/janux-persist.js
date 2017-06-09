/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import {AbstractDataAccessObject} from "../../persistence/impl/abstract-data-access-object";
import {ValidationError} from "../../persistence/impl/validation-error";
import {IValidationError} from "../../persistence/interfaces/validation-error";
import {UserExample} from "./user-example";

export abstract class UserExampleDao extends AbstractDataAccessObject<UserExample> {

    protected validateEntity<t>(objectToValidate: UserExample): IValidationError[] {
        return null;
    }

    protected validateBeforeInsert<t>(objectToInsert: UserExample): Promise<IValidationError[]> {
        return this.findOneByAttribute("email", objectToInsert.email)
            .then((resultQuery: UserExample) => {
                const error: ValidationError[] = [];
                if (!_.isNull(resultQuery)) {
                    error.push(new ValidationError(
                        "email",
                        "There is an user with the same email address",
                        resultQuery.email));
                }
                return Promise(error);
            });
    }
}
