/**
 * Project janux-persist.js
 * Created by ernesto on 8/28/18
 */
import * as config from 'config';
import {EnvironmentInfo} from "services/enviroment/environment-info";

export class EnvironmentService {

	public static getEnvironmentInfo(): EnvironmentInfo {

		const environmentInfo: EnvironmentInfo = new EnvironmentInfo();
		if (config['serverAppContext'] && config['serverAppContext'].system && config['serverAppContext'].system.environment) {
			environmentInfo.environment = config['serverAppContext'].system.environment;
		} else {
			environmentInfo.environment = 'development';
		}

		return environmentInfo;
	}
}
