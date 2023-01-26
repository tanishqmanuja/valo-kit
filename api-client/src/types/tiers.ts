export type CompetitiveTiers = {
	uuid: string;
	assetObjectName: string;
	tiers: Tier[];
	assetPath: string;
};

export type Tier = {
	tier: number;
	tierName: string;
	division: string;
	divisionName: string;
	color: string;
	backgroundColor: string;
	smallIcon: null | string;
	largeIcon: null | string;
	rankTriangleDownIcon: null | string;
	rankTriangleUpIcon: null | string;
};
