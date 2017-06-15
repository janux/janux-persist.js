/**
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */
import {DisplayNameDao} from "../display-name-dao";
import {DisplayNameEntity} from "../display-name-entity";
import Promise = require("bluebird");
import {Model} from "mongoose";
import {DbEngineUtilMongodb} from "../../../persistence/impl/db-engine-util-mongodb";
import {ValidationError} from "../../../persistence/impl/validation-error";
import {IEntityProperties} from "../../../persistence/interfaces/entity-properties";
import {IValidationError} from "../../../persistence/interfaces/validation-error";
import {MongoDbUtil} from "../../../persistence/util/mongodb-util.js";

export class DisplayNameDaoMongodbImpl extends DisplayNameDao {

    private dbEngineMongo: DbEngineUtilMongodb;
    private model: Model<any>;

    constructor(dbEngineUtil: DbEngineUtilMongodb, entityProperties: IEntityProperties) {
        super(dbEngineUtil, entityProperties);
        this.dbEngineMongo = dbEngineUtil;
        this.model = dbEngineUtil.model;
    }

    protected validateBeforeUpdate<t>(objectToUpdate: DisplayNameEntity): Promise<IValidationError[]> {
        const id = 'id';
        const query = {
            $and: [
                {_id: {$ne: objectToUpdate[id]}},
                {displayName: {$eq: objectToUpdate.displayName}}
            ]
        };
        return MongoDbUtil.findAllByQuery(this.model, query)
            .then((result: DisplayNameEntity[]) => {
                const errors: ValidationError[] = [];
                if (result.length > 0) {
                    errors.push(new ValidationError(
                        "displayName",
                        "There is another record with the same name",
                        objectToUpdate.displayName));
                }
                return Promise.resolve(errors);
            });
    }

}
