/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */
export class PersonName {

    public static validateSameName(person: PersonName, person2: PersonName) {
        let result: boolean = false;
        if (person.first === person2.first && person.middle === person2.middle && person.last === person2.last) {
            result = true;
        }
        return result;
    }

    public honorificPrefix: string;
    public first: string;
    public middle: string;
    public last: string;
    public honorificSuffix: string;

}
