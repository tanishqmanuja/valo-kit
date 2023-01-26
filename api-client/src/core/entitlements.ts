import type { ApiClient } from "../api-client.js";
import type { Entitlements } from "../types/entitlements.js";

export async function getEntitlements(this: ApiClient): Promise<Entitlements> {
	const Response = await this.fetch("local", `/entitlements/v1/token`);

	const ResponseJson = Response.data;
	const accessTokenJWT = JSON.parse(
		Buffer.from(ResponseJson.accessToken.split(".")[1], "base64").toString(
			"utf-8"
		)
	);

	return {
		accessToken: ResponseJson.accessToken,
		entitlements: ResponseJson.entitlements,
		issuer: ResponseJson.issuer,
		subject: ResponseJson.subject,
		token: ResponseJson.token,
		exp: Number(accessTokenJWT.exp) * 1000,
		iat: Number(accessTokenJWT.iat) * 1000,
	};
}
