import type { Location } from "./map.js";
import type { PlatformInfo } from "./shared.js";

export type MatchHistoryResponse = {
	Subject: string;
	BeginIndex: number;
	EndIndex: number;
	Total: number;
	History: History[];
};

export type History = {
	MatchID: string;
	GameStartTime: number;
	QueueID: string;
};

export type MatchDetailsResponse = {
	matchInfo: MatchInfo;
	players: Player[];
	bots: any[];
	coaches: any[];
	teams: Team[];
	roundResults: RoundResultElement[];
	kills: Kill[];
};

export type Kill = {
	gameTime: number;
	roundTime: number;
	round?: number;
	killer: string;
	victim: string;
	victimLocation: Location;
	assistants: string[];
	playerLocations: PlayerLocation[];
	finishingDamage: FinishingDamage;
};

export interface FinishingDamage {
	damageType: DamageType;
	damageItem: DamageItem;
	isSecondaryFireMode: boolean;
}

export type DamageItem = string;

export type DamageType = "Weapon" | "Bomb" | "Ability" | "Melee";

export type PlayerLocation = {
	subject: string;
	viewRadians: number;
	location: Location;
};

export type MatchInfo = {
	matchId: string;
	mapId: string;
	gamePodId: string;
	gameLoopZone: string;
	gameServerAddress: string;
	gameVersion: string;
	gameLengthMillis: number;
	gameStartMillis: number;
	provisioningFlowID: string;
	isCompleted: boolean;
	customGameName: string;
	forcePostProcessing: boolean;
	queueID: string;
	gameMode: string;
	isRanked: boolean;
	isMatchSampled: boolean;
	seasonId: string;
	completionState: string;
	platformType: string;
	partyRRPenalties: { [key: string]: number };
	shouldMatchDisablePenalties: boolean;
};

type Player = {
	subject: string;
	gameName: string;
	tagLine: string;
	platformInfo: PlatformInfo;
	teamId: TeamID;
	partyId: string;
	characterId: string;
	stats: Stats;
	roundDamage: RoundDamage[];
	competitiveTier: number;
	isObserver: boolean;
	playerCard: string;
	playerTitle: string;
	preferredLevelBorder?: string;
	accountLevel: number;
	sessionPlaytimeMinutes: number;
	behaviorFactors: BehaviorFactors;
	newPlayerExperienceDetails: NewPlayerExperienceDetails;
};

export type BehaviorFactors = {
	afkRounds: number;
	collisions: number;
	damageParticipationOutgoing: number;
	friendlyFireIncoming: number;
	friendlyFireOutgoing: number;
	mouseMovement: number;
	postGameText: number;
	stayedInSpawnRounds: number;
};

export type NewPlayerExperienceDetails = {
	basicMovement: BasicGunSkillClass;
	basicGunSkill: BasicGunSkillClass;
	adaptiveBots: AdaptiveBots;
	ability: BasicGunSkillClass;
	bombPlant: BasicGunSkillClass;
	defendBombSite: DefendBombSite;
	settingStatus: SettingStatus;
};

export type BasicGunSkillClass = {
	idleTimeMillis: number;
	objectiveCompleteTimeMillis: number;
};

export type AdaptiveBots = {
	idleTimeMillis: number;
	objectiveCompleteTimeMillis: number;
	adaptiveBotAverageDurationMillisAllAttempts: number;
	adaptiveBotAverageDurationMillisFirstAttempt: number;
	killDetailsFirstAttempt: null;
};

export type DefendBombSite = {
	idleTimeMillis: number;
	objectiveCompleteTimeMillis: number;
	success: boolean;
};

export type SettingStatus = {
	isMouseSensitivityDefault: boolean;
	isCrosshairDefault: boolean;
};

export type RoundDamage = {
	round: number;
	receiver: string;
	damage: number;
};

export type Stats = {
	score: number;
	roundsPlayed: number;
	kills: number;
	deaths: number;
	assists: number;
	playtimeMillis: number;
	abilityCasts: AbilityCasts;
};

export type AbilityCasts = {
	grenadeCasts: number;
	ability1Casts: number;
	ability2Casts: number;
	ultimateCasts: number;
};

export type TeamID = "Red" | "Blue";

export type RoundResultElement = {
	roundNum: number;
	roundResult: RoundResultEnum;
	roundCeremony: RoundCeremony;
	winningTeam: TeamID;
	plantRoundTime: number;
	plantPlayerLocations: PlayerLocation[] | null;
	plantLocation: Location;
	plantSite: PlantSite;
	defuseRoundTime: number;
	defusePlayerLocations: PlayerLocation[] | null;
	defuseLocation: Location;
	playerStats: PlayerStat[];
	roundResultCode: RoundResultCode;
	playerEconomies: Economy[];
	playerScores: PlayerScore[];
	bombPlanter?: string;
	bombDefuser?: string;
};

export type PlantSite = "" | "A" | "B" | "C";

export type Economy = {
	subject?: string;
	loadoutValue: number;
	weapon: DamageItem;
	armor: Armor;
	remaining: number;
	spent: number;
};

export type Armor =
	| ""
	| "822BCAB2-40A2-324E-C137-E09195AD7692"
	| "4DEC83D5-4902-9AB3-BED6-A7A390761157";

export type PlayerScore = {
	subject: string;
	score: number;
};

export type PlayerStat = {
	subject: string;
	kills: Kill[];
	damage: Damage[];
	score: number;
	economy: Economy;
	ability: PlayerStatAbility;
	wasAfk: boolean;
	wasPenalized: boolean;
	stayedInSpawn: boolean;
};

export type PlayerStatAbility = {
	grenadeEffects: null;
	ability1Effects: null;
	ability2Effects: null;
	ultimateEffects: null;
};

export type Damage = {
	receiver: string;
	damage: number;
	legshots: number;
	bodyshots: number;
	headshots: number;
};

export type RoundCeremony =
	| "CeremonyDefault"
	| "CeremonyCloser"
	| "CeremonyFlawless"
	| "CeremonyClutch";

export type RoundResultEnum = "Eliminated" | "Bomb detonated" | "Bomb defused";

export type RoundResultCode = "Elimination" | "Detonate" | "Defuse";

export type Team = {
	teamId: TeamID;
	won: boolean;
	roundsPlayed: number;
	roundsWon: number;
	numPoints: number;
};
