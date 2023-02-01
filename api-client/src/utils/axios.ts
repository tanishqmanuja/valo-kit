import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AxiosCacheInstance, setupCache } from "axios-cache-interceptor";
import {
	errorLogger,
	requestLogger,
	responseLogger,
	setGlobalConfig,
} from "axios-logger";
import rateLimit, { RateLimitedAxiosInstance } from "axios-rate-limit";
import { Agent } from "https";
import { ApiClient } from "../api-client.js";

const MAX_RPS = 6;
const VAL_CACHE_TTL_MINS = 5;
const EXTERNAL_CACHE_TTL_MINS = 15;
const RETRY_LIMIT = 2;
const RETRY_DELAY_MS = 2 * 1000;

export type Logger = {
	info: (...msg: string[]) => any;
	error: (...msg: string[]) => any;
};

type RetryConfig = {
	retry: boolean;
	retryCount: number;
	retryLimit: number;
};

export const fetchClientWithRate = (maxRPS: number = MAX_RPS) => {
	const axiosInstance = axios.create({
		httpsAgent: new Agent({
			rejectUnauthorized: false,
		}),
	});
	const httpClient = (rateLimit as any)(axiosInstance, {
		maxRPS,
	});

	const cachedClient = setupCache(httpClient as RateLimitedAxiosInstance, {
		ttl: 1000 * 60 * VAL_CACHE_TTL_MINS,
	});

	return cachedClient;
};

export const externalAxios = setupCache(axios, {
	ttl: 1000 * 60 * EXTERNAL_CACHE_TTL_MINS,
});

export const injectValorantAutoRefreshToken = (
	axiosInstance: AxiosCacheInstance,
	api: ApiClient
) => {
	axiosInstance.interceptors.request.use((config: any) => {
		config.retryCount = config.retryCount || 0;
		config.retryLimit = config.retryLimit || RETRY_LIMIT;
		config.retry = config.retry ?? true;
		return config;
	});

	axiosInstance.interceptors.response.use(
		response => {
			return response;
		},
		async (error: AxiosError) => {
			const { config: _config, response } = error;
			const config = _config as AxiosRequestConfig & RetryConfig;
			if (
				response &&
				response.status === 400 &&
				config.retryCount < config.retryLimit &&
				config.retry
			) {
				await api.authenticate.fromFiles();
				config.headers = api.getAuthHeaders()!;
				const retryConfig = { ...config, retryCount: config.retryCount + 1 };
				return new Promise(resolve =>
					setTimeout(() => resolve(axiosInstance(retryConfig)), RETRY_DELAY_MS)
				);
			} else if (
				isRetryableError(error) &&
				config.retryCount < config.retryLimit &&
				config.retry
			) {
				const retryConfig = { ...config, retryCount: config.retryCount + 1 };
				return new Promise(resolve =>
					setTimeout(() => resolve(axiosInstance(retryConfig)), RETRY_DELAY_MS)
				);
			}

			return Promise.reject(error);
		}
	);
};

export function isRetryableError(error: AxiosError) {
	return (
		error.code !== "ECONNABORTED" &&
		(!error.response ||
			(error.response.status >= 500 && error.response.status <= 599))
	);
}

export const injectLoggerCached = (
	axios: AxiosCacheInstance,
	logger: Logger
) => {
	setGlobalConfig({
		dateFormat: false,
		method: true,
		url: true,
		headers: false,
		prefixText: false,
		data: false,
		params: false,
		logger: logger.info.bind(this),
	});

	axios.interceptors.request.use(
		(config: any) => {
			if (config.retry && config.retryCount > 1) {
				return {
					...requestLogger(config, {
						prefixText: `Retry ${config.retryCount}`,
					}),
					...config,
				};
			} else {
				return { ...requestLogger(config), ...config };
			}
		},
		err =>
			errorLogger(err, {
				logger: logger.error.bind(this),
			})
	);

	axios.interceptors.response.use(
		res => {
			if (res.cached) {
				return { ...responseLogger(res, { prefixText: "Cached" }), ...res };
			} else {
				return { ...responseLogger(res), ...res };
			}
		},
		err =>
			errorLogger(err, {
				logger: logger.error.bind(this),
			})
	);
};
