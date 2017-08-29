/**
 * Project
 * Created by ernesto on 8/29/17.
 */
import {GroupServiceImpl} from "../group-module/impl/group-service";

export class AuthcContextDisplayGroupService {
    private groupService: GroupServiceImpl<string>;

    constructor(groupService: GroupServiceImpl<string>) {
        this.groupService = groupService;
    }

}
