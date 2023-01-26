export function getInterpolatedColor(input: number): string {
	if (input < 0 || input > 1) {
		throw new Error("Input should be between 0 and 1");
	}
	// Define color range
	const colorRange = ["#FF0000", "#FFFF00", "#00FF00", "#B24BF3"];
	// Interpolate color
	const color = input * (colorRange.length - 1);
	const lowerColor = colorRange[Math.floor(color)];
	const upperColor = colorRange[Math.ceil(color)];
	const interpolation = color - Math.floor(color);
	return interpolateColor(lowerColor, upperColor, interpolation);
}

// Helper function to interpolate color
function interpolateColor(
	color1: string,
	color2: string,
	amount: number
): string {
	const color1R = parseInt(color1.substring(1, 3), 16);
	const color1G = parseInt(color1.substring(3, 5), 16);
	const color1B = parseInt(color1.substring(5, 7), 16);
	const color2R = parseInt(color2.substring(1, 3), 16);
	const color2G = parseInt(color2.substring(3, 5), 16);
	const color2B = parseInt(color2.substring(5, 7), 16);
	const resultR = Math.round((1 - amount) * color1R + amount * color2R);
	const resultG = Math.round((1 - amount) * color1G + amount * color2G);
	const resultB = Math.round((1 - amount) * color1B + amount * color2B);
	return `#${resultR.toString(16).padStart(2, "0")}${resultG
		.toString(16)
		.padStart(2, "0")}${resultB.toString(16).padStart(2, "0")}`;
}
