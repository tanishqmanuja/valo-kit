export type Agent = {
	uuid: string;
	displayName: string;
	description: string;
	developerName: string;
	characterTags: string[] | null;
	displayIcon: string;
	displayIconSmall: string;
	bustPortrait: string;
	fullPortrait: string;
	fullPortraitV2: string;
	killfeedPortrait: string;
	background: null | string;
	backgroundGradientColors: string[] | null;
	assetPath: string;
	isFullPortraitRightFacing: boolean;
	isPlayableCharacter: boolean;
	isAvailableForTest: boolean;
	isBaseContent: boolean;
	role: Role;
	abilities: Ability[];
	voiceLine: VoiceLine;
};

export type Ability = {
	slot: Slot;
	displayName: string;
	description: string;
	displayIcon: null | string;
};

export type Slot = "Ability1" | "Ability2" | "Grenade" | "Passive" | "Ultimate";

export type Role = {
	uuid: string;
	displayName: DisplayName;
	description: string;
	displayIcon: string;
	assetPath: string;
};

export type DisplayName = "Controller" | "Duelist" | "Initiator" | "Sentinel";

export type VoiceLine = {
	minDuration: number;
	maxDuration: number;
	mediaList: MediaList[];
};

export type MediaList = {
	id: number;
	wwise: string;
	wave: string;
};
