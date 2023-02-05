import { capitalizeFirstLetter } from "../utils/helpers/text.js";

export const queueNameLUT: Record<string, string> = {
	newmap: "New Map",
	competitive: "Competitive",
	unrated: "Unrated",
	spikerush: "Spike Rush",
	deathmatch: "Deathmatch",
	ggteam: "Escalation",
	onefa: "Replication",
	custom: "Custom",
	snowball: "Snowball Fight",
	swiftplay: "Swift Play",
	"": "Custom",
};

export const getQueueName = (queueId: string) => {
	return queueNameLUT[queueId] ?? capitalizeFirstLetter(queueId);
};
