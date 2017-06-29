/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import * as logger from 'log4js';
import {AccountRoleEntity} from "../../daos/account-role/account-role-entity";
import {AccountEntity} from "../../daos/account/account-entity";
import {AccountValidator} from "../../daos/account/accout-valdiator";
import {IPartyEntity} from "../../daos/party/iParty-entity";
import {OrganizationEntity} from "../../daos/party/organization/organization-entity";
import {PartyValidator} from "../../daos/party/party-validator";
import {PersonEntity} from "../../daos/party/person/person-entity";
import {Persistence} from "../../daos/persistence";
import {RoleEntity} from "../../daos/role/role-entity";
import {ValidationError} from "../../persistence/impl/validation-error";
import {isBlankString} from "../../util/blank-string-validator";

export class AccountService {

    public static PARTY = "party";
    public static NO_CONTACT_IN_DATABASE = "There is no contact in the database with this id";
    public static ACCOUNT = "account";
    public static ANOTHER_ACCOUNT_USING_CONTACT = "There is another account using this contact";
    public static ACCOUNT_NOT_IN_DATABASE = "The account with this id does not exist in the database";
    public static PARTY_TYPE = "party.type";
    public static ROLE = "role";
    public static ROLE_ID_DOES_NOT_EXIST = "Some role ids does not exits in the database";

    public static findOneByUserName(username: string): Promise<any> {
        this._log.debug("Call to findOneByUserName with username %j", username);
        let result: any = {};
        return Persistence.accountDao.findOneByUserName(username)
            .then((account: any) => {
                if (_.isNull(account)) {
                    return Promise.resolve(account);
                }
                result = account;
                return Persistence.accountRoleDao.findAllByAccountId(account.id);
            })
            .then((accountRoles: AccountRoleEntity[]) => {
                const idRoles = accountRoles.map((value) => value.idRole);
                return Persistence.roleDao.findAllByIds(idRoles);
            })
            .then((resultRoles: RoleEntity[]) => {
                result.roles = resultRoles;
                if (isBlankString(result.contactId) === false) {
                    return Persistence.partyDao.findOneById(result.contactId);
                } else {
                    return Promise.resolve(result);
                }
            })
            .then((resultQueryPartyDao: IPartyEntity) => {
                result.contact = resultQueryPartyDao;
                return Promise.resolve(result);
            });
    }

    /**
     * Update the account data. Just update the account info and the associated roles.
     * One difference with insert is the update will not update the contact data.
     * Instead one must use partyDao.update().
     * @param object The account to be updated.
     */
    public static update(object: any): Promise<any> {
        this._log.debug("Call to update with object:%j", object);
        let result: any;
        const account: AccountEntity = new AccountEntity();
        let rolesToUpdate: RoleEntity[];
        // Find the account. This also helps to retrieve the contactId.
        return Persistence.accountDao.findOneById(object.id)
            .then((resultQuery) => {
                if (resultQuery === null) {
                    return Promise.reject([
                        new ValidationError(this.ACCOUNT, this.ACCOUNT_NOT_IN_DATABASE, object.id)
                    ]);
                } else {
                    account.enabled = object.enabled;
                    account.username = object.username;
                    account.password = object.password;
                    account.expirePassword = object.expirePassword;
                    account.expire = object.expire;
                    account.locked = object.locked;
                    account.id = object.id;
                    account.contactId = resultQuery.contactId;
                    return this.validateRoles(object.roles);
                }

            })
            .then((roles: RoleEntity[]) => {
                rolesToUpdate = roles;
                return Persistence.accountDao.update(account);
            })
            .then((updatedAccount: AccountEntity) => {
                result = updatedAccount;
                return Persistence.accountRoleDao.deleteAllByIdAccount(updatedAccount.id);
            })
            .then(() => {
                // Insert the new roles.
                const accountRolesToInsert: AccountRoleEntity[] = [];
                for (const obj of rolesToUpdate) {
                    const accountRole: AccountRoleEntity = new AccountRoleEntity();
                    accountRole.idAccount = account.id;
                    accountRole.idRole = obj.id;
                    accountRolesToInsert.push(accountRole);
                }
                return Persistence.accountRoleDao.insertMany(accountRolesToInsert);
            })
            .then((insertedRecords: AccountRoleEntity[]) => {
                result.roles = insertedRecords;
                return Promise.resolve(result);
            });
    }

    /**
     * Insert a new user.
     * @param object The account info to insert.
     * object must have contact info.
     * If the contact info has an id. The system assumes
     * the account is going to be used by an existing party record.
     * If the contact info doesn't hav an id. The the system
     * assumes is going to insert a new party record.
     */
    public static insert(object: any): Promise<any> {
        this._log.debug("Call to insert with object %j", object);
        let associatedParty: IPartyEntity;
        let associatedRoles: RoleEntity[];
        let result: any;
        const account: AccountEntity = new AccountEntity();
        account.enabled = object.enabled;
        account.username = object.username;
        account.password = object.password;
        account.expirePassword = object.expirePassword;
        account.expire = object.expire;
        account.locked = object.locked;

        // Validate account
        const errors = AccountValidator.validateAccountExceptContactId(account);
        if (errors.length > 0) {
            return Promise.reject(errors);
        }

        return this.definePartyInfo(object.contact)
            .then((party: IPartyEntity) => {
                associatedParty = party;
                return this.validateRoles(object.roles);
            })
            .then((roles: RoleEntity[]) => {
                associatedRoles = roles;
                account.contactId = associatedParty.id;
                // Insert the account.
                return Persistence.accountDao.insert(account);
            })
            .then((insertedAccount: AccountEntity) => {
                result = insertedAccount;
                // Associate the party with the account
                associatedParty.idAccount = insertedAccount.id;
                return Persistence.partyDao.update(associatedParty);
            }).then((updatedParty: IPartyEntity) => {
                associatedParty = updatedParty;
                // Insert the roles.
                const rolesToInsert: AccountRoleEntity[] = associatedRoles.map((value) => {
                    const accountRoleEntity: AccountRoleEntity = new AccountRoleEntity();
                    accountRoleEntity.idRole = value.id;
                    accountRoleEntity.idAccount = updatedParty.idAccount;
                    return accountRoleEntity;
                });
                return Persistence.accountRoleDao.insertMany(rolesToInsert);
            })
            .then((insertedAccountRoles: AccountRoleEntity[]) => {
                // Associate the party to the account
                result.roles = associatedRoles;
                result.contact = associatedParty;
                this._log.debug("Returning %j", result);
                return Promise.resolve(result);
            });
    }

    private static _log = logger.getLogger("AccountService");

    /**
     * Validate the contact info before inserting the account.
     * @param party The party to validate.
     * @return {any}
     */
    private static definePartyInfo(party: any): Promise<IPartyEntity | ValidationError[]> {
        this._log.debug("Call to define party  info with party: %j", party);
        let person: PersonEntity;
        let organization: OrganizationEntity;
        // Check for an id
        if (isBlankString(party.id) === true) {
            // No id. Check port party type before inserting a new party.
            if (_.isString(party.type) && party.type === PartyValidator.PERSON) {
                // It's a person
                person = new PersonEntity();
                person.name.first = party.name.first;
                person.name.last = party.name.last;
                person.name.middle = party.name.middle;
                person.type = PartyValidator.PERSON;
                person.contact = party.contact;
                // Insert the person.
                this._log.debug("Inserting the person %j", person);
                return Persistence.partyDao.insert(person);
            } else if (_.isString(party.type) && party.type === PartyValidator.ORGANIZATION) {
                // Itś an organization
                organization = new OrganizationEntity();
                organization.name = party.name;
                organization.type = PartyValidator.ORGANIZATION;
                organization.contact = party.contact;
                // Insert the organization.
                this._log.debug("Inserting the organization %j", organization);
                return Persistence.partyDao.insert(organization);
            } else {
                this._log.warn("No correct party type, returning a reject");
                // No party type, sending an error.
                return Promise.reject([
                    new ValidationError(this.PARTY_TYPE, PartyValidator.TYPE_NOT_PERSON_OR_ORGANIZATION, "")
                ]);
            }

        } else {
            this._log.debug("The account to insert has a contact id");
            let referenceObject: IPartyEntity;
            // Look for if there is a party with the same id
            return Persistence.partyDao.findOneById(party.id)
                .then((resultQueryParty: IPartyEntity) => {
                    if (_.isNull(resultQueryParty)) {
                        this._log.warn("The id %j does not exist in the database", party.id);
                        return Promise.reject([
                            new ValidationError(this.PARTY, this.NO_CONTACT_IN_DATABASE, party.id)
                        ]);
                    } else if (isBlankString(resultQueryParty.idAccount) === false) {
                        this._log.warn("The contact founded has an associated account");
                        return Promise.reject([
                            new ValidationError(this.ACCOUNT, this.ANOTHER_ACCOUNT_USING_CONTACT, "")
                        ]);
                    } else {
                        referenceObject = resultQueryParty;
                        // Check if there is another account using this contact info.
                        return Persistence.accountDao.findOneByContactId(resultQueryParty.id);
                    }
                })
                .then((resultQueryAccount: AccountRoleEntity) => {
                    if (_.isNull(resultQueryAccount)) {
                        this._log.debug("Returning %j", resultQueryAccount);
                        return Promise.resolve(referenceObject);
                    } else {
                        this._log.warn("The contact founded has an associated account");
                        return Promise.reject([
                            new ValidationError(this.ACCOUNT, this.ANOTHER_ACCOUNT_USING_CONTACT, "")
                        ]);
                    }
                });
        }
    }

    private static  validateRoles(roles: any[]): Promise<ValidationError[] | RoleEntity[]> {
        this._log.debug("Call to validateRoles with roles: %j", roles);
        // Check if roles is an array.
        if (_.isArray(roles) === false) {
            this._log.warn("Roles is not an array");
            return Promise.reject([
                new ValidationError("roles", "Roles must be an array", "")
            ]);
        }
        let ids: string[] = roles.map((value) => value.id);
        ids = _.uniq(ids);

        return Persistence.roleDao.findAllByIds(ids)
            .then((roles: RoleEntity[]) => {
                if (roles.length === ids.length) {
                    return Promise.resolve(roles);
                } else {
                    this._log.warn("Someone is trying to associate id roles to an account with invalid ids");
                    const invalidIDs: string[] = _.xor(ids, roles.map((value) => value.id));
                    return Promise.reject([
                        new ValidationError(this.ROLE, this.ROLE_ID_DOES_NOT_EXIST, _.join(invalidIDs, ","))
                    ]);
                }
            });
    }
}
