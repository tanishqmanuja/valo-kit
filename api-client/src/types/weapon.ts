export type Weapon = {
	uuid: string;
	displayName: string;
	category: string;
	defaultSkinUuid: string;
	displayIcon: string;
	killStreamIcon: string;
	assetPath: string;
	weaponStats: WeaponStats | null;
	shopData: ShopData | null;
	skins: Skin[];
};

export type ShopData = {
	cost: number;
	category: string;
	categoryText: string;
	gridPosition: GridPosition | null;
	canBeTrashed: boolean;
	image: null;
	newImage: string;
	newImage2: null;
	assetPath: string;
};

export type GridPosition = {
	row: number;
	column: number;
};

export type Skin = {
	uuid: string;
	displayName: string;
	themeUuid: string;
	contentTierUuid: null | string;
	displayIcon: null | string;
	wallpaper: null | string;
	assetPath: string;
	chromas: Chroma[];
	levels: Level[];
};

export type Chroma = {
	uuid: string;
	displayName: string;
	displayIcon: null | string;
	fullRender: string;
	swatch: null | string;
	streamedVideo: null | string;
	assetPath: string;
};

export type Level = {
	uuid: string;
	displayName: null | string;
	levelItem: LevelItem | null;
	displayIcon: null | string;
	streamedVideo: null | string;
	assetPath: string;
};

export type LevelItem =
	| "EEquippableSkinLevelItem::Animation"
	| "EEquippableSkinLevelItem::Finisher"
	| "EEquippableSkinLevelItem::FishAnimation"
	| "EEquippableSkinLevelItem::HeartbeatAndMapSensor"
	| "EEquippableSkinLevelItem::InspectAndKill"
	| "EEquippableSkinLevelItem::KillBanner"
	| "EEquippableSkinLevelItem::KillCounter"
	| "EEquippableSkinLevelItem::KillEffect"
	| "EEquippableSkinLevelItem::Randomizer"
	| "EEquippableSkinLevelItem::TopFrag"
	| "EEquippableSkinLevelItem::VFX"
	| "EEquippableSkinLevelItem::Voiceover";

export type WeaponStats = {
	fireRate: number;
	magazineSize: number;
	runSpeedMultiplier: number;
	equipTimeSeconds: number;
	reloadTimeSeconds: number;
	firstBulletAccuracy: number;
	shotgunPelletCount: number;
	wallPenetration: WallPenetration;
	feature: null | string;
	fireMode: null | string;
	altFireType: AltFireType | null;
	adsStats: AdsStats | null;
	altShotgunStats: AltShotgunStats | null;
	airBurstStats: AirBurstStats | null;
	damageRanges: DamageRange[];
};

export type AdsStats = {
	zoomMultiplier: number;
	fireRate: number;
	runSpeedMultiplier: number;
	burstCount: number;
	firstBulletAccuracy: number;
};

export type AirBurstStats = {
	shotgunPelletCount: number;
	burstDistance: number;
};

export type AltFireType =
	| "EWeaponAltFireDisplayType::ADS"
	| "EWeaponAltFireDisplayType::AirBurst"
	| "EWeaponAltFireDisplayType::Shotgun";

export type AltShotgunStats = {
	shotgunPelletCount: number;
	burstRate: number;
};

export type DamageRange = {
	rangeStartMeters: number;
	rangeEndMeters: number;
	headDamage: number;
	bodyDamage: number;
	legDamage: number;
};

export type WallPenetration =
	| "EWallPenetrationDisplayType::High"
	| "EWallPenetrationDisplayType::Low"
	| "EWallPenetrationDisplayType::Medium";
