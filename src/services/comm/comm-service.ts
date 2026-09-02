/**
 * Project janux-persistence
 * Created by hielo on 2018-08-08.
 */

import * as Promise from "bluebird";
import * as _ from "lodash";
import MailTime = require("mail-time");
import * as nodemailer from "nodemailer";
import { DataSource } from "services/datasource-handler/datasource";
import { DataSourceHandler } from "services/datasource-handler/datasource-handler";
import * as logger from "utils/logger-api/logger-api";

export class CommService {
	public static createInstance(commDataSource: any, smtp: any) {
		return this._instance || (this._instance = new this(commDataSource, smtp));
	}

	private static _instance: CommService;
	public events = {
		EMAIL_SUCCESS_SENT_EVENT: "emailSuccessSent",
		EMAIL_SENT_ERROR_EVENT: "emailSentError"
	};
	private _log = logger.getLogger("CommService");
	private listeners: object = {};
	private dataSource: DataSource;
	private transports: any[] = [];
	private transport: any;
	private mailQueue: any;
	private smtp: any;

	private constructor(commDataSource, smtp) {
		// Initialize listeners array
		Object.keys(this.events).map(key => {
			this.listeners[key] = [];
		});
		this.smtp = smtp;
		this.dataSource = this.getDataSource(commDataSource.dbEngine, commDataSource.dbPath);

		// SMTP
		this.transports.push(
			nodemailer.createTransport({
				host: smtp.host,
				from: smtp.from,
				port: smtp.port,
				auth: {
					user: smtp.auth.user,
					pass: smtp.auth.pass
				}
			})
		);

		// this.transport = nodemailer.createTransport({
		// 	host: smtp.host,
		// 	from: smtp.from,
		// 	port: smtp.port,
		// 	auth: {
		// 		user: smtp.auth.user,
		// 		pass: smtp.auth.pass
		// 	}
		// });

		this.mailQueue = new MailTime({
			db: this.dataSource.dbConnection, // MongoDB
			type: "server",
			strategy: "balancer", // Transports will be used in round robin chain
			transports: this.transports,
			from(transport) {
				// To pass spam-filters `from` field should be correctly set
				// for each transport, check `transport` object for more options
				return '"Glarus App" <' + transport._options.from + ">";
			},
			// Concatenation is off deliberately. It batches messages sharing a
			// recipient into one email, which suits digests and actively harms
			// the transactional mail this service carries:
			//
			//   - It delays *every* send. `concatThrottling` defaults to 60s
			//     and is the window in which a second message may arrive to be
			//     merged, so each message waits that long before its first
			//     attempt even when nothing ever merges.
			//   - It loses the caller's callback. A message merged into an
			//     existing unsent document returns before the callback is
			//     registered, so that send reports neither success nor failure.
			//   - It rewrites the subject. Once a document holds more than one
			//     message the subject is replaced by `concatSubject`, which is
			//     unset here and so falls back to "Multiple notifications",
			//     with the individual bodies concatenated beneath it.
			//
			// With it off, each message is its own queue document: independently
			// retried, with a live callback, and sent under its own subject.
			concatEmails: false
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
			this.listeners[eventName] = this.listeners[eventName].filter(callback => {
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
			this.listeners[eventName].forEach(callback => {
				callback(value);
			});
		}
	}

	/**
	 * @param params
	 */
	public sendEmail(params: any) {
		this._log.debug("Call to sendEmail with params: %j", params);

		// Logged unconditionally, here, before the message is handed to the
		// queue — this is the only reliable record that a send was attempted.
		// The callbacks below cannot be relied on for that, because mail-time
		// 0.1.7 does not always invoke them:
		//
		//   - Its give-up branch is guarded by `task.tries > this.maxTries`,
		//     but its worker only claims tasks with `tries < this.maxTries`,
		//     so `tries` tops out *at* the limit and the guard never opens.
		//     A permanently failing message is retried to the limit and then
		//     stranded in the queue forever, callback never called.
		//   - The callback registry is in-memory, keyed by the queue
		//     document's _id, so a restart discards it while the document
		//     survives.
		//   - With `concatEmails` on, a message merged into an existing
		//     unsent document returns before its callback is registered.
		//
		// Consequence: the error branch below is effectively unreachable for
		// send failures today. It is kept because it is correct, and becomes
		// live again the moment the queue is replaced. Until then, "was this
		// email attempted, and to whom" is answerable only from this line.
		this._log.info("Attempting to send email to: %j subject: %j", params.to, params.subject);

		// const that = this;

		// Send email
		this.mailQueue.sendMail(
			{
				from: this.smtp.from,
				to: params.to,
				subject: params.subject,
				text: params.text,
				html: params.html
			},
			(error, info) => {
				if (error) {
					this.fire(this.events.EMAIL_SENT_ERROR_EVENT, error);
					this._log.error(
						"Failed to send email to: %j subject: %j - code: %j message: %j response: %j",
						params.to,
						params.subject,
						error.code,
						error.message,
						error.response
					);
				} else {
					this.fire(this.events.EMAIL_SUCCESS_SENT_EVENT, params);
					this._log.info(
						"Message sent to: %j subject: %j - response: %j",
						params.to,
						params.subject,
						info.response
					);
				}
			}
		);

		// this.transport.sendMail({
		// 	from: this.smtp.from,
		// 	to: params.to,
		// 	subject: params.subject,
		// 	text: params.text,
		// 	html: params.html
		// }, function(error, info) {
		// 	if (error) {
		// 		that.fire(this.events.EMAIL_SENT_ERROR_EVENT, error);
		// 		that._log.info(error);
		// 	} else {
		// 		that.fire(this.events.EMAIL_SUCCESS_SENT_EVENT, params);
		// 		that._log.info('Message sent: ' + info.response);
		// 	}
		// });
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
