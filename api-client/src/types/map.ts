export type Map = {
	uuid: string;
	displayName: string;
	coordinates: string;
	displayIcon: null | string;
	listViewIcon: string;
	splash: string;
	assetPath: string;
	mapUrl: string;
	xMultiplier: number;
	yMultiplier: number;
	xScalarToAdd: number;
	yScalarToAdd: number;
	callouts: Callout[] | null;
};

export type Callout = {
	regionName: string;
	superRegionName: SuperRegionName;
	location: Location;
};

export type Location = {
	x: number;
	y: number;
};

export type SuperRegionName =
	| "A"
	| "Attacker Side"
	| "B"
	| "C"
	| "Defender Side"
	| "Mid";
