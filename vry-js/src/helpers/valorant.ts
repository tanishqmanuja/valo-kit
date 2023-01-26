import { oraPromise } from "ora";
import { debounceTime, filter, firstValueFrom, switchMap, timer } from "rxjs";
import { LOCK_FILE_PATH, LOG_FILE_PATH } from "../utils/constants.js";
import { filesAccessible } from "../utils/helpers/files.js";
import { isProcessRunning } from "../utils/helpers/process.js";

const CHECK_INTERVAL_MS = 10 * 1000;

export const isValorantRunning$ = timer(0, CHECK_INTERVAL_MS).pipe(
	switchMap(async () => {
		const filesFlag = await filesAccessible(LOCK_FILE_PATH, LOG_FILE_PATH);
		const processFlag = await isProcessRunning("valorant.exe");
		return filesFlag && processFlag;
	})
);

export const waitForValorant = () => {
	return oraPromise(
		firstValueFrom(
			isValorantRunning$.pipe(filter(Boolean), debounceTime(1000))
		),
		{
			text: "Waiting for Valorant to open...",
			successText: "Valorant is running",
		}
	);
};

export const isValorantProcessRunning = () => isProcessRunning("valorant.exe");
