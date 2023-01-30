import { TablePlugin } from "../table/types/plugin.js";

import type {
	CoreGameLoadouts,
	Loadout,
	PreGameLoadouts,
	Skin,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import { getSkinColorFromTier } from "../formatters/weapon.js";
import type { OnStateInGame, OnStatePreGame } from "../table/types/plugin.js";
import { Table } from "../table/types/table.js";

export const weaponSocketsLUT = {
	"bcef87d6-209b-46c6-8b19-fbe40bd95abc": "skin",
	"e7c63390-eda7-46e0-bb7a-a6abdacd2433": "skin_level",
	"3ad1b2b2-acdb-4524-852f-954a76ddae0a": "skin_chroma",
	"77258665-71d1-4623-bc72-44db9bd5b3b3": "buddy",
	"dd3bf334-87f3-40bd-b043-682a57a8dc3a": "buddy_level",
} as const;

export type SocketName = typeof weaponSocketsLUT[keyof typeof weaponSocketsLUT];

export const weaponNameLUT = {
	"63e6c2b6-4a8e-869c-3d4c-e38355226584": "odin",
	"55d8a0f4-4274-ca67-fe2c-06ab45efdf58": "ares",
	"9c82e19d-4575-0200-1a81-3eacf00cf872": "vandal",
	"ae3de142-4d85-2547-dd26-4e90bed35cf7": "bulldog",
	"ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a": "phantom",
	"ec845bf4-4f79-ddda-a3da-0db3774b2794": "judge",
	"910be174-449b-c412-ab22-d0873436b21b": "bucky",
	"44d4e95c-4157-0037-81b2-17841bf2e8e3": "frenzy",
	"29a0cfab-485b-f5d5-779a-b59f85e204a8": "classic",
	"1baa85b4-4c70-1284-64bb-6481dfc3bb4e": "ghost",
	"e336c6b8-418d-9340-d77f-7a9e4cfe0702": "sheriff",
	"42da8ccc-40d5-affc-beec-15aa47b42eda": "shorty",
	"a03b24d3-4319-996d-0f8c-94bbfba1dfc7": "operator",
	"4ade7faa-4cf1-8376-95ef-39884480959b": "guardian",
	"c4883e50-4494-202c-3ec3-6b8a9284f00b": "marshal",
	"462080d1-4035-2937-7c09-27aa2a5c27a7": "spectre",
	"f7e1b454-4ad4-1063-ec0a-159e56b58941": "stinger",
	"2f59173c-4bed-b6c3-2191-dea9b58be9c7": "melee",
} as const;

export type WeaponName = typeof weaponNameLUT[keyof typeof weaponNameLUT];

export const weaponsList = [
	"classic",
	"shorty",
	"frenzy",
	"ghost",
	"sheriff",

	"stinger",
	"spectre",
	"bucky",
	"judge",

	"bulldog",
	"guardian",
	"phantom",
	"vandal",

	"marshal",
	"operator",
	"ares",
	"odin",
	"melee",
] as const;

export default class PlayerWeaponsPlugin
	extends TablePlugin
	implements OnStatePreGame, OnStateInGame
{
	static id = "player-weapons";
	name = "Player Weapons";

	private logger = this.table.getPluginLogger(this);

	private preferredWeapon = "Vandal";

	constructor(table: Table, flags?: string[]) {
		super(table, flags);

		if (this.flags.length) {
			const [prefWeapon] = this.flags;
			if (weaponsList.includes(prefWeapon.toLowerCase() as WeaponName)) {
				this.preferredWeapon = prefWeapon;
			} else {
				this.logger.warn("Invalid prefered weapon in config");
			}
		}
	}

	async onStatePreGame() {
		const { matchLoadouts } = this.table.context;
		const preGameLoadouts = matchLoadouts as PreGameLoadouts;

		if (!preGameLoadouts.LoadoutsValid) {
			return;
		}

		const skins = preGameLoadouts?.Loadouts.map(l =>
			this.getMappedLoadout(l)
		).map(loudout => {
			const skin =
				loudout[this.preferredWeapon.toLowerCase() as WeaponName].skin;
			const name = skin.displayName.replace(this.preferredWeapon, "");
			const colorRGB = getSkinColorFromTier(skin.contentTierUuid!);
			if (name.toLowerCase() === "standard") {
				return chalk.gray(name);
			}
			return chalk.rgb(...colorRGB)(name);
		});

		if (skins) {
			return () => this.table.addColumn(this.preferredWeapon, skins);
		}
	}

	async onStateInGame() {
		const { matchLoadouts } = this.table.context;
		const inGameLoadouts = matchLoadouts as CoreGameLoadouts;

		const skins = inGameLoadouts?.Loadouts.map(l =>
			this.getMappedLoadout(l.Loadout)
		).map(loudout => {
			const skin =
				loudout[this.preferredWeapon.toLowerCase() as WeaponName].skin;
			const name = skin.displayName.replace(this.preferredWeapon, "").trim();
			const colorRGB = getSkinColorFromTier(skin.contentTierUuid!);
			if (name.toLowerCase() === "standard") {
				return chalk.gray(name);
			}
			return chalk.rgb(...colorRGB)(name);
		});

		if (skins) {
			return () => this.table.addColumn(this.preferredWeapon, skins);
		}
	}

	private getMappedLoadout(loadout: Loadout) {
		const { weapons } = this.table.context;
		const skins = weapons.map(weapon => weapon.skins).flat(1);

		return weaponsList.reduce((obj, weapon) => {
			const item = Object.values(loadout.Items).find(
				item => weaponNameLUT[item.ID as keyof typeof weaponNameLUT] === weapon
			);

			if (!item) {
				throw new Error(`cannot find data for weapon ${weapon}`);
			}

			const itemSockets = Object.values(item.Sockets);

			const mappedSockets = itemSockets.reduce((obj, socket) => {
				const socketName =
					weaponSocketsLUT[socket.ID as keyof typeof weaponSocketsLUT];
				return { ...obj, [socketName]: socket.Item.ID };
			}, {} as Record<SocketName, string>);

			const weaponName = weaponNameLUT[item.ID as keyof typeof weaponNameLUT];

			const skin = skins.find(skin => skin.uuid === mappedSockets.skin)!;

			return { ...obj, [weaponName]: { skin } };
		}, {} as Record<WeaponName, { skin: Skin }>);
	}
}
