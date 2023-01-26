import { WebSocketSubject } from "rxjs/webSocket";
import { WebSocket } from "ws";
import { getModuleLogger } from "../logger/logger.js";

export type ValorantEvent = {
	eventType: string;
	uri: string;
	data?: any;
};

export type ValorantWebSocketEvent = {
	event: string;
	data: ValorantEvent;
};

export class UnsafeWebSocket extends WebSocket {
	constructor(url: string, protocols?: string | string[]) {
		super(url, protocols, {
			rejectUnauthorized: false,
		});
	}
}

const socketMessageParser = (message: any) => {
	try {
		const [, event, data] = JSON.parse(message.toString());
		return { event, data } as ValorantWebSocketEvent;
	} catch {
		return;
	}
};

const logger = getModuleLogger("WebSocket Subject");

export const generateValorantWebSocketSubject = (
	url: string,
	events?: string[]
) => {
	const ws$ = new WebSocketSubject({
		url,
		serializer: ev => JSON.stringify([5, ev]),
		deserializer: ({ data }) => socketMessageParser(data),
		WebSocketCtor: UnsafeWebSocket as any,
		openObserver: {
			next: () => {
				logger.info(`Connected to ${url}`);
				if (events && events?.length > 0) {
					events.forEach(ev => ws$.next(ev));
				}
			},
		},
		closeObserver: {
			next: () => {
				logger.info(`Disconnected from ${url}`);
			},
		},
	});

	return ws$;
};
