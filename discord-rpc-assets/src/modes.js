import axios from 'axios';
import { downloadFile } from './utils.js';

const GAME_MODES_URL = "https://valorant-api.com/v1/gamemodes"

try {
    const { data: { data: res } } = await axios.get(GAME_MODES_URL)
    const modes = res.map(it => ({ name: it.displayName.toLowerCase().replace(/\s/, ""), url: it.displayIcon })).filter(it => Boolean(it.url))
    await Promise.all(modes.map(it => downloadFile(it.url, `./modes/mode_${it.name}.png`)))
    console.log("Download Successful")
} catch(err) {
    console.log("Download Failed!", err)
}

