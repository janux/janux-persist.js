/**
 * Project janux-persist.js
 * Created by ernesto on 3/20/18
 */
import * as Promise from "bluebird";
import {StaffEntity} from "daos/staff/staff-entity";
import {StaffEntityValidator} from "daos/staff/staff-entity-validator";
import * as _ from "lodash";
import {DbAdapter} from "persistence/api/db-adapters/db-adapter";
import {AbstractDataAccessObjectWithAdapter} from "persistence/implementations/dao/abstract-data-access-object-with-adapter";
import {EntityPropertiesImpl} from "persistence/implementations/dao/entity-properties";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import * as logger from 'utils/logger-api/logger-api';

export class StaffDao extends AbstractDataAccessObjectWithAdapter<StaffEntity, string> {

	private log = logger.getLogger("StaffDao");

	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(dbAdapter, entityProperties);
	}

	public findOneByIdContact(idContact: string): Promise<StaffEntity> {
		this.log.debug("Call to findOneByIdContact by idContact: %j", idContact);
		return this.findOneByAttribute("idContact", idContact);
	}

	public findByIdContactIn(idContacts: string[]): Promise<StaffEntity[]> {
		return this.findByAttributeNameIn("idContact", idContacts);
	}

	public removeByIdContact(idContact: string): Promise<any> {
		return this.findOneByIdContact(idContact)
			.then((result: StaffEntity) => {
				if (!_.isNil(result)) {
					return Promise.resolve(this.removeById(result.id));
				}
				return Promise.resolve(null);
			});
	}

	public removeByIdContactIn(idContacts: string[]): Promise<any> {
		return this.findByIdContactIn(idContacts)
			.then((result: StaffEntity[]) => {
				return this.removeByIds(result.map(value => value.id));
			});
	}

	protected validateEntity(objectToValidate: StaffEntity): ValidationErrorImpl[] {
		return StaffEntityValidator.validate(objectToValidate);
	}

	protected validateBeforeInsert(objectToInsert: StaffEntity): Promise<ValidationErrorImpl[]> {
		// Validate for a duplicated record given the same idContact.

		return this.findOneByIdContact(objectToInsert.idContact)
			.then((result: StaffEntity) => {
				const errors: ValidationErrorImpl[] = [];
				if (result != null) {
					errors.push(new ValidationErrorImpl(StaffEntityValidator.ID_CONTACT, StaffEntityValidator.ID_CONTACT_DUPLICATED, objectToInsert.idContact));
				}
				return Promise.resolve(errors);
			});
	}

	protected validateBeforeUpdate(objectToUpdate: StaffEntity): Promise<ValidationErrorImpl[]> {
		// Validate for changed idContact.
		const query = {
			$and: [
				{id: {$ne: objectToUpdate.id}},
				{idContact: {$eq: objectToUpdate.idContact}},
			]
		};
		return this.findByQuery(query)
			.then((result: StaffEntity[]) => {
				const errors: ValidationErrorImpl[] = [];
				if (result.length > 0) {
					errors.push(new ValidationErrorImpl(StaffEntityValidator.ID_CONTACT, StaffEntityValidator.ID_CONTACT_DUPLICATED, objectToUpdate.idContact));
				}
				return Promise.resolve(errors);
			});
	}
}
