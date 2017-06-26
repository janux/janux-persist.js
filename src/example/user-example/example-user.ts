/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */

import {IEntity} from "../../persistence/interfaces/entity";
/**
 * This is the entity
 */
export class ExampleUser implements IEntity {

    public id: string;
    public name: string;
    public lastName: string;
    public email: string;

    constructor(name: string, lastName: string, email: string) {
        this.name = name;
        this.lastName = lastName;
        this.email = email;
    }
}
