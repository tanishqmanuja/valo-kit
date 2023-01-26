import type { ApiClient } from "../api-client.js";
import type { Content } from "../types/content.js";

export async function getContent(this: ApiClient) {
	const { data: content } = await this.fetch<Content>(
		"shared",
		`/content-service/v3/content`
	);
	return content;
}
