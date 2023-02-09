import ora from "ora";
import { filter, Subject, tap } from "rxjs";
import { WebSocketSubject } from "rxjs/webSocket";
import { getModuleLogger } from "../logger/logger.js";
import type { ValorantWebSocketEvent } from "../utils/websocket.js";
import { generateValorantWebSocketSubject } from "../utils/websocket.js";
import { ApiService } from "./api.js";

const logger = getModuleLogger("WebSocket Service");

export class WebSocketService {
	private webSocket$: WebSocketSubject<any> | undefined;
	private listenForEvents: string[] = [];

	webSocketEvents$ = new Subject<ValorantWebSocketEvent>();

	constructor(private apiService: ApiService) {
		this.connect();
	}

	get api() {
		return this.apiService.api;
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

						await this.apiService.waitForLogin();
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
