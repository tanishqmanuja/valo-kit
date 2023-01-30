import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

import type { TablePlugin } from "../table/types/plugin.js";

const fileTransport = new transports.DailyRotateFile({
	filename: "logs/cli-%DATE%.log",
	datePattern: "YYYY-MM-DD-HH",
	zippedArchive: false,
	maxSize: "20m",
	maxFiles: "14d",
});

const lineFormat = format.printf(
	({ level, message, timestamp, moduleName }) => {
		if (moduleName) {
			return `${timestamp} | ${level.toUpperCase()} | ${moduleName} | ${message}`;
		}
		return `${timestamp} | ${level.toUpperCase()} | ${message}`;
	}
);

export const logger = createLogger({
	level: "debug",
	format: format.combine(
		format.timestamp({ format: "HH:mm:ss" }),
		format.splat(),
		format.uncolorize(),
		lineFormat
	),
	transports: [fileTransport],
});

export const rawLogger = createLogger({
	format: format.combine(
		format.uncolorize(),
		format.printf(({ message }) => message)
	),
	transports: [fileTransport],
});

export const getModuleLogger = (name: string) =>
	logger.child({ moduleName: name });

export const getPluginLogger = (plugin: TablePlugin) =>
	logger.child({ moduleName: `[Plugin][${plugin.name}]` });

const apiModuleLogger = getModuleLogger("Api");
export const apiLogger = {
	info: (msg: string) => apiModuleLogger.info(msg),
	error: (msg: string) => apiModuleLogger.error(msg),
};
