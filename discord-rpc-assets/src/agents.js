import axios from "axios";
import { downloadFile, resizeToSquare } from "./utils.js";

const AGENTS_URL =
	"https://valorant-api.com/v1/agents?isPlayableCharacter=true";

try {
	const {
		data: { data: res },
	} = await axios.get(AGENTS_URL);
	const agents = res
		.map(it => ({
			name: it.displayName.toLowerCase().replace(/\//, ""),
			url: it.displayIcon,
		}))
		.filter(m => Boolean(m.url));
	await Promise.all(
		agents.map(it => downloadFile(it.url, `./agents/agent_${it.name}.png`))
	);
	await Promise.all(
		agents.map(it => resizeToSquare(`./agents/agent_${it.name}.png`))
	);
	console.log("Downloaded Successful");
} catch (err) {
	console.log("Download Failed!", err);
}
