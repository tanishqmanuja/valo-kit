export type Content = {
	DisabledIDs: any[];
	Seasons: Season[];
	Events: Event[];
};

export type Season = {
	ID: string;
	Name: string;
	StartTime: Date;
	EndTime: Date;
	IsActive: boolean;
	Type?: EventType;
};

export type Event = Season;

export type EventType = "act" | "episode";
