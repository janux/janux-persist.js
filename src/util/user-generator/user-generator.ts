/**
 * Project janux-persistence
 * Created by ernesto on 7/10/17.
 */
import * as logger from 'log4js';
import JanuxPeople = require('janux-people.js');
import md5 = require('MD5');
import Promise = require("bluebird");
import {PartyValidator} from "../../daos/party/party-validator";
import {UserService} from "../../services/user/user-service";

export class UserGenerator {

    public static generateUserDateInTheDatabase(): Promise<any> {
        this._log.debug("Call to generateUserDateInTheDatabase");
        const usersToInsert = this.generateUserFakeData();
        return Promise.map(usersToInsert, (element) => {
            return UserService.insert(element);
        })
            .then((insertedUsers: any[]) => {
                return Promise.resolve(insertedUsers);
            });
    }

    private static _log = logger.getLogger("UserGenerator");

    private static  generateUserFakeData(): any[] {
        this._log.debug("Call to generateUserFakeData");
        const UsersGenerator: any = JanuxPeople.UsersGenerator;
        const usersGen = new UsersGenerator();
        // Generate some fake users
        const fakeUsers = usersGen.generateUsers(3);

        // Generate known users
        let users: any[] = [
            {
                username: 'widget',
                password: md5('test1'),
                roles: ["WIDGET_DESIGNER"]
            },
            {
                username: 'manager',
                password: md5('test2'),
                roles: ["MANAGER"]
            },
            {
                username: 'admin',
                password: md5('1234567'),
                roles: ["ADMIN"]
            }
        ];

        users.forEach((user, iUser) => {
            users[iUser] = usersGen.generateUser(user);
        });

        // Put together
        users = users.concat(fakeUsers);
        for (const user of users) {
            user.contact.typeName = PartyValidator.PERSON;
        }
        this._log.debug("Returning %j", users);
        return users;
    }
}