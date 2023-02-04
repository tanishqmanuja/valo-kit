import axios from 'axios';
import { downloadFile } from './utils.js';

const COMP_TIERS_URL = "https://valorant-api.com/v1/competitivetiers"

try {
    const { data: { data: res } } = await axios.get(COMP_TIERS_URL)
    const ranks = res.at(-1).tiers.map(it => ({ name: it.tierName.toLowerCase().replace(/\s/, ""), url: it.largeIcon })).filter(it => Boolean(it.url))
    await Promise.all(ranks.map(it => downloadFile(it.url, `./ranks/rank_${it.name}.png`)))
    console.log("Download Successful")
} catch (err) {
    console.log("Download Failed!", err)
}

