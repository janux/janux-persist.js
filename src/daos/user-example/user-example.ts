import {IEntity} from "../../persistence/interfaces/entity";
/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */
export class UserExample implements IEntity {
    public id: string;
    public uuid: string;
    public name: string;
    public email: string;
}
