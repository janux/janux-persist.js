/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

import * as _ from 'lodash';
import * as logger from "../../../util/logger-api/logger-api";
import {DbAdapter} from "../../api/db-adapters/db-adapter";
import {AbstractDataAccessObject} from "./abstract-data-access-object";
import {EntityPropertiesImpl} from "./entity-properties";

/**
 * This class, inside their properties, contains an object implementing the interface DbAdapter where you can do
 * db operations.
 * The purpose of this class is to encapsulate the db calls inside an object. And that object re-use ti
 * in different dao implementations.
 */
export abstract class AbstractDataAccessObjectWithAdapter<t, ID> extends AbstractDataAccessObject<t, ID> {

	// This class holds all common db engine methods
	protected dbAdapter: DbAdapter;
	protected adapterProperties: any;

	private readonly _logger = logger.getLogger("AbstractDataAccessObjectWithAdapter");

	/**
	 * Constructor
	 * @param {DbAdapter} dbAdapter This contains an implementation of CrudRepository.
	 * The idea is there are CrudRepository implementations per engine. In order to
	 * remove duplicated code per each db implementation.
	 * @param {EntityPropertiesImpl} entityProperties
	 */
	constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
		super(entityProperties);
		this._logger.debug("Calling constructor");

		this.adapterProperties = dbAdapter.adapterProperties;

		// Injecting the db adapter methods to the dao instance.
		for (const property in dbAdapter) {
			if (_.isFunction(dbAdapter[property])) {
				this[property] = dbAdapter[property];
			}
		}

		// this.insertManyMethod = this.dbAdapter.insertManyMethod;
		// this.findAllMethod = this.dbAdapter.findAllMethod;
		// this.findOneMethod = this.dbAdapter.findOneMethod;
		// this.findByIdsMethod = this.dbAdapter.findByIdsMethod;
		// this.findByAttributeMethod = this.dbAdapter.findByAttributeMethod;
		// this.findOneByAttributeMethod = this.dbAdapter.findOneByAttributeMethod;
		// this.findByAttributeNameInMethod = this.dbAdapter.findByAttributeNameInMethod;
		// this.findByAttributesAndOperatorMethod = this.dbAdapter.findByAttributesAndOperatorMethod;
		// this.findByAttributesOrOperatorMethod = this.dbAdapter.findByAttributesOrOperatorMethod;
		// this.updateMethod = this.dbAdapter.updateMethod;
		// this.insertMethod = this.dbAdapter.insertMethod;
		// this.findByQueryMethod = this.dbAdapter.findByQueryMethod;
		// this.remove = this.dbAdapter.remove;
		// this.removeById = this.dbAdapter.removeById;
		// this.count = this.dbAdapter.count;
		// this.removeAll = this.dbAdapter.removeAll;
		// this.removeByIds = this.dbAdapter.removeByIds;
	}
}
