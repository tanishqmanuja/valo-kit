import chalk from "chalk";
import ora from "ora";
import { merge, retry, switchMap, tap, timer } from "rxjs";
import { CommandManager } from "./commands/handler.js";
import { ErrorHandler } from "./error/error-handler.js";
import {
	logStartingBanner,
	printStartingBanner,
	setTitle,
} from "./helpers/banner.js";
import { getConfig } from "./helpers/config.js";
import { fetchEssentialContent } from "./helpers/content.js";
import { enableHotkeyDetector } from "./helpers/hotkeys.js";
import { getTableHeader } from "./helpers/table.js";
import { getModuleLogger } from "./logger/logger.js";
import { ApiService } from "./services/api.js";
import { ChatService } from "./services/chat.js";
import { CommandService } from "./services/command.js";
import { DiscordRPCService } from "./services/discord-rpc.js";
import { GameDataService } from "./services/game-data.js";
import { MessagesService } from "./services/messages.js";
import { PresencesService } from "./services/presences.js";
import { SpinnerService } from "./services/spinner.js";
import { WebSocketService } from "./services/websocket.js";
import { Table } from "./table/table.js";
import type { TableContext } from "./table/types/table.js";
import { isDevelopment, isPackaged } from "./utils/env.js";

setTitle();
printStartingBanner();
logStartingBanner();

const logger = getModuleLogger("Main");

const errorHandler = new ErrorHandler(logger);

const main = async () => {
	const spinnerService = new SpinnerService();

	const config = await getConfig("./config.yaml");

	const apiService = new ApiService();
	await apiService.waitForLogin();

	const { api } = apiService;

	const webSocketService = new WebSocketService(apiService);
	const presencesService = new PresencesService(apiService, webSocketService);
	const messagesService = new MessagesService(apiService, webSocketService);

	const gameDataService = new GameDataService(
		apiService,
		presencesService,
		messagesService,
		spinnerService
	);

	const chatService = new ChatService(apiService, webSocketService);
	const commandService = new CommandService(chatService);
	const discordRPCService = new DiscordRPCService(
		config,
		apiService,
		presencesService
	);

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

	enableHotkeyDetector(gameDataService.requestUpdate.bind(gameDataService));

	const { spinner } = spinnerService;
	spinner.start("Detecting Game State...");

	const onGameData$ = gameDataService.gameData$.pipe(
		tap(() => {
			table.clear();
		}),
		switchMap(async gameData => {
			spinner.start("Generating Table...");

			const { gameState, previousGameState, presences, matchData, playerMMRs } =
				gameData;

			const tableHeader = await getTableHeader(
				api,
				{ gameState, presences, matchData },
				essentialContent
			);
			table.setTableHeader(tableHeader);

			await table.updateContext({
				...gameData,
			});

			await discordRPCService.updateContext({
				essentialContent,
				previousGameState,
				gameState,
				matchData,
				playerMMR: playerMMRs?.find(p => p.Subject === api.self.puuid)!,
			});

			await table.applyStateLifecycles();
		}),
		tap({
			next: () => {
				spinner.stop();
				table.display();
				ora().info("Shortcuts: Ctrl+R: Refresh table, Ctrl+X: Exit app \n");
			},
			error: async e => {
				spinner.fail("Table Creation Failed!");
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
				spinner.start(
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
				return gameDataService.manualUpdateRequest$.pipe(
					switchMap(() => timer(1000))
				);
			},
		})
	);

	const onCommand$ = commandService.command$.pipe(
		tap(async command => {
			await cmdManager.handleCommand(command, table.context);
		})
	);

	merge(onGameData$, onCommand$).subscribe();
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
