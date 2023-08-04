import type { Season } from "../types/content.js";
import type { MMR } from "../types/mmr.js";
import type { Tier } from "../types/tiers.js";
import { capitalizeFirstLetter } from "../utils/text.js";

export function getCompetitiveTier(mmr: MMR, season: Season) {
	const { CompetitiveTier, RankedRating } = mmr?.QueueSkills?.competitive
		?.SeasonalInfoBySeasonID?.[season.ID] ?? {
		CompetitiveTier: 0,
		RankedRating: 0,
	};
	return { Rank: CompetitiveTier, RankedRating };
}

export function getBestCompetitiveTier(mmr: MMR) {
	const Seasons = Object.values(
		mmr?.QueueSkills?.competitive?.SeasonalInfoBySeasonID ?? {}
	);
	const AllRanks = Seasons.map(season => Object.keys(season.WinsByTier ?? {}))
		.flat(1)
		.map(rank => parseInt(rank, 10))
		.filter(rank => rank > 2);

	const BestRank = Math.max(...(AllRanks ?? []));

	if (isFinite(BestRank)) {
		const BestRankSeason = Seasons.find(season =>
			Object.keys(season.WinsByTier ?? {}).includes(BestRank.toString())
		);

		return { Rank: BestRank, SeasonID: BestRankSeason?.SeasonID };
	} else {
		return {};
	}
}

export function getWorstCompetitiveTier(mmr: MMR) {
	const Seasons = Object.values(
		mmr?.QueueSkills?.competitive?.SeasonalInfoBySeasonID ?? {}
	);
	const AllRanks = Seasons.map(season => Object.keys(season.WinsByTier ?? {}))
		.flat(1)
		.map(rank => parseInt(rank, 10))
		.filter(rank => rank > 2);

	const WorstRank = Math.min(...(AllRanks ?? []));

	return { Rank: isFinite(WorstRank) ? WorstRank : null };
}

export function getRankDivision(tier: number, competitiveTiers: Tier[]) {
	return (
		competitiveTiers.find(rank => rank.tier === tier)?.divisionName ?? ""
	).toLowerCase();
}

export function getRankName(tier: number, competitiveTiers: Tier[]) {
	return capitalizeFirstLetter(
		competitiveTiers.find(rank => rank.tier === tier)?.tierName ?? "unranked"
	);
}

export function getWinRate(mmr: MMR, seasonId?: string) {
	let totalWins = 0;
	let totalGames = 0;

	Object.values(mmr.QueueSkills).forEach(queue => {
		Object.values(queue.SeasonalInfoBySeasonID ?? {}).forEach(season => {
			if (!seasonId || season.SeasonID === seasonId) {
				totalWins += season.NumberOfWinsWithPlacements;
				totalGames += season.NumberOfGames;
			}
		});
	});

	const winRate = totalWins / totalGames;

	if (Number.isNaN(winRate)) {
		return 0;
	}

	return winRate;
}

export function getCompetitiveWinRateInfo(mmr: MMR, seasonId?: string) {
	let totalWins = 0;
	let totalGames = 0;

	const competitiveQueue = mmr.QueueSkills.competitive;
	if (!competitiveQueue?.SeasonalInfoBySeasonID) {
		return { winRate: 0, totalGames, totalWins };
	}

	Object.values(competitiveQueue.SeasonalInfoBySeasonID).forEach(season => {
		if (!seasonId || season.SeasonID === seasonId) {
			totalWins += season.NumberOfWinsWithPlacements;
			totalGames += season.NumberOfGames;
		}
	});

	const winRate = totalWins / totalGames;

	if (Number.isNaN(winRate)) {
		return { winRate: 0, totalWins, totalGames };
	}

	return { winRate, totalWins, totalGames };
}
