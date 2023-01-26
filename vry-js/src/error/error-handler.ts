import type { Logger } from "winston";
import { BaseError } from "./base-error.js";

export class ErrorHandler {
	logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	handleError(err: Error) {
		console.log("Unknown error occurred!");
		console.log("Exiting App");
		this.logger.error(err);
		process.exit(1);
	}

	async isBaseError(err: Error) {
		return err instanceof BaseError;
	}

	async isTrustedError(err: Error) {
		return err instanceof BaseError && err.isOperational;
	}
}
