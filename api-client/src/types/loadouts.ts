export type Loadouts = {
	CharacterID: string;
	Loadout: Loadout;
};

export type Loadout = {
	Sprays: Sprays;
	Items: { [key: string]: ItemValue };
};

export type ItemValue = {
	ID: string;
	TypeID: string;
	Sockets: { [key: string]: Socket };
};

export type Socket = {
	ID: string;
	Item: SocketItem;
};

export type SocketItem = {
	ID: string;
	TypeID: string;
};

export type Sprays = {
	SpraySelections: SpraySelection[];
};

export type SpraySelection = {
	SocketID: string;
	SprayID: string;
	LevelID: string;
};
