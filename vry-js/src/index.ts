import { ApiClient } from "@valo-kit/api-client";
import type {
	CoreGameLoadouts,
	CoreGameMatchData,
	PartyInfo,
	PreGameLoadouts,
	PreGameMatchData,
	Presences,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import ora from "ora";
import {
	BehaviorSubject,
	bufferCount,
	combineLatest,
	map,
	merge,
	retry,
	skip,
	startWith,
	switchMap,
	tap,
	throttleTime,
	timer,
} from "rxjs";
import { CommandManager } from "./commands/handler.js";
import { ErrorHandler } from "./error/error-handler.js";
import {
	logStartingBanner,
	printStartingBanner,
	setTitle,
} from "./helpers/banner.js";
import { fetchEssentialContent } from "./helpers/content.js";
import { enableHotkeyDetector } from "./helpers/hotkeys.js";
import { getTableHeader } from "./helpers/table.js";
import { waitForLogin } from "./helpers/valorant.js";
import { apiLogger, getModuleLogger } from "./logger/logger.js";
import { ChatService } from "./services/chat.js";
import { MessagesService } from "./services/messages.js";
import { PresencesService } from "./services/presences.js";
import { WebSocketService } from "./services/websocket.js";
import { Table } from "./table/table.js";
import type { TableContext } from "./table/types/table.js";
import { isDevelopment, isPackaged } from "./utils/env.js";

const userTableRefreshRequest$ = new BehaviorSubject(true);

setTitle();
printStartingBanner();
logStartingBanner();

const logger = getModuleLogger("Main");

const errorHandler = new ErrorHandler(logger);

const api = new ApiClient(apiLogger);

const main = async () => {
	await waitForLogin(api);

	const webSocketService = new WebSocketService(api);
	const presencesService = new PresencesService(api, webSocketService);
	const messagesService = new MessagesService(api, webSocketService);
	const chatService = new ChatService(api, webSocketService);

	const essentialContent = await fetchEssentialContent(api);

	const ctx: TableContext = {
		api,
		...essentialContent,
		gameState: "MENUS",
		presences: [],
	};

	const table = new Table(ctx);
	await table.initPlugins();

	const cmdManager = new CommandManager(api);

	enableHotkeyDetector(userTableRefreshRequest$);

	const tableSpinner = ora();
	tableSpinner.start("Detecting Game State...");

	const tableRenewEvents$ = combineLatest([
		presencesService.gameState$,
		userTableRefreshRequest$.pipe(throttleTime(10 * 1000)),
	]).pipe(map(([state]) => state));

	const bufferedGameStates$ = tableRenewEvents$.pipe(
		startWith(await presencesService.getGameState()),
		bufferCount(2, 1)
	);

	const tableGenerator$ = bufferedGameStates$.pipe(
		tap(() => {
			table.clear();
			tableSpinner.start("Renewing Self Presence...");
		}),
		switchMap(async ([previousGameState, gameState]) => {
			let presences: Presences = [];

			let partyInfo: PartyInfo | undefined;
			let matchData: PreGameMatchData | CoreGameMatchData | undefined;
			let matchLoadouts: PreGameLoadouts | CoreGameLoadouts | undefined;

			if (gameState === "MENUS") {
				partyInfo = await api.core.getSelfPartyInfo();
				presences = await presencesService.waitForPresencesOf(
					api.helpers.getPlayerUUIDs(partyInfo.Members)
				);
			}

			if (gameState === "PREGAME") {
				tableSpinner.start("Fetching PreGame Data...");
				const fetchUpdatedAgents = previousGameState === "PREGAME";

				tableSpinner.start("Getting Match Id...");
				const matchId = await messagesService.getPreGameMatchId();

				matchData = await api.core.getPreGameMatchData(
					matchId,
					fetchUpdatedAgents
				);
				matchLoadouts = await api.core.getPreGameLoadouts(matchId);
				tableSpinner.start("Waiting for player presences...");
				presences = await presencesService.waitForPresencesOf(
					api.helpers.getPlayerUUIDs(matchData.AllyTeam.Players),
					matchData.AllyTeam.Players.length * 1000
				);
			}
			if (gameState === "INGAME") {
				tableSpinner.start("Fetching CoreGame Data...");

				tableSpinner.start("Getting Match Id...");
				const matchId = await messagesService.getCoreGameMatchId();

				matchData = await api.core.getCoreGameMatchData(matchId);
				matchLoadouts = await api.core.getCoreGameLoadouts(matchId);

				tableSpinner.start("Waiting for player presences...");
				presences = await presencesService.waitForPresencesOf(
					api.helpers.getPlayerUUIDs(matchData.Players),
					matchData.Players.length * 1000
				);
			}

			tableSpinner.start("Generating Table...");

			const tableHeader = await getTableHeader(
				api,
				{ gameState, presences, matchData },
				essentialContent
			);
			table.setTableHeader(tableHeader);

			await table.updateContext({
				gameState,
				presences,
				partyInfo,
				matchData,
				matchLoadouts,
			});

			await table.applyStateLifecycles();
		}),
		tap({
			next: () => {
				tableSpinner.stop();
				table.display();
				ora().info("Shortcuts: Ctrl+R: Refresh table, Ctrl+X: Exit app \n");
			},
			error: async e => {
				tableSpinner.fail("Table Creation Failed!");
				if (e instanceof Error) {
					if (e.message.includes("connect ECONNREFUSED")) {
						ora().info(chalk.gray(`Reason: Unable to fetch data`));
					}

					if (e.message.includes("Request failed with status code 400")) {
						await api.authenticate.fromFiles();
						ora().info(chalk.gray(`Reason: Auth token expired`));
					}
				}
				logger.error(e);
				if (isDevelopment() && !isPackaged()) {
					console.log(e);
				}
			},
		}),
		retry({
			resetOnSuccess: true,
			count: 5,
			delay: (_err, retryCount) => {
				const retryTime = Math.min(1000 * 30, 1000 * (4 + 2 ** retryCount));
				tableSpinner.start(
					`Automatic Retry After ${retryTime / 1000}s, attempt[${retryCount}/5]`
				);
				return timer(retryTime);
			},
		}),
		retry({
			delay: () => {
				ora().info(
					chalk.gray("Automatic Retry Disabled (press Ctrl+R for manual retry)")
				);
				return userTableRefreshRequest$.pipe(
					skip(1),
					switchMap(() => timer(1000))
				);
			},
		})
	);

	const commandHandler$ = chatService.commands$.pipe(
		tap(async command => {
			await cmdManager.handleCommand(command);
		})
	);

	merge(tableGenerator$, commandHandler$).subscribe();
};

try {
	main();
} catch (e: any) {
	errorHandler.handleError(e);
}

process.on("uncaughtException", e => {
	if (isDevelopment() && !isPackaged()) {
		console.log(e);
	}
	logger.error(e);
	console.log(chalk.red("✖ Unknown error occured!, Please check the logs."));
	process.exit(1);
});
