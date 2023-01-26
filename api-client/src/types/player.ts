export type Player = {
	Subject: string;
	CharacterID: string;
	CharacterSelectionState?: string;
	PregamePlayerState: string;
	CompetitiveTier: number;
	PlayerIdentity: PlayerIdentity;
	SeasonalBadgeInfo: SeasonalBadgeInfo;
	IsCaptain?: boolean;
	TeamID?: string;
	IsCoach?: boolean;
	IsAssociated?: boolean;
};

export type PlayerIdentity = {
	Subject: string;
	PlayerCardID: string;
	PlayerTitleID: string;
	AccountLevel: number;
	PreferredLevelBorderID: string;
	Incognito: boolean;
	HideAccountLevel: boolean;
};

export type SeasonalBadgeInfo = {
	SeasonID: string;
	NumberOfWins: number;
	WinsByTier: null;
	Rank: number;
	LeaderboardRank: number;
};
