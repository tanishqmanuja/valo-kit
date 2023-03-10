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

	private preferredWeapons = ["Vandal"];

	constructor(table: Table, flags?: string[]) {
		super(table, flags);

		if (this.flags.length) {
			const prefWeapons = this.flags;
			if (
				prefWeapons.every(prefWeapon =>
					weaponsList.includes(prefWeapon.toLowerCase() as WeaponName)
				)
			) {
				this.preferredWeapons = prefWeapons;
			} else {
				this.logger.warn("Invalid prefered weapon/s in config");
			}
		}
	}

	async onStatePreGame() {
		const { matchLoadouts } = this.context;
		const preGameLoadouts = matchLoadouts as PreGameLoadouts;

		if (!preGameLoadouts.LoadoutsValid) {
			return;
		}

		const cols = this.getSkinsColumnsForDisplay(preGameLoadouts.Loadouts);

		return () =>
			cols.forEach((c, i) => this.table.addColumn(this.preferredWeapons[i], c));
	}

	async onStateInGame() {
		const { matchLoadouts } = this.context;
		const inGameLoadouts = matchLoadouts as CoreGameLoadouts;

		const cols = this.getSkinsColumnsForDisplay(
			inGameLoadouts?.Loadouts.map(l => l.Loadout)
		);

		return () =>
			cols.forEach((c, i) => this.table.addColumn(this.preferredWeapons[i], c));
	}

	private getMappedLoadout(loadout: Loadout) {
		const { weapons } = this.essentialContent;
		return getMappedLoadout(loadout, weapons);
	}

	private getSkinsColumnsForDisplay(loadouts: Loadout[]) {
		return this.preferredWeapons
			.map(prefWeapon => {
				const skins = loadouts
					.map(l => this.getMappedLoadout(l))
					.map(loudout => {
						const skin = loudout[prefWeapon.toLowerCase() as WeaponName].skin;
						const regex = new RegExp(prefWeapon, "ig");
						const name = skin.displayName.replace(regex, "").trim();
						const colorRGB = getSkinColorFromTier(skin.contentTierUuid!);
						if (name.toLowerCase() === "standard") {
							return chalk.gray(name);
						}
						return chalk.rgb(...colorRGB)(name);
					});

				return skins;
			})
			.filter(Boolean);
	}
}
