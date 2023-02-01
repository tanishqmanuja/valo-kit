import {
	AxiosCacheInstance,
	CacheRequestConfig,
} from "axios-cache-interceptor";
import { objectEntries, objectFromEntries } from "ts-extras";
import * as core from "./core/index.js";
import * as external from "./external/index.js";
import * as helpers from "./helpers/index.js";
import type { AuthHeaders, LocalHeaders } from "./utils/auth.js";
import {
	generateAuthHeaders,
	generateBasicToken,
	generateLocalHeaders,
} from "./utils/auth.js";
import {
	externalAxios,
	fetchClientWithRate,
	injectLoggerCached,
	injectValorantAutoRefreshToken,
	Logger,
} from "./utils/axios.js";
import { parseLockFile } from "./utils/lockfile.js";
import { parseLogFile } from "./utils/logfile.js";

export type ClientPlatform = {
	platformType: string;
	platformOS: string;
	platformOSVersion: string;
	platformChipset: string;
};

export type ClientInfo = {
	port?: string;
	version?: string;
	platform: ClientPlatform;
	userAgent: string;
};

export type ClientServer = "pd" | "glz" | "shared" | "local";
export type ClientServerMap = {
	[Server in ClientServer]?: string;
};

export type AuthCredentials = {
	username: string;
	password: string;
};

export type AuthTokens = {
	basic?: string;
	access?: string;
	entitlement?: string;
};

const DEFAULT_CLIENT_INFO: ClientInfo = {
	platform: {
		platformType: "PC",
		platformOS: "Windows",
		platformOSVersion: "10.0.19044.1.256.64bit",
		platformChipset: "Unknown",
	},
	userAgent: "ShooterGame/13 Windows/10.0.19043.1.256.64bit",
};

export class ApiClient {
	private puuid: string | null = null;

	private client: ClientInfo = DEFAULT_CLIENT_INFO;
	private tokens: AuthTokens = {};
	private servers: ClientServerMap = {};

	private localHeaders: LocalHeaders | null = null;
	private authHeaders: AuthHeaders | null = null;
	private authCredentials: AuthCredentials | null = null;

	private authJWTExpiry: number | null = null;

	private valAxios: AxiosCacheInstance;

	constructor(private config: { maxRPS?: number; logger?: Logger }) {
		this.valAxios = fetchClientWithRate(config.maxRPS);

		injectValorantAutoRefreshToken(this.valAxios, this);

		if (this.config.logger) {
			injectLoggerCached(this.valAxios, this.config.logger);
			injectLoggerCached(externalAxios, this.config.logger);
		}
	}

	get authenticate() {
		return {
			fromFiles: async () => {
				return await this.authenticateFromFiles();
			},
		};
	}

	get self() {
		return {
			puuid: this.puuid!,
		};
	}

	getAuthCredentials() {
		return this.authCredentials;
	}

	getAuthExpiry() {
		return this.authJWTExpiry;
	}

	getLocalHeaders() {
		return this.localHeaders;
	}

	getAuthHeaders() {
		return this.authHeaders;
	}

	getClientInfo() {
		return this.client;
	}

	getServers() {
		return this.servers;
	}

	getLocalWebSocketURL() {
		return `wss://riot:${this.authCredentials!.password}@127.0.0.1:${
			this.client.port
		}`;
	}

	get core() {
		return this.patchFunctionModuleImportAsObject(core);
	}

	get helpers() {
		return this.patchFunctionModuleImportAsObject(helpers);
	}

	get external() {
		return this.patchFunctionModuleImportAsObject(external);
	}

	async fetch<T = any>(
		server: ClientServer,
		endpoint: string,
		config?: CacheRequestConfig | Record<string, any>
	) {
		if (!this.servers[server]) {
			throw new Error(`Server ${server} not found!`);
		}

		if (this.authJWTExpiry && this.authJWTExpiry < Date.now()) {
			await this.authenticateFromFiles();
		}

		const conditionMap: ClientServerMap = {
			local: this.tokens.basic,
			pd: this.tokens.access && this.tokens.entitlement,
			shared: this.tokens.access && this.tokens.entitlement,
			glz: this.tokens.access && this.tokens.entitlement,
		};

		if (!conditionMap[server]) {
			throw new Error(`Server ${server} token conditions unfit!`);
		}

		const headers = server === "local" ? this.localHeaders : this.authHeaders;

		return this.valAxios<T>(endpoint, {
			baseURL: this.servers[server],
			method: "GET",
			...config,
			headers: { ...headers, ...config?.headers },
		});
	}

	private async authenticateFromFiles() {
		const logFile = await parseLogFile();

		this.client.version = logFile.version;
		this.servers.pd = logFile.pdServer;
		this.servers.glz = logFile.glzServer;
		this.servers.shared = logFile.sharedServer;

		const lockFile = await parseLockFile();

		this.client.port = lockFile.port;
		this.servers.local = `https://127.0.0.1:${this.client.port}`;

		this.authCredentials = {
			username: "riot",
			password: lockFile.password,
		};

		this.tokens.basic = generateBasicToken(
			this.authCredentials.username,
			this.authCredentials.password
		);
		this.localHeaders = generateLocalHeaders(
			this.authCredentials.username,
			this.authCredentials.password
		);

		const entitlements = await core.getEntitlements.call(this);
		this.puuid = entitlements.subject;
		this.tokens.access = entitlements.accessToken;
		this.tokens.entitlement = entitlements.token;

		this.authHeaders = generateAuthHeaders(
			this.tokens.access!,
			this.tokens.entitlement!,
			this.client.platform,
			this.client.version,
			this.client.userAgent
		);
		return this.authJWTExpiry;
	}

	private patchFunctionModuleImportAsObject<
		Module extends Record<PropertyKey, (...args: any) => any>
	>(m: Module) {
		const boundMap = objectFromEntries(
			objectEntries(m).map(([k, v]) => [k, v.bind(this)])
		);

		return boundMap as {
			[f in keyof typeof m]: (
				...args: Parameters<typeof m[f]>
			) => ReturnType<typeof m[f]>;
		};
	}
}
