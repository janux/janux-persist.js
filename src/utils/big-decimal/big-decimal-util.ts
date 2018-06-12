/**
 * Project janux-persist.js
 * Created by ernesto on 1/3/18.
 */

import * as  BigDecimal from 'big.js';
import * as _ from "lodash";
import * as mongodb from 'mongodb';

/**
 * Util to convert big.js numbers to mongodb big decimal.
 */
export class BigDecimalUtil {

	/**
	 * Convert a mongodb Decimal128 to a big.js number representation.
	 * @param {Decimal128} value
	 * @return {Big}
	 */
	public static fromBigDecimal128(value: mongodb.Decimal128): BigDecimal.Big {
		if (value == null) return undefined;
		return BigDecimal.Big(value.toString());
	}

	/**
	 * Convert a big.js number to a Decimal128 mongodb representation.
	 * @param {Big} value
	 * @param precision If defined correctly, then the value returned has only a fixed number of decimals.
	 * @return {Decimal128}
	 */
	public static toBigDecimal128(value: BigDecimal.Big, precision?: number): mongodb.Decimal128 {
		if (value == null) return undefined;
		if (precision != null && _.isInteger(precision) && precision > 0) {
			return mongodb.Decimal128.fromString(value.toFixed(precision));
		} else {
			return mongodb.Decimal128.fromString(value.toString());
		}

	}

	/**
	 * Convert a floating point number to a big.js number representation.
	 * @param {number} value
	 * @return {Big}
	 */
	public static fromNumber(value: number): BigDecimal.Big {
		if (value == null) return undefined;
		return BigDecimal.Big(value);
	}

	/**
	 * Convert a big.js number to a floating point number.
	 * Note: This conversion might cause precision loss.
	 * @param {Big} value
	 * @param precision If defined correctly, then the value returned has only a fixed number of decimals.
	 * @return {number}
	 */
	public static toNumber(value: BigDecimal.Big, precision?: number): number {
		if (value == null) return undefined;
		if (precision != null && _.isInteger(precision) && precision > 0) {
			return Number(value.toFixed(precision));
		} else {
			return Number(value.toString());
		}

	}
}
