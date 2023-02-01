import { TablePlugin } from "../table/types/plugin.js";

import type {
	CoreGameLoadouts,
	Loadout,
	PreGameLoadouts,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import {
	getMappedLoadout,
	WeaponName,
	weaponsList,
} from "../formatters/loadouts.js";
import { getSkinColorFromTier } from "../formatters/weapon.js";
import type { OnStateInGame, OnStatePreGame } from "../table/types/plugin.js";
import { Table } from "../table/types/table.js";

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
		const { matchLoadouts } = this.context;
		const preGameLoadouts = matchLoadouts as PreGameLoadouts;

		if (!preGameLoadouts.LoadoutsValid) {
			return;
		}

		const skins = preGameLoadouts?.Loadouts.map(l =>
			this.getMappedLoadout(l)
		).map(loudout => {
			const skin =
				loudout[this.preferredWeapon.toLowerCase() as WeaponName].skin;
			const regex = new RegExp(this.preferredWeapon, "ig");
			const name = skin.displayName.replace(regex, "").trim();
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
		const { matchLoadouts } = this.context;
		const inGameLoadouts = matchLoadouts as CoreGameLoadouts;

		const skins = inGameLoadouts?.Loadouts.map(l =>
			this.getMappedLoadout(l.Loadout)
		).map(loudout => {
			const skin =
				loudout[this.preferredWeapon.toLowerCase() as WeaponName].skin;
			const regex = new RegExp(this.preferredWeapon, "ig");
			const name = skin.displayName.replace(regex, "").trim();
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
		const { weapons } = this.essentialContent;
		return getMappedLoadout(loadout, weapons);
	}
}
