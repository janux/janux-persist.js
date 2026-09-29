/**
 * Project janux-persist.js
 * Created by ernesto on 11/9/17.
 */
import Promise = require("bluebird");
import { PartyDao } from "daos/party/party-dao";
import { PartyValidator } from "daos/party/party-validator";
import { StaffDataDao } from "daos/staff-data/staff-data-dao";
import { StaffDataEntity } from "daos/staff-data/staff-data-entity";
import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import { ValidationErrorImpl } from "persistence/implementations/dao/validation-error";
import { PartyService } from "services/party/api/party-service";
import { StaffDataImpl } from "services/staff/impl/staff-data-impl";
import { DateUtil } from "utils/date/date-util";
import * as logger from "utils/logger-api/logger-api";

export class PartyServiceImpl implements PartyService {
	public static readonly PERSON: string = "PersonImpl";
	public static readonly ORGANIZATION: string = "OrganizationImpl";

	public static toJSON(party: JanuxPeople.PartyAbstract): any {
		if (party == null) return party;

		const result: any = party.toJSON();
		const id = party["id"];
		const typeName = party.typeName;
		const dateCreated = party["dateCreated"];
		const lastUpdate = party["lastUpdate"];
		result.id = id;
		result.typeName = typeName;
		result.dateCreated = dateCreated;
		result.lastUpdate = lastUpdate;
		result.staff = party["staff"];
		result.code = party.code;
		result.isReseller = party["isReseller"];
		result.isSupplier = party["isSupplier"];
		result.taxIdentificationCode = party["taxIdentificationCode"];
		result.functionsProvided = party["functionsProvided"];
		result.functionsReceived = party["functionsReceived"];
		return result;
	}

	/**
	 * Convert a object to a party instance.
	 * @param object
	 * @return {PartyAbstract}
	 */
	public static fromJSON(object: any): JanuxPeople.PartyAbstract {
		if (object == null) return object;
		const id = object.id;
		const typeName = object.typeName;
		const dateCreated = DateUtil.stringToDate(object.dateCreated);
		const lastUpdate = DateUtil.stringToDate(object.lastUpdate);
		let result: any;
		if (typeName === PartyServiceImpl.PERSON) {
			result = JanuxPeople.Person.fromJSON(object);
		} else {
			result = JanuxPeople.Organization.fromJSON(object);
		}
		result.id = id;
		result.isReseller = object.isReseller;
		result.isSupplier = object.isSupplier;
		result.dateCreated = dateCreated;
		result.code = object.code;
		result.lastUpdate = lastUpdate;
		result.functionsProvided = object.functionsProvided;
		result.functionsReceived = object.functionsReceived;
		result.taxIdentificationCode = object.taxIdentificationCode;
		result.staff = StaffDataImpl.fomJSON(object.staff);
		return result;
	}

	private _log = logger.getLogger("PartyServiceImpl");
	private partyDao: PartyDao;
	private staffDao: StaffDataDao;

	constructor(partyDao: PartyDao, staffDao: StaffDataDao) {
		this.partyDao = partyDao;
		this.staffDao = staffDao;
	}

	/**
	 * Find all record that matches with the name,
	 * @param {string} name
	 * @return {Promise}
	 */
	findByName(name: string): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding parties by name %j", name);
		return this.partyDao.findByName(name).then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	/**
	 * Find all records that has the email address.
	 * @param {string} email
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	findByEmail(email: string): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding parties by email %j", email);
		return this.partyDao.findByEmail(email).then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	/**
	 * Find all records that hast the phone number.
	 * @param {string} phone
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	findByPhone(phone: string): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding parties by phone %j", phone);
		return this.partyDao.findByPhone(phone).then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	/**
	 * Find all people
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	findPeople(): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding people");
		return this.partyDao.findPeople().then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	/**
	 * Find all organizations
	 * @return {Promise<JanuxPeople.PartyAbstract[]>}
	 */
	findOrganizations(): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding organizations");
		return this.partyDao.findOrganizations().then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	/**
	 * Find all parties who are suppliers.
	 * @param {boolean} isSupplier
	 * @return {Bluebird<PartyAbstract[]>}
	 */
	findByIsSupplier(isSupplier: boolean): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding parties by isSupplier %j", isSupplier);
		return this.partyDao.findByIsSupplierAndTypeName(isSupplier).then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	findByIdsAndFunctionsProvided(ids: string[], functionsProvided: string[]): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding parties by ids %j and functionsProvided %j", ids, functionsProvided);
		return this.partyDao
			.findByIdsAndFunctionsProvided(ids, functionsProvided)
			.then((result: JanuxPeople.PartyAbstract[]) => this.mergeStaffData(result));
	}

	/**
	 * Find all organizations who are suppliers.
	 * @param {boolean} isSupplier
	 * @return {Bluebird<Party[]>}
	 */
	findOrganizationByIsSupplier(isSupplier: boolean): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding organizations by isSupplier %j", isSupplier);
		return this.partyDao
			.findByIsSupplierAndTypeName(isSupplier, PartyValidator.ORGANIZATION)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Validate in an object has correct values. For example email regexp validation.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<ValidationError>} Return an array with the founded errors. If there is no
	 * error then the method return an empty array.
	 */
	validate(party: JanuxPeople.PartyAbstract): ValidationErrorImpl[] {
		return PartyValidator.validateParty(party);
	}

	/**
	 * Find one record.
	 * @param {string} id
	 * @return {Promise<JanuxPeople.Party>} Return the record, or a null value
	 * if there is no record given the id.
	 */
	findOne(id: string): Promise<JanuxPeople.PartyAbstract> {
		this._log.trace("finding party by id %j", id);
		return this.partyDao.findOne(id).then((result: JanuxPeople.PartyAbstract) => {
			return this.mergeStaffDataOneRecord(result);
		});
	}

	/**
	 * Find several record given the ids.
	 * @param {string[]} ids
	 * @return {Promise<JanuxPeople.Party[]>} Return the parties founded. If there are no records
	 * founded then the method returns an empty array.
	 */
	findByIds(ids: string[]): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.trace("finding parties by ids %j", ids);
		return this.partyDao.findByIds(ids).then((result: JanuxPeople.PartyAbstract[]) => {
			return this.mergeStaffData(result);
		});
	}

	/**
	 * Insert a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	insert(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		this._log.debug("inserting party %j", party);
		let insertedRecord: JanuxPeople.PartyAbstract;
		return this.partyDao.insert(party).then((result: JanuxPeople.PartyAbstract) => {
			insertedRecord = result;
			const staffEntity: StaffDataEntity = StaffDataImpl.toEntity(party["staff"], party["id"]);
			if (staffEntity) {
				return this.staffDao
					.insert(staffEntity)
					.then((result: StaffDataEntity) => {
						insertedRecord["staff"] = StaffDataImpl.fomJSON(result);
						this._log.info("inserted party -> id %j", insertedRecord["id"]);
						return Promise.resolve(insertedRecord);
					})
					.catch((err: any) => {
						this._log.warn("inserted party %j but failed to insert its staff data: %j", insertedRecord["id"], {
							message: err && err.message,
							stack: err && err.stack
						});
						throw err;
					});
			} else {
				this._log.info("inserted party -> id %j", insertedRecord["id"]);
				return Promise.resolve(insertedRecord);
			}
		});
	}

	/**
	 * Insert many records.
	 * @param {Party[]} parties
	 * @return {Bluebird<Party[]>}
	 */
	insertMany(parties: JanuxPeople.PartyAbstract[]): Promise<JanuxPeople.PartyAbstract[]> {
		this._log.debug("inserting %j parties", parties.length);
		let insertedRecords: JanuxPeople.PartyAbstract[];
		return this.partyDao
			.insertMany(parties)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				insertedRecords = result;
				// Insert the staff data.
				const staffEntities: StaffDataEntity[] = [];
				let i: number = 0;
				for (const it of result) {
					if (!_.isNil(parties[i]["staff"])) {
						const staffData: StaffDataImpl = StaffDataImpl.fomJSON(parties[i]["staff"]);
						const staffEntity: StaffDataEntity = StaffDataImpl.toEntity(staffData, it["id"]);
						staffEntities.push(staffEntity);
					}
					i++;
				}
				return this.staffDao.insertMany(staffEntities).catch((err: any) => {
					this._log.warn("inserted %j parties but failed to insert their staff data: %j", insertedRecords.length, {
						message: err && err.message,
						stack: err && err.stack
					});
					throw err;
				});
			})
			.then((result: StaffDataEntity[]) => {
				const merged = this.mapStaffData(insertedRecords, result);
				this._log.info("inserted %j parties", merged.length);
				return merged;
			});
	}

	/**
	 * Update a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	update(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		const idToUpdate: string = party["id"];
		this._log.debug("updating party %j", party);
		let updatedParty: JanuxPeople.PartyAbstract;
		return this.partyDao.update(party).then((result: JanuxPeople.PartyAbstract) => {
			updatedParty = result;
			return this.staffDao
				.removeByIdContact(idToUpdate)
				.then(() => {
					const staffEntity: StaffDataEntity = StaffDataImpl.toEntity(
						StaffDataImpl.fomJSON(party["staff"]),
						idToUpdate
					);
					if (staffEntity) {
						return this.staffDao.insert(staffEntity).then(() => {
							this._log.info("updated party -> id %j", idToUpdate);
							return Promise.resolve(party);
						});
					} else {
						this._log.info("updated party -> id %j", idToUpdate);
						return Promise.resolve(updatedParty);
					}
				})
				.catch((err: any) => {
					this._log.warn("updated party %j but failed to sync its staff data: %j", idToUpdate, {
						message: err && err.message,
						stack: err && err.stack
					});
					throw err;
				});
		});
	}

	/**
	 * Remove an object.
	 * @param {string} id The id of the object to remove.
	 * @return {Promise<>} A promise indicating the object was removed.
	 * Returns a reject if the ir no object given the id.
	 */
	remove(id: string): Promise<any> {
		// TODO: Maybe we need to validate main relations.
		this._log.debug("removing party by id %j", id);
		return this.staffDao.removeByIdContact(id).then(() => {
			return this.partyDao.removeById(id).then((result: any) => {
				this._log.info("removed party -> id %j", id);
				return result;
			});
		});
	}

	/**
	 * Remove all records.
	 * @return {Bluebird<any>}
	 */
	removeAll(): Promise<any> {
		this._log.debug("removing all parties");
		return this.staffDao.removeAll().then(() => {
			return this.partyDao.removeAll().then((result: any) => {
				this._log.info("removed all parties");
				return result;
			});
		});
	}

	/**
	 * Remove several objects.
	 * @param ids
	 * @return {Promise<any>}
	 */
	removeByIds(ids: string[]): Promise<any> {
		this._log.debug("removing %j parties by ids", ids.length);
		return this.staffDao.removeByIdContactIn(ids).then(() => {
			return this.partyDao.removeByIds(ids).then((result: any) => {
				this._log.info("removed %j parties", ids.length);
				return result;
			});
		});
	}

	private mergeStaffData(parties: JanuxPeople.PartyAbstract[]): Promise<JanuxPeople.PartyAbstract[]> {
		return this.staffDao
			.findByIdContactIn(parties.map(value => value["id"]))
			.then((staffData: StaffDataEntity[]) => {
				return Promise.resolve(this.mapStaffData(parties, staffData));
			});
	}

	private mapStaffData(
		parties: JanuxPeople.PartyAbstract[],
		staffEntities: StaffDataEntity[]
	): JanuxPeople.PartyAbstract[] {
		const groupedData = _.groupBy(staffEntities, value => value.idContact);
		parties = parties.map(party => {
			// const record = _.find(staffEntities, it => it.idContact === party["id"]);
			const staffData = groupedData[party["id"]];
			party["staff"] = staffData && staffData.length > 0 ? StaffDataImpl.fomJSON(staffData[0]) : undefined;
			return party;
		});
		return parties;
	}

	private mergeStaffDataOneRecord(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		if (party == null) return Promise.resolve(party);
		return this.staffDao.findOneByIdContact(party["id"]).then((staffEntity: StaffDataEntity) => {
			party["staff"] = StaffDataImpl.fomJSON(staffEntity);
			return Promise.resolve(party);
		});
	}
}
