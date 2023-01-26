import { ApiClient } from "@valo-kit/api-client";
import { filter, firstValueFrom, from, retry, Subject, tap } from "rxjs";
import { WebSocketSubject } from "rxjs/webSocket";
import { generateValorantWebSocketSubject } from "../utils/websocket.js";

import ora from "ora";
import { waitForValorant } from "../helpers/valorant.js";
import { getModuleLogger } from "../logger/logger.js";
import type { ValorantWebSocketEvent } from "../utils/websocket.js";

const logger = getModuleLogger("WebSocket Service");

export class WebSocketService {
	private webSocket$: WebSocketSubject<any> | undefined;
	private listenForEvents: string[] = [];

	webSocketEvents$ = new Subject<ValorantWebSocketEvent>();

	constructor(private api: ApiClient) {
		this.connect();
	}

	enableListenerForEvent(event: string) {
		this.listenForEvents.push(event);
		this.webSocket$?.next(event);
		logger.info(`Listen for ${event}`);
	}

	private connect() {
		logger.info("Trying connection");
		if (this.webSocket$?.unsubscribe) {
			this.webSocket$.unsubscribe();
		}

		const wsUrl = this.api.getLocalWebSocketURL();
		this.webSocket$ = generateValorantWebSocketSubject(wsUrl);

		this.webSocket$
			.pipe(
				filter(Boolean),
				tap({
					error: async e => {
						ora().warn("WebSocket Disconnected (is VALORANT running?)\n");
						logger.error(e);

						await waitForValorant();
						await firstValueFrom(
							from(this.api.authenticate.fromFiles()).pipe(
								retry({
									delay: 2000,
								})
							)
						);
						this.connect();
					},
				})
			)
			.subscribe({
				next: event => this.webSocketEvents$.next(event),
				error: () => {},
				complete: () => {},
			});

		this.listenForEvents.forEach(event => this.webSocket$?.next(event));
	}
}
