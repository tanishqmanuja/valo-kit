import type { ApiClient } from "@valo-kit/api-client";
import chalk from "chalk";
import { oraPromise } from "ora";
import { concatMap, firstValueFrom, from, retry } from "rxjs";

export const waitForLogin = (api: ApiClient) => {
	return oraPromise(
		firstValueFrom(
			from(api.authenticate.fromFiles()).pipe(
				retry({
					count: 10,
					delay: 15 * 1000,
				}),
				concatMap(async () => {
					const { acct } = await api.core.getUserInfo();
					const account = `${acct.game_name}#${acct.tag_line}`;
					return account;
				})
			)
		),
		{
			text: "Authenticating...",
			successText: account => `Logged in as ${chalk.bold(account)}`,
		}
	);
};
