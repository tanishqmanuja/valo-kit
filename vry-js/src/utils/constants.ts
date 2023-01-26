import { join } from "path";

export const LOG_FILE_PATH = join(
	process.env.LOCALAPPDATA!,
	"VALORANT",
	"Saved",
	"Logs",
	"ShooterGame.log"
);

export const LOCK_FILE_PATH = join(
	process.env.LOCALAPPDATA!,
	"Riot Games",
	"Riot Client",
	"Config",
	"lockfile"
);
