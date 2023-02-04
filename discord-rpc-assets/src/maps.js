import axios from "axios";
import sharp from "sharp";
import { downloadFile } from "./utils.js";

const MAPS_URL = "https://valorant-api.com/v1/maps";

const resizeToSquare = async path => {
	const buffer = await sharp(path)
		.resize({ width: 512, height: 512, fit: "cover" })
		.toBuffer();
	return sharp(buffer).toFile(path);
};

try {
	const {
		data: { data: res },
	} = await axios.get(MAPS_URL);
	const maps = res
		.map(it => ({
			name: it.displayName.toLowerCase().replace(/\s/, ""),
			url: it.splash,
		}))
		.filter(it => Boolean(it.url));
	await Promise.all(
		maps.map(it => downloadFile(it.url, `./maps/map_${it.name}.png`))
	);
	await Promise.all(
		maps.map(it => resizeToSquare(`./maps/map_${it.name}.png`))
	);
	console.log("Download Successful");
} catch (err) {
	console.log("Download Failed!", err);
}
