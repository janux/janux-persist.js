/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import Promise = require("bluebird");
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {MongooseAdapter} from "persistence/implementations/db-adapters/mongoose-db-adapter";
import {SampleUser} from "../sample-user";
import {SampleUserDao} from "../sample-user-dao";

/**
 * this is the implementation for mongoose of SampleUserDao
 */
export class SampleUserDaoMongooseImpl extends SampleUserDao {
	public static createInstance(dbAdapter: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
		return this.instance || (this.instance = new this(dbAdapter, entityProperties));
	}

	private static instance: SampleUserDaoMongooseImpl;

	private constructor(dbEngineUtil: MongooseAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbEngineUtil, entityProperties);
	}

	/**
	 * Find all users whose name contains the name string.
	 * @param name
	 * @return {null}
	 */
	public findByNameMatch(name: string): Promise<SampleUser[]> {
		return null;
	}

	/**
	 * Validates the entity before updateMethod it. In this case checks for duplicated emails.
	 * @param objectToUpdate
	 * @return {null}
	 */
	protected validateBeforeUpdate<t>(objectToUpdate: SampleUser): Promise<any> {
		const query = {
			$and: [
				{id: {$ne: objectToUpdate[this.ID_REFERENCE]}},
				{email: {$eq: objectToUpdate.email}}
			]
		};

		return this.findByQuery(query)
			.then((result) => {
				const errors: ValidationErrorImpl[] = [];
				if (result.length > 0) {
					errors.push(new ValidationErrorImpl(
						'email',
						'There is another user with the same email',
						objectToUpdate.email));
				}
				return Promise.resolve(errors);
			});
	}
}
