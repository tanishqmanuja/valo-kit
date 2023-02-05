export type PlatformInfo = {
	platformType: string;
	platformOS: string;
	platformOSVersion: string;
	platformChipset: string;
};

export type LooseAutoComplete<T extends string> = T | Omit<string, T>;
