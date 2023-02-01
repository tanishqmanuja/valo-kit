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

export function getPlayerResultForMatch(
	matchDetails: MatchDetails,
	puuid: string
) {
	const playerTeamId = matchDetails.players.find(
		p => p.subject === puuid
	)?.teamId;

	if (!playerTeamId) {
		throw new Error("Player Team Id not found");
	}

	const allyTeam = matchDetails.teams.find(
		team => team.teamId === playerTeamId
	);
	const enemyTeam = matchDetails.teams.find(
		team => team.teamId !== playerTeamId
	);

	if (!allyTeam || !enemyTeam) {
		throw new Error("Ally team or Enemy Team not found");
	}

	if (allyTeam.won === enemyTeam.won) {
		return "Draw";
	} else {
		return allyTeam.won ? "Win" : "Loss";
	}
}

export function getScoreForMatch(matchDetails: MatchDetails, puuid: string) {
	const playerTeamId = matchDetails.players.find(
		p => p.subject === puuid
	)?.teamId;

	if (!playerTeamId) {
		throw new Error("Player Team Id not found");
	}

	const allyTeam = matchDetails.teams.find(
		team => team.teamId === playerTeamId
	);
	const enemyTeam = matchDetails.teams.find(
		team => team.teamId !== playerTeamId
	);

	if (!allyTeam || !enemyTeam) {
		throw new Error("Ally team or Enemy Team not found");
	}

	return {
		allyTeam: allyTeam.roundsWon,
		enemyTeam: enemyTeam.roundsWon,
	};
}
