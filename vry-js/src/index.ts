import { ApiClient } from "@valo-kit/api-client";
import type {
	CoreGameLoadouts,
	CoreGameMatchData,
	MMR,
	PartyInfo,
	PlayerName,
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
import { CommandService } from "./services/command.js";
import { MessagesService } from "./services/messages.js";
import { PresencesService } from "./services/presences.js";
import { WebSocketService } from "./services/websocket.js";
import { Table } from "./table/table.js";
import type { TableContext } from "./table/types/table.js";
import { isDevelopment, isPackaged } from "./utils/env.js";
import { retryPromise } from "./utils/helpers/rxjs.js";

const userTableRefreshRequest$ = new BehaviorSubject(true);

setTitle();
printStartingBanner();
logStartingBanner();

const logger = getModuleLogger("Main");

const errorHandler = new ErrorHandler(logger);

const api = new ApiClient({
	maxRPS: 6,
	logger: apiLogger,
});

const main = async () => {
	await waitForLogin(api);

	const webSocketService = new WebSocketService(api);
	const presencesService = new PresencesService(api, webSocketService);
	const messagesService = new MessagesService(api, webSocketService);
	const chatService = new ChatService(api, webSocketService);
	const commandService = new CommandService(chatService);

	const essentialContent = await fetchEssentialContent(api);

	const ctx: TableContext = {
		api,
		essentialContent,
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
			tableSpinner.start("Initializing Table...");
		}),
		switchMap(async ([previousGameState, gameState]) => {
			let presences: Presences = [];

			let partyInfo: PartyInfo | undefined;
			let playerUUIDs: string[] | undefined;
			let playerNames: PlayerName[] | undefined;
			let playerMMRs: MMR[] | undefined;
			let matchData: PreGameMatchData | CoreGameMatchData | undefined;
			let matchLoadouts: PreGameLoadouts | CoreGameLoadouts | undefined;

			if (gameState === "MENUS") {
				tableSpinner.start("Getting Party Id...");
				const partyId = await messagesService.getPartyId();

				tableSpinner.start("Fetching Party Data...");
				partyInfo = await retryPromise(api.core.getSelfPartyInfo(partyId));

				playerUUIDs = api.helpers.getPlayerUUIDs(partyInfo.Members);

				tableSpinner.start("Fetching Player Names...");
				playerNames = await retryPromise(api.core.getPlayerNames(playerUUIDs));

				tableSpinner.start("Fetching Player MMRs...");
				playerMMRs = await retryPromise(api.core.getPlayerMMRs(playerUUIDs));

				// tableSpinner.start("Waiting for party presences...");
				// presences = await presencesService.waitForPresencesOf(playerUUIDs);
			}

			if (gameState === "PREGAME") {
				const fetchUpdatedAgents = previousGameState === "PREGAME";

				tableSpinner.start("Getting Match Id...");
				const matchId = await messagesService.getPreGameMatchId();

				tableSpinner.start("Fetching PreGame Match Data...");
				matchData = await retryPromise(
					api.core.getPreGameMatchData(matchId, fetchUpdatedAgents)
				);

				tableSpinner.start("Fetching PreGame Match Loadouts...");
				matchLoadouts = await retryPromise(
					api.core.getPreGameLoadouts(matchId)
				);

				playerUUIDs = api.helpers.getPlayerUUIDs(matchData.AllyTeam.Players);

				tableSpinner.start("Fetching Player Names...");
				playerNames = await retryPromise(api.core.getPlayerNames(playerUUIDs));

				tableSpinner.start("Fetching Player MMRs...");
				playerMMRs = await retryPromise(api.core.getPlayerMMRs(playerUUIDs));

				tableSpinner.start("Waiting for player presences...");
				presences = await presencesService.waitForPresencesOf(
					playerUUIDs,
					playerUUIDs.length * 1000
				);
			}

			if (gameState === "INGAME") {
				tableSpinner.start("Getting Match Id...");
				const matchId = await messagesService.getCoreGameMatchId();

				tableSpinner.start("Fetching CoreGame Match Data...");
				matchData = await retryPromise(api.core.getCoreGameMatchData(matchId));

				tableSpinner.start("Fetching CoreGame Match Loadouts...");
				matchLoadouts = await retryPromise(
					api.core.getCoreGameLoadouts(matchId)
				);

				playerUUIDs = api.helpers.getPlayerUUIDs(matchData.Players);

				tableSpinner.start("Fetching Player Names...");
				playerNames = await retryPromise(api.core.getPlayerNames(playerUUIDs));

				tableSpinner.start("Fetching Player MMRs...");
				playerMMRs = await retryPromise(api.core.getPlayerMMRs(playerUUIDs));

				tableSpinner.start("Waiting for player presences...");
				presences = await presencesService.waitForPresencesOf(
					playerUUIDs,
					playerUUIDs.length * 1000
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
				playerUUIDs,
				playerNames,
				playerMMRs,
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

	const commandHandler$ = commandService.commands$.pipe(
		tap(async command => {
			await cmdManager.handleCommand(command, table.context);
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
