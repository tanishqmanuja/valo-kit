import type { ApiClient } from "../api-client.js";
import type { PartyChatInfo } from "../types/chat.js";

export async function postChatMessage(
	this: ApiClient,
	cid: string,
	message: string,
	type: "groupchat" | "system" = "groupchat"
) {
	return this.fetch("local", `/chat/v6/messages/`, {
		method: "POST",
		data: {
			cid,
			message,
			type,
		},
	});
}

export async function getPartyChatInfo(this: ApiClient) {
	const { data: info } = await this.fetch<PartyChatInfo>(
		"local",
		`/chat/v6/conversations/ares-parties`
	);
	return info;
}
