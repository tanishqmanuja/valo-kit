type Pw = {
	cng_at: number;
	reset: boolean;
	must_reset: boolean;
};

type Lol = {
	cuid: number;
	cpid: string;
	uid: number;
	pid: string;
	apid?: any;
	ploc: string;
	lp: boolean;
	active: boolean;
};

type Ban = {
	code?: any;
	desc: string;
	exp?: any;
	restrictions: any[];
};

type LolRegion = {
	cuid: number;
	cpid: string;
	uid: number;
	pid: string;
	lp: boolean;
	active: boolean;
};

type Acct = {
	type: number;
	state: string;
	adm: boolean;
	game_name: string;
	tag_line: string;
	created_at: number;
};

export type UserInfo = {
	country: string;
	sub: string;
	lol_account?: any;
	email_verified: boolean;
	player_plocale?: any;
	country_at: number;
	pw: Pw;
	lol: Lol;
	original_platform_id: string;
	original_account_id: number;
	phone_number_verified: boolean;
	photo?: any;
	preferred_username: string;
	ban: Ban;
	ppid?: any;
	lol_region: LolRegion[];
	player_locale: string;
	pvpnet_account_id: number;
	region?: any;
	acct: Acct;
	jti: string;
	username: string;
};

export type UserInfoResponse = {
	userInfo: string;
};
