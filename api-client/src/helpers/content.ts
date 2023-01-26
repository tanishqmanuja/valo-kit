import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { Content } from "../types/content.js";

export function getCurrentSeason(content: Content) {
	return content.Seasons.find(
		season => season.Type === "act" && season.IsActive
	)!;
}

export function getCurrentAct(content: Content) {
	return content.Seasons.find(
		season => season.Type === "act" && season.IsActive
	)!.Name;
}

export function getCurrentEpisode(content: Content) {
	return content.Seasons.find(
		season => season.Type === "episode" && season.IsActive
	)!.Name;
}

export function getEpisodeAndActFromId(seasonId: string, content: Content) {
	const act = content.Seasons.filter(it => it.Type === "act").find(
		it => it.ID === seasonId
	);
	const episode = content.Seasons.filter(it => it.Type === "episode").find(
		it =>
			dayjs(act?.StartTime).isSameOrAfter(it.StartTime) &&
			dayjs(act?.EndTime).isSameOrBefore(it.EndTime)
	)!;
	return {
		actName: act?.Name,
		episodeName: episode.Name,
		episodeId: episode.ID,
	};
}
