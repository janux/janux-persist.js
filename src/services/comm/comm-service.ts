/**
 * Project janux-persistence
 * Created by hielo on 2018-08-08.
 */

import * as Promise from "bluebird";
import * as _ from 'lodash';
import MailTime    = require('mail-time');
import * as nodemailer from "nodemailer";
import {DataSource} from "services/datasource-handler/datasource";
import {DataSourceHandler} from "services/datasource-handler/datasource-handler";
import * as logger from 'utils/logger-api/logger-api';

export class CommService {
	public static createInstance(commDataSource: any, smtp: any) {
		return this._instance || (this._instance = new this(commDataSource, smtp));
	}

	private static _instance: CommService;
	public events = {
		EMAIL_SUCCESS_SENT_EVENT: 'emailSuccessSent'
	};
	private _log = logger.getLogger("CommService");
	private listeners: object = {};
	private dbEngine: string;
	private dbPath: string;
	private dataSource: DataSource;
	private transports: any[] = [];
	private mailQueue: any;

	private constructor(commDataSource, smtp) {
		// Initialize listeners array
		Object.keys(this.events).map((key) => {
			this.listeners[key] = [];
		});
		// this.dbEngine = dbEngine;
		// this.dbPath = dbPath;
		this.dataSource = this.getDataSource(commDataSource.dbEngine, commDataSource.dbPath);

		// Google Apps SMTP
		this.transports.push(nodemailer.createTransport({
			host: smtp.host,
			from: smtp.user,
			auth: {
				user: smtp.auth.user,
				pass: smtp.auth.pass
			},
		}));

		this.mailQueue = new MailTime({
			db: this.dataSource.dbConnection, // MongoDB
			type: 'server',
			strategy: 'balancer', // Transports will be used in round robin chain
			transports: this.transports,
			from(transport) {
				// To pass spam-filters `from` field should be correctly set
				// for each transport, check `transport` object for more options
				return '"Awesome App" <' + transport._options.from + '>';
			},
			concatEmails: true, // Concatenate emails to the same addressee
			concatDelimiter: '<h1>{{{subject}}}</h1>', // Start each concatenated email with it's own subject
			template: MailTime.Template // Use default template
		});
	}

	/**
	 * Adds a callback that will listen for especified event
	 * @param {string} eventName The name of the event to subscribe.
	 * @param callbackToAdd The callback to add as listener
	 * @return {Promise<any>} A promise indicating the operation is executed successfully.
	 */
	public on(eventName: string, callbackToAdd: any) {
		this._log.debug("Call to register event with event name: %j", eventName);

		if (_.isNil(this.listeners[eventName])) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(callbackToAdd);
	}

	/**
	 * Removes a callback that listening
	 * @param {string} eventName The name of the event to unsubscribe
	 * @param callBackToRemove The callback to remove as event listener
	 */
	public off(eventName: string, callbackToRemove: any) {
		if (this.listeners[eventName]) {
			this.listeners[eventName] = this.listeners[eventName].filter((callback) => {
				return callback !== callbackToRemove;
			});
		}
	}

	/**
	 *
	 * @param {string} eventName
	 * @param value
	 */
	public fire(eventName: string, value: any) {
		if (this.listeners[eventName]) {
			this.listeners[eventName].forEach((callback) => {
				callback(value);
			});
		}
	}

	/**
	 * @param params
	 */
	public sendEmail(params: any) {
		this._log.debug("Call to sendEmail with params: %j", params);

		// Send email
		this.mailQueue.sendMail({
			to: params.to,
			subject: params.subject,
			text: params.text,
			html: params.html
		});

		this.fire(this.events.EMAIL_SUCCESS_SENT_EVENT, params);
	}

	/**
	 * Validates the input and, if the values are valid, returns a connection ready to be used.
	 * @param dbEngine
	 * @param {string} path
	 * @return {Promise<DataSource>}
	 */
	private getDataSource(dbEngine: any, path: string): DataSource {
		this._log.debug("Call to getDataSource with dbEngine: %j path: %j", dbEngine, path);
		const dataSource: DataSource = DataSourceHandler.getDataSource(dbEngine, path, undefined);
		// Connect to the database.
		return dataSource.connect();
	}
}
