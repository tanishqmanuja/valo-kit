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
