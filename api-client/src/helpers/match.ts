import { MatchDetails } from "../types/match.js";

export function getHeadshotPercentageForMatch(
	matchDetails: MatchDetails,
	puuid: string
) {
	let totalShots = 0;
	let headshots = 0;

	matchDetails.roundResults.forEach(roundResult => {
		const playerStat = roundResult.playerStats.find(
			stat => stat.subject === puuid
		);
		if (playerStat) {
			playerStat.damage.forEach(d => {
				totalShots += d.legshots + d.bodyshots + d.headshots;
				headshots += d.headshots;
			});
		}
	});

	return totalShots > 0 ? (headshots / totalShots) * 100 : 0;
}

export function getKillDeathRatioForMatch(
	matchDetails: MatchDetails,
	puuid: string
) {
	let kills = 0;
	let deaths = 0;

	const player = matchDetails.players.find(p => p.subject === puuid);

	if (player) {
		kills += player.stats.kills;
		deaths += player.stats.deaths;
	}

	return deaths > 0 ? kills / deaths : kills;
}
