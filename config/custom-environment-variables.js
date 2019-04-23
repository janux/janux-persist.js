/**
 * Project janux-persistence
 * Created by ernesto on 9/26/17.
 */

"use strict";
var cfg = {
	serverAppContext: {
		db: {
			//lokijs or mongoose
			dbEngine    : "DB_ENGINE",
			//Example : mongodb://localhost/janux-persistence-test
			mongoConnUrl: "MONGO_URL",
			poolSize    : "10",
			// Example ./janux-persistence-test.db
			lokiJsDBPath: "LOKIJS_PATH"
		}
	}
};

module.exports = cfg;
