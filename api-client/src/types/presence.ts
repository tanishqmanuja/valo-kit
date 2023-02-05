import { LooseAutoComplete } from "./shared.js";

export type RawPresence = {
	actor: string;
	basic: string;
	details: string;
	game_name: string;
	game_tag: string;
	location: string;
	msg: string;
	name: string;
	patchline: string | null;
	pid: string;
	platform: string | null;
	private: string;
	privateJwt: string | null;
	product: string;
	puuid: string;
	region: string;
	resource: string;
	state: string;
	summary: string;
	time: number;
};

export type PrivatePresence = {
	isValid: boolean;
	sessionLoopState: GameState;
	partyOwnerSessionLoopState: string;
	customGameName: string;
	customGameTeam: string;
	partyOwnerMatchMap: string;
	partyOwnerMatchCurrentTeam: string;
	partyOwnerMatchScoreAllyTeam: number;
	partyOwnerMatchScoreEnemyTeam: number;
	partyOwnerProvisioningFlow: ProvisioningFlow;
	provisioningFlow: ProvisioningFlow;
	matchMap: string;
	partyId: string;
	isPartyOwner: boolean;
	partyState: PartyState;
	partyAccessibility: string;
	maxPartySize: number;
	queueId: string;
	partyLFM: boolean;
	partyClientVersion: string;
	partySize: number;
	tournamentId: string;
	rosterId: string;
	partyVersion: number;
	queueEntryTime: string;
	playerCardId: string;
	playerTitleId: string;
	preferredLevelBorderId: string;
	accountLevel: number;
	competitiveTier: number;
	leaderboardPosition: number;
	isIdle: boolean;
};

export type Presence = RawPresence & { private: PrivatePresence };
export type Presences = Presence[];

export type GameState = "MENUS" | "PREGAME" | "INGAME";
export type PartyState = LooseAutoComplete<
	"MATCHMAKING" | "MATCHMADE_GAME_STARTING" | "CUSTOM_GAME_SETUP" | "DEFAULT"
>;
export type ProvisioningFlow = LooseAutoComplete<"CustomGame" | "INVALID">;
