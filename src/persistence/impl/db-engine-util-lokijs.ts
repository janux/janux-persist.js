/**
 * Project janux-persistence
 * Created by ernesto on 6/12/17.
 */
import * as logger from 'log4js';
import {IDbEngineUtil} from "../interfaces/db-engine-util-method";
import {LokiJsUtil} from "../util/lokijs-util";
import Promise = require("bluebird");

/**
 * Generic implementation ob lokijs db functions
 * When calling this method. Make sure params has the
 * correct db property and the correct collection property
 */
export class DbEngineUtilLokijs implements IDbEngineUtil {

    public collection: any;
    public db: any;
    private _log = logger.getLogger("DbEngineUtilLokijs");

    constructor(collectionName: string, db: any) {
        this.collection = db.addCollection(collectionName);
        this.db = db;
    }

    public findOneById(id): Promise<any> {
        this._log.debug("Call to findOneById with id: %j", id);
        return LokiJsUtil.findOneById(this.collection, id);
    }

    public findAllByIds(arrayOfIds: any[]): Promise<any> {
        this._log.debug("Call to findAllByIds with arrayOfIds: %j", arrayOfIds);
        return LokiJsUtil.findAllByIds(this.collection, arrayOfIds);
    }

    public remove(objectToDelete: any): Promise<any> {
        this._log.debug("Call to remove with objectToDelete: %j", objectToDelete);
        return LokiJsUtil.remove(this.db, this.collection, objectToDelete);
    }

    public count(): Promise<number> {
        this._log.debug("Call to count.");
        return LokiJsUtil.count(this.collection);
    }

    public deleteAll(): Promise<any> {
        this._log.debug("Call to deleteAll.");
        return LokiJsUtil.deleteAll(this.db, this.collection);
    }

    public findOneByAttribute(attributeName: string, value): Promise<any> {
        this._log.debug("Call to findOneByAttribute with attributeName: %j, value: %j", attributeName, value);
        return LokiJsUtil.findOneByAttribute(this.collection, attributeName, value);
    }

    public findAllByAttribute(attributeName: string, value): Promise<any[]> {
        this._log.debug("Call to findAllByAttribute with attributeName: %j, value: %j", attributeName, value);
        return LokiJsUtil.findAllByAttribute(this.collection, attributeName, value);
    }

    public findAllByAttributeNameIn(attributeName: string, values: any[]): Promise<any> {
        this._log.debug("Call to findAllByAttributeNameIn with attributeName: %j, values: %j", attributeName, values);
        return LokiJsUtil.findAllByAttributeNameIn(this.collection, attributeName, values);
    }

    public insertMethod(objectToInsert: any): Promise<any> {
        this._log.debug("Call to insertMethod with objectToInsert: %j", objectToInsert);
        return LokiJsUtil.insert(this.db, this.collection, objectToInsert);
    }

    public updateMethod(objectToUpdate: any): Promise<any> {
        this._log.debug("Call to updateMethod with objectToUpdate: %j", objectToUpdate);
        return LokiJsUtil.update(this.db, this.collection, objectToUpdate);
    }

    public insertManyMethod(objectsToInsert: any[]): Promise<any> {
        this._log.debug("Call to insertManyMethod with objectsToInsert: %j", objectsToInsert);
        return LokiJsUtil.insertMany(this.db, this.collection, objectsToInsert);
    }

    findAll(): Promise<any[]> {
        this._log.debug("Call to findAll");
        return LokiJsUtil.findAllByQuery(this.collection,{});
    }
}
