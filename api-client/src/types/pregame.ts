import type { Loadout } from "./loadouts.js";
import type { Player } from "./player.js";

export type PreGameLoadouts = {
	Loadouts: Loadout[];
	LoadoutsValid: boolean;
};

export type PreGameMatchData = {
	ID: string;
	Version: number;
	Teams: Team[];
	AllyTeam: Team;
	EnemyTeam: null;
	ObserverSubjects: any[];
	MatchCoaches: any[];
	EnemyTeamSize: number;
	EnemyTeamLockCount: number;
	PregameState: string;
	LastUpdated: Date;
	MapID: string;
	MapSelectPool: any[];
	BannedMapIDs: any[];
	CastedVotes: any;
	MapSelectSteps: any[];
	MapSelectStep: number;
	Team1: string;
	GamePodID: string;
	Mode: string;
	VoiceSessionID: string;
	MUCName: string;
	QueueID: string;
	ProvisioningFlowID: string;
	IsRanked: boolean;
	PhaseTimeRemainingNS: number;
	StepTimeRemainingNS: number;
	altModesFlagADA: boolean;
	TournamentMetadata: null;
	RosterMetadata: null;
};

export type Team = {
	TeamID: string;
	Players: Player[];
};
