import { PlayerIdentity } from "./player.js";
import { PlatformInfo } from "./shared.js";

export type MappedParty = {
	partyNumber: number;
	partyId: string;
	players: string[];
};

export type PartyResponse = {
	Subject: string;
	Version: number;
	CurrentPartyID: string;
	Invites: null;
	Requests: [];
	PlatformInfo: PlatformInfo;
};

export type PartyInfo = {
	ID: string;
	MUCName: string;
	VoiceRoomID: string;
	Version: number;
	ClientVersion: string;
	Members: Member[];
	State: string;
	PreviousState: string;
	StateTransitionReason: string;
	Accessibility: string;
	CustomGameData: CustomGameData;
	MatchmakingData: MatchmakingData;
	Invites: null;
	Requests: any[];
	QueueEntryTime: Date;
	ErrorNotification: ErrorNotification;
	RestrictedSeconds: number;
	EligibleQueues: string[];
	QueueIneligibilities: any[];
	CheatData: CheatData;
	XPBonuses: any[];
};

export type CheatData = {
	GamePodOverride: string;
	ForcePostGameProcessing: boolean;
};

export type CustomGameData = {
	Settings: Settings;
	Membership: Membership;
	MaxPartySize: number;
	AutobalanceEnabled: boolean;
	AutobalanceMinPlayers: number;
	HasRecoveryData: boolean;
};

export type Membership = {
	teamOne: null;
	teamTwo: null;
	teamSpectate: null;
	teamOneCoaches: null;
	teamTwoCoaches: null;
};

export type Settings = {
	Map: string;
	Mode: string;
	UseBots: boolean;
	GamePod: string;
	GameRules: null;
};

export type ErrorNotification = {
	ErrorType: string;
	ErroredPlayers: null;
};

export type MatchmakingData = {
	QueueID: string;
	PreferredGamePods: string[];
	SkillDisparityRRPenalty: number;
};

export type Member = {
	Subject: string;
	CompetitiveTier: number;
	PlayerIdentity: PlayerIdentity;
	SeasonalBadgeInfo: null;
	IsOwner: boolean;
	QueueEligibleRemainingAccountLevels: number;
	Pings: Ping[];
	IsReady: boolean;
	IsModerator: boolean;
	UseBroadcastHUD: boolean;
	PlatformType: string;
};

export type Ping = {
	Ping: number;
	GamePodID: string;
};
