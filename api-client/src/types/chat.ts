export type PartyChatInfo = {
	conversations: Conversation[];
};

export type Conversation = {
	cid: string;
	direct_messages: boolean;
	global_readership: boolean;
	message_history: boolean;
	mid: string;
	muted: boolean;
	mutedRestriction: boolean;
	type: string;
	uiState: UIState;
	unread_count: number;
};

export type UIState = {
	changedSinceHidden: boolean;
	hidden: boolean;
};
