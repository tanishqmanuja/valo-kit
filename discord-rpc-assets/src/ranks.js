import axios from "axios";
import sharp from "sharp";
import { downloadFile, resizeToSquare } from "./utils.js";

const COMP_TIERS_URL = "https://valorant-api.com/v1/competitivetiers";

try {
	const {
		data: { data: res },
	} = await axios.get(COMP_TIERS_URL);
	const ranks = res
		.at(-1)
		.tiers.map(it => ({
			name: it.tierName.toLowerCase().replace(/\s/, ""),
			url: it.largeIcon,
		}))
		.filter(it => Boolean(it.url));
	await Promise.all(
		ranks.map(it => downloadFile(it.url, `./ranks/rank_${it.name}.png`))
	);
	await Promise.all(
		ranks.map(it => resizeToSquare(`./ranks/rank_${it.name}.png`))
	);

	//Fix for Unranked
	const buffer = await sharp("./ranks/rank_unranked.png")
		.trim()
		.resize({ height: 512, width: 512, fit: "cover" })
		.toBuffer();
	await sharp(buffer).toFile("./ranks/rank_unranked.png");

	console.log("Download Successful");
} catch (err) {
	console.log("Download Failed!", err);
}
