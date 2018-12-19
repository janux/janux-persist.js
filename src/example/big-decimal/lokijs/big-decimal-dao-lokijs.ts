/**
 * Project janux-persist.js
 * Created by ernesto on 1/3/18.
 */
import { BigDecimalDao } from "example/big-decimal/big-decimal-dao";
import { BigDecimalEntity } from "example/big-decimal/big-decimal-entity";
import * as _ from "lodash";
import { BigDecimalUtil } from "utils/big-decimal/big-decimal-util";

/**
 * This in an example of a big decimal dao using lokijs.
 * Given mongodb and lokijs stores big numbers in different ways. We need to implement different daos per db engine.
 * In this case, we convert the big.js number to a floating point number.
 * Any developer must be aware that this conversion might lead to precision loss.
 * In this db, this is necessary if we want to store the data in lokijs and make aggregation functions, like average.
 * Another alternative is to store the value in string format, with this we can keep precision, but we cant do
 * aggregation functions.
 */
export class BigDecimalDaoLokijs extends BigDecimalDao {
	protected convertBeforeSave(object: BigDecimalEntity): any {
		const result: any = _.clone(object);
		result.value = BigDecimalUtil.toNumber(object.value);
		return result;
	}

	protected convertAfterDbOperation(object: any): BigDecimalEntity {
		const result: any = _.clone(object);
		result.value = BigDecimalUtil.fromNumber(object.value);
		return result;
	}
}
