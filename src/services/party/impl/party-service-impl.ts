/**
 * Project janux-persist.js
 * Created by ernesto on 11/9/17.
 */
import Promise = require("bluebird");
import {PartyDao} from "daos/party/party-dao";
import {PartyValidator} from "daos/party/party-validator";
import {StaffDataDao} from "daos/staff-data/staff-data-dao";
import {StaffDataEntity} from "daos/staff-data/staff-data-entity";
import JanuxPeople = require("janux-people");
import * as _ from "lodash";
import {ValidationErrorImpl} from "persistence/implementations/dao/validation-error";
import {PartyService} from "services/party/api/party-service";
import {StaffDataImpl} from "services/staff/impl/staff-data-impl";
import {DateUtil} from "utils/date/date-util";

export class PartyServiceImpl implements PartyService {

	public static readonly PERSON: string = "PersonImpl";
	public static readonly ORGANIZATION: string = "OrganizationImpl";

	public static toJSON(party: JanuxPeople.PartyAbstract): any {
		if (party == null) return party;

		const result: any = party.toJSON();
		const id = party['id'];
		const typeName = party.typeName;
		const dateCreated = party['dateCreated'];
		const lastUpdate = party['lastUpdate'];
		result.id = id;
		result.typeName = typeName;
		result.dateCreated = dateCreated;
		result.lastUpdate = lastUpdate;
		result.staff = party['staff'];
		result.isReseller = party['isReseller'];
		result.isSupplier = party['isSupplier'];
		result.functionsProvided = party['functionsProvided'];
		result.functionsReceived = party['functionsReceived'];
		return result;
	}

	/**
	 * Convert a object to a party instance.
	 * @param object
	 * @return {Party}
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
		result.lastUpdate = lastUpdate;
		result.functionsProvided = object.functionsProvided;
		result.functionsReceived = object.functionsReceived;
		result.staff = StaffDataImpl.fomJSON(object.staff);
		return result;
	}

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
		return this.partyDao.findByName(name)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Find all records that has the email address.
	 * @param {string} email
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findByEmail(email: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByEmail(email)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Find all records that hast the phone number.
	 * @param {string} phone
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findByPhone(phone: string): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByPhone(phone)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Find all people
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findPeople(): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findPeople()
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Find all organizations
	 * @return {Promise<JanuxPeople.Party[]>}
	 */
	findOrganizations(): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findOrganizations()
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Find all parties who are suppliers.
	 * @param {boolean} isSupplier
	 * @return {Bluebird<Party[]>}
	 */
	findByIsSupplier(isSupplier: boolean): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByIsSupplierAndTypeName(isSupplier)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				return this.mergeStaffData(result);
			});
	}

	/**
	 * Find all organizations who are suppliers.
	 * @param {boolean} isSupplier
	 * @return {Bluebird<Party[]>}
	 */
	findOrganizationByIsSupplier(isSupplier: boolean): Promise<JanuxPeople.PartyAbstract[]> {
		return this.partyDao.findByIsSupplierAndTypeName(isSupplier, PartyValidator.ORGANIZATION)
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
		return this.partyDao.findOne(id)
			.then((result: JanuxPeople.PartyAbstract) => {
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
		return this.partyDao.findByIds(ids)
			.then((result: JanuxPeople.PartyAbstract[]) => {
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
		let insertedRecord: JanuxPeople.PartyAbstract;
		return this.partyDao.insert(party)
			.then((result: JanuxPeople.PartyAbstract) => {
				insertedRecord = result;
				const staffEntity: StaffDataEntity = StaffDataImpl.toEntity(party['staff'], party['id']);
				if (staffEntity) {
					return this.staffDao.insert(staffEntity)
						.then((result: StaffDataEntity) => {
							insertedRecord['staff'] = StaffDataImpl.fomJSON(result);
							return Promise.resolve(insertedRecord);
						});
				} else {
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
		let insertedRecords: JanuxPeople.PartyAbstract[];
		return this.partyDao.insertMany(parties)
			.then((result: JanuxPeople.PartyAbstract[]) => {
				insertedRecords = result;
				// Insert the staff data.
				const staffEntities: StaffDataEntity[] = [];
				let i: number = 0;
				for (const it of result) {
					if (!_.isNil(parties[i]['staff'])) {
						const staffData: StaffDataImpl = StaffDataImpl.fomJSON(parties[i]['staff']);
						const staffEntity: StaffDataEntity = StaffDataImpl.toEntity(staffData, it['id']);
						staffEntities.push(staffEntity);
					}
					i++;
				}
				return this.staffDao.insertMany(staffEntities);
			})
			.then((result: StaffDataEntity[]) => {
				return this.mapStaffData(insertedRecords, result);
			});
	}

	/**
	 * Update a record.
	 * @param {JanuxPeople.Party} party
	 * @return {Promise<JanuxPeople.Party[]>} Return and instance with the id.
	 * Returns a reject if there are validation errors.
	 */
	update(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		const idToUpdate: string = party['id'];
		let updatedParty: JanuxPeople.PartyAbstract;
		return this.partyDao.update(party)
			.then((result: JanuxPeople.PartyAbstract) => {
				updatedParty = result;
				return this.staffDao.removeByIdContact(idToUpdate);
			})
			.then(() => {
				const staffEntity: StaffDataEntity = StaffDataImpl.toEntity(StaffDataImpl.fomJSON(party['staff']), idToUpdate);
				if (staffEntity) {
					return this.staffDao.insert(staffEntity).then(() => {
						return Promise.resolve(party);
					});
				} else {
					return Promise.resolve(updatedParty);
				}
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
		return this.staffDao.removeByIdContact(id)
			.then(() => {
				return this.partyDao.removeById(id);
			});

	}

	/**
	 * Remove all records.
	 * @return {Bluebird<any>}
	 */
	removeAll(): Promise<any> {
		return this.staffDao.removeAll()
			.then(() => {
				return this.partyDao.removeAll();
			});
	}

	/**
	 * Remove several objects.
	 * @param ids
	 * @return {Promise<any>}
	 */
	removeByIds(ids: string[]): Promise<any> {
		return this.staffDao.removeByIdContactIn(ids)
			.then(() => {
				return this.partyDao.removeByIds(ids);
			});
	}

	private mergeStaffData(parties: JanuxPeople.PartyAbstract[]): Promise<JanuxPeople.PartyAbstract[]> {
		return this.staffDao.findByIdContactIn(parties.map(value => value['id']))
			.then((staffData: StaffDataEntity[]) => {
				return Promise.resolve(this.mapStaffData(parties, staffData));
			});
	}

	private mapStaffData(parties: JanuxPeople.PartyAbstract[], staffEntities: StaffDataEntity[]): JanuxPeople.PartyAbstract[] {
		parties = parties.map(party => {
			const record = _.find(staffEntities, it => it.idContact === party['id']);
			party['staff'] = StaffDataImpl.fomJSON(record);
			return party;
		});
		return parties;
	}

	private mergeStaffDataOneRecord(party: JanuxPeople.PartyAbstract): Promise<JanuxPeople.PartyAbstract> {
		if (party == null) return Promise.resolve(party);
		return this.staffDao.findOneByIdContact(party['id'])
			.then((staffEntity: StaffDataEntity) => {
				party['staff'] = StaffDataImpl.fomJSON(staffEntity);
				return Promise.resolve(party);
			});
	}
}
