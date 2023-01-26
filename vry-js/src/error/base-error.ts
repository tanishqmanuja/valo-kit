export class BaseError extends Error {
	public readonly log: string;
	public readonly methodName?: string;
	public readonly isOperational: boolean;

	constructor(
		log: string,
		message: string | unknown = log,
		methodName?: string,
		isOperational: boolean = true
	) {
		super(message as string);
		Object.setPrototypeOf(this, new.target.prototype);

		this.log = log;
		if (methodName) this.methodName = methodName;
		this.isOperational = isOperational;

		Error.captureStackTrace(this);
	}
}
