export type LocalHeaders = {
	Authorization: string;
};

export type AuthHeaders = {
	Authorization: string;
	"X-Riot-Entitlements-JWT": string;
	"X-Riot-ClientPlatform": string;
	"X-Riot-ClientVersion": string;
	"User-Agent": string;
};

export const generateLocalHeaders = (
	username: string,
	password: string
): LocalHeaders => ({
	Authorization: `Basic ${generateBasicToken(username, password)}`,
});

export const generateAuthHeaders = (
	accessToken: string,
	entitlementsToken: string,
	platform: object,
	clientVersion: string,
	userAgent: string
): AuthHeaders => ({
	Authorization: `Bearer ${accessToken}`,
	"X-Riot-Entitlements-JWT": entitlementsToken,
	"X-Riot-ClientPlatform": Buffer.from(JSON.stringify(platform)).toString(
		"base64"
	),
	"X-Riot-ClientVersion": clientVersion,
	"User-Agent": userAgent,
});

export const generateBasicToken = (username: string, password: string) =>
	Buffer.from(`${username}:${password}`).toString("base64");
