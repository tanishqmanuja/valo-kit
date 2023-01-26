const contentTierColorLUT: Record<string, [number, number, number]> = {
	"0cebb8be-46d7-c12a-d306-e9907bfc5a25": [0, 149, 135],
	"e046854e-406c-37f4-6607-19a9ba8426fc": [241, 184, 45],
	"60bca009-4182-7998-dee7-b8a2558dc369": [209, 84, 141],
	"12683d76-48d7-84a3-4e09-6985794f0445": [90, 159, 226],
	"411e4a55-4e59-7757-41f0-86a53f101bb5": [239, 235, 101],
};

export const getSkinColorFromTier = (tierUUID: string) => {
	const color = contentTierColorLUT[tierUUID];
	return color ?? [180, 180, 180];
};
