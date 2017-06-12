/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */

/**
 * This is the entity
 */
export class ExampleUser {
    public name: string;
    public lastName: string;
    public email: string;

    constructor(name: string, lastName: string, email: string) {
        this.name = name;
        this.lastName = lastName;
        this.email = email;
    }
}
