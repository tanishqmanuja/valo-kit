import { ApiClient } from "@valo-kit/api-client";
import chalk from "chalk";
import ora from "ora";
import {
	concatMap,
	debounceTime,
	defer,
	filter,
	firstValueFrom,
	from,
	retry,
	switchMap,
	timer,
} from "rxjs";
import { apiLogger, getModuleLogger } from "../logger/logger.js";
import { LOCK_FILE_PATH, LOG_FILE_PATH } from "../utils/constants.js";
import { filesAccessible } from "../utils/helpers/files.js";
import { isProcessRunning } from "../utils/helpers/process.js";

const CHECK_INTERVAL_MS = 10 * 1000;
const AUTH_RETRY_DELAY_MS = 5 * 1000;

const logger = getModuleLogger("Api Service");

export class ApiService {
	api: ApiClient;

	constructor() {
		this.api = new ApiClient({
			maxRPS: 6,
			logger: apiLogger,
		});
	}

	async waitForLogin() {
		const spinner = ora().start("Waiting for Valorant to open...");
		logger.info("Waiting for VALORANT to start");

		const isValorantRunning$ = timer(0, CHECK_INTERVAL_MS).pipe(
			switchMap(async () => {
				const filesFlag = await filesAccessible(LOCK_FILE_PATH, LOG_FILE_PATH);
				const processFlag = await isProcessRunning("valorant.exe");
				return filesFlag && processFlag;
			})
		);

		logger.info("VALORANT is running");

		await firstValueFrom(
			isValorantRunning$.pipe(filter(Boolean), debounceTime(1000))
		),
			spinner.start("Authenticating...");
		logger.info("Waiting for authentication");

		const authenticate$ = defer(() =>
			from(this.api.authenticate.fromFiles())
		).pipe(
			concatMap(async () => {
				const { acct } = await this.api.core.getUserInfo();
				const account = `${acct.game_name}#${acct.tag_line}`;
				return account;
			}),
			retry({
				count: 10,
				delay: AUTH_RETRY_DELAY_MS,
			})
		);

		try {
			const account = await firstValueFrom(authenticate$);
			spinner.succeed(`Logged in as ${chalk.bold(account)}`);
			logger.info("Authenticated");
		} catch (error) {
			spinner.fail("Authentication Failed");
			logger.error("Authentication failed");
		}
	}
}
