import CliTable3 from "cli-table3";
import { OnStateInGame, OnStatePreGame, TablePlugin } from "../table/plugin.js";
import { stripAnsiCodes } from "../utils/helpers/text.js";

export default class SortByLevelPlugin
	extends TablePlugin
	implements OnStatePreGame, OnStateInGame
{
	static id = "sort-by-level";
	name = "Sort By Level";

	private sortLevel(column: CliTable3.Cell[]) {
		const spaceIndex = column.findIndex(c => c === "");

		const sortFn = ({ v: a }: { v: number }, { v: b }: { v: number }) => {
			if (a && b && a < b) {
				return 1;
			} else {
				return -1;
			}
		};

		const mapped = [...column]
			.map(value => parseInt(stripAnsiCodes(value?.toString() ?? "")))
			.map((v, i) => ({ v, i }));

		let sortedIndices: number[] = [];
		if (spaceIndex > -1) {
			const sortedA = mapped.slice(0, spaceIndex).sort(sortFn);
			const sortedB = mapped.slice(spaceIndex + 1).sort(sortFn);
			sortedIndices = [...sortedA, mapped[spaceIndex], ...sortedB].map(
				it => it.i
			);
		} else {
			sortedIndices = mapped.sort(sortFn).map(it => it.i);
		}

		const indices = Array.from(column, (_, i) => i);
		const swap = (xs: any[], i: number, j: number) =>
			([xs[j], xs[i]] = [xs[i], xs[j]]);

		sortedIndices.forEach((si, i) => {
			const j = indices.indexOf(si);
			if (i !== j) {
				swap(indices, i, j);
				this.table.swapRow(i, j);
			}
		});
	}

	async onStatePreGame() {
		const col = this.table.getColumn("Level");

		if (col) {
			this.sortLevel(col);
		}
	}

	async onStateInGame() {
		const col = this.table.getColumn("Level");

		if (col) {
			this.sortLevel(col);
		}
	}
}
