/**
 * Project glarus-services
 * Created by ernesto on 1/3/18.
 */

import * as BigDecimal from "big.js";

export class BigDecimalEntity {
	id: string;
	name: string;
	// In this case. the value is defined using big.js.
	// Although the way this value is stored in a database is different per db engine.
	value: BigDecimal.Big;
}
