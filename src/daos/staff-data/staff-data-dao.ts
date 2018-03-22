/**
 * Project janux-persist.js
 * Created by ernesto on 3/20/18
 */
import * as Promise from "bluebird";
import {StaffDataEntity} from "daos/staff-data/staff-data-entity";
import {StaffDataEntityValidator} from "daos/staff-data/staff-data-entity-validator";
import * as _ from "lodash";
import {DbAdapter} from "persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from 'utils/logger-api/logger-api';

export class StaffDataDao extends AbstractDataAccessObjectWithAdapter<StaffDataEntity, string> {

	private log = logger.getLogger("StaffDataDao");

	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	public findOneByIdContact(idContact: string): Promise<StaffDataEntity> {
		this.log.debug("Call to findOneByIdContact by idContact: %j", idContact);
		return this.findOneByAttribute("idContact", idContact);
	}

	public findByIdContactIn(idContacts: string[]): Promise<StaffDataEntity[]> {
		return this.findByAttributeNameIn("idContact", idContacts);
	}

	public removeByIdContact(idContact: string): Promise<any> {
		return this.findOneByIdContact(idContact)
			.then((result: StaffDataEntity) => {
				if (!_.isNil(result)) {
					return Promise.resolve(this.removeById(result.id));
				}
				return Promise.resolve(null);
			});
	}

	public removeByIdContactIn(idContacts: string[]): Promise<any> {
		return this.findByIdContactIn(idContacts)
			.then((result: StaffDataEntity[]) => {
				return this.removeByIds(result.map(value => value.id));
			});
	}

	protected validateEntity(objectToValidate: StaffDataEntity): ValidationErrorImpl[] {
		return StaffDataEntityValidator.validate(objectToValidate);
	}

	protected validateBeforeInsert(objectToInsert: StaffDataEntity): Promise<ValidationErrorImpl[]> {
		// Validate for a duplicated record given the same idContact.

		return this.findOneByIdContact(objectToInsert.idContact)
			.then((result: StaffDataEntity) => {
				const errors: ValidationErrorImpl[] = [];
				if (result != null) {
					errors.push(new ValidationErrorImpl(StaffDataEntityValidator.ID_CONTACT, StaffDataEntityValidator.ID_CONTACT_DUPLICATED, objectToInsert.idContact));
				}
				return Promise.resolve(errors);
			});
	}

	protected validateBeforeUpdate(objectToUpdate: StaffDataEntity): Promise<ValidationErrorImpl[]> {
		// Validate for changed idContact.
		const query = {
			$and: [
				{id: {$ne: objectToUpdate.id}},
				{idContact: {$eq: objectToUpdate.idContact}},
			]
		};
		return this.findByQuery(query)
			.then((result: StaffDataEntity[]) => {
				const errors: ValidationErrorImpl[] = [];
				if (result.length > 0) {
					errors.push(new ValidationErrorImpl(StaffDataEntityValidator.ID_CONTACT, StaffDataEntityValidator.ID_CONTACT_DUPLICATED, objectToUpdate.idContact));
				}
				return Promise.resolve(errors);
			});
	}
}
