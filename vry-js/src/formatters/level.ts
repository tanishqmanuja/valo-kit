import chalk from "chalk";

export function colorizeLevel(level: number) {
	if (level >= 400) {
		return chalk.rgb(102, 212, 212)(level);
	} else if (level >= 300) {
		return chalk.rgb(207, 207, 76)(level);
	} else if (level >= 200) {
		return chalk.rgb(71, 71, 204)(level);
	} else if (level >= 100) {
		return chalk.rgb(241, 144, 54)(level);
	} else {
		return chalk.rgb(211, 211, 211)(level);
	}
}
