/**
 * Project janux-persistence
 * Created by ernesto on 6/20/17.
 */

import {PartyDao} from "./party/party-dao";
import {AccountDao} from "./user/account-dao";

export class Persistence {
    public static userDao: AccountDao;
    public static partyDao: PartyDao;
}
