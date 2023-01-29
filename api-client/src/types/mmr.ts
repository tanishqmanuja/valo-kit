export type MMR = {
	Version: number;
	Subject: string;
	NewPlayerExperienceFinished: boolean;
	QueueSkills: QueueSkills;
	LatestCompetitiveUpdate: LatestCompetitiveUpdate;
	IsLeaderboardAnonymized: boolean;
	IsActRankBadgeHidden: boolean;
};

export type LatestCompetitiveUpdate = {
	MatchID: string;
	MapID: string;
	SeasonID: string;
	MatchStartTime: number;
	TierAfterUpdate: number;
	TierBeforeUpdate: number;
	RankedRatingAfterUpdate: number;
	RankedRatingBeforeUpdate: number;
	RankedRatingEarned: number;
	RankedRatingPerformanceBonus: number;
	CompetitiveMovement: string;
	AFKPenalty: number;
};

export type QueueSkills = {
	competitive: SeasonalInfoByMode;
	custom: SeasonalInfoByMode;
	deathmatch: SeasonalInfoByMode;
	ggteam: SeasonalInfoByMode;
	newmap: SeasonalInfoByMode;
	onefa: SeasonalInfoByMode;
	seeding: SeasonalInfoByMode;
	spikerush: SeasonalInfoByMode;
	unrated: SeasonalInfoByMode;
};

export type SeasonalInfoByMode = {
	TotalGamesNeededForRating: number;
	TotalGamesNeededForLeaderboard: number;
	CurrentSeasonGamesNeededForRating: number;
	SeasonalInfoBySeasonID: SeasonalInfoBySeasonID;
};

export type SeasonalInfoBySeasonID = {
	[key: string]: SeasonInfo;
};

export type SeasonInfo = {
	SeasonID: string;
	NumberOfWins: number;
	NumberOfWinsWithPlacements: number;
	NumberOfGames: number;
	Rank: number;
	CapstoneWins: number;
	LeaderboardRank: number;
	CompetitiveTier: number;
	RankedRating: number;
	WinsByTier: { [key: string]: number } | null;
	GamesNeededForRating: number;
	TotalWinsNeededForRank: number;
};

export type CompetitiveUpdatesResponse = {
	Version: number;
	Subject: string;
	Matches: Match[];
};

export type Match = {
	MatchID: string;
	MapID: string;
	SeasonID: string;
	MatchStartTime: number;
	TierAfterUpdate: number;
	TierBeforeUpdate: number;
	RankedRatingAfterUpdate: number;
	RankedRatingBeforeUpdate: number;
	RankedRatingEarned: number;
	RankedRatingPerformanceBonus: number;
	CompetitiveMovement: CompetitiveMovement;
	AFKPenalty: number;
};

export type CompetitiveMovement = "MOVEMENT_UNKNOWN";
