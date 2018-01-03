/**
 * Project janux-persist.js
 * Created by ernesto on 1/3/18.
 */
import {BigDecimalDao} from "example/big-decimal/big-decimal-dao";
import {BigDecimalEntity} from "example/big-decimal/big-decimal-entity";
import * as _ from "lodash";
import {BigDecimalUtil} from "utils/big-decimal/big-decimal-util";

/**
 * This is an example to save a big decimal using mongodb.
 * Given mongodb and lokijs stores big numbers in different ways. We need to implement different daos per db engine.
 * Mongo db version 3.4 and later has a decimal128 data type. With this type
 * any developer can store large numbers with little o no precision loss.
 *
 * We convert the values to big.js number give this library provide math operations
 * to big numbers.
 */
export class BigDecimalDaoMongoose extends BigDecimalDao {

	protected convertBeforeSave(object: BigDecimalEntity): any {
		const result: any = _.clone(object);
		result.value = BigDecimalUtil.toBigDecimal128(object.value);
		return result;
	}

	protected convertAfterDbOperation(object: any): BigDecimalEntity {
		const result: any = _.clone(object);
		result.value = BigDecimalUtil.fromBigDecimal128(object.value);
		return result;
	}
}
