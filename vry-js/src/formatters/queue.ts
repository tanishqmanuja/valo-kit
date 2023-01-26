import { objectHasOwn } from "ts-extras";

export const queueNameLUT = {
	newmap: "New Map",
	competitive: "Competitive",
	unrated: "Unrated",
	spikerush: "Spike Rush",
	deathmatch: "Deathmatch",
	ggteam: "Escalation",
	onefa: "Replication",
	custom: "Custom",
	snowball: "Snowball Fight",
	"": "Custom",
};

export const getQueueName = (queueId: string) => {
	if (objectHasOwn(queueNameLUT, queueId)) {
		return queueNameLUT[queueId];
	}
};
