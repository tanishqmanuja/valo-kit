import chalk from "chalk";
import ora from "ora";
import { BehaviorSubject } from "rxjs";

export const enableHotkeyDetector = (
	userTableRefreshRequest$: BehaviorSubject<boolean>
) => {
	var keypress = require("keypress");
	keypress(process.stdin);

	process.stdin.on("keypress", (ch, key) => {
		if (!key) return;

		if (key && key.ctrl && key.name == "r") {
			ora().info(
				chalk.gray("Table Refresh Requested (might take upto 15 secs)")
			);
			userTableRefreshRequest$.next(true);
		}

		if (key && key.ctrl && key.name == "c") {
			ora().info("Exiting App");
			process.exit(0);
		}

		if (key && key.ctrl && key.name == "x") {
			ora().info("Exiting App");
			process.exit(0);
		}
	});

	process.stdin.setRawMode(true);
	process.stdin.resume();
};
