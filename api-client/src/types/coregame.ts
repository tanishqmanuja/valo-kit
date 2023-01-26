import type { Loadouts } from "./loadouts.js";
import type { Player } from "./player.js";

export type CoreGameLoadouts = {
	Loadouts: Loadouts[];
};

export type CoreGameMatchData = {
	MatchID: string;
	Version: number;
	State: string;
	MapID: string;
	ModeID: string;
	ProvisioningFlow: string;
	GamePodID: string;
	AllMUCName: string;
	TeamMUCName: string;
	TeamVoiceID: string;
	IsReconnectable: boolean;
	ConnectionDetails: ConnectionDetails;
	PostGameDetails: null;
	Players: Player[];
	MatchmakingData: null;
};

export type ConnectionDetails = {
	GameServerHosts: string[];
	GameServerHost: string;
	GameServerPort: number;
	GameServerObfuscatedIP: number;
	GameClientHash: number;
	PlayerKey: string;
};
