/**
 * Project
 * Created by ernesto on 8/25/17.
 */
import {GroupProperties} from "../api/group-properties";

export class GroupPropertiesImpl implements GroupProperties {
    name: string;
    description: string;
    attributes: { [p: string]: string } = {};
    code: string;
}
