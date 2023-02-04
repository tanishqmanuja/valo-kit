import axios from "axios";
import { createWriteStream, mkdirSync } from "node:fs";
import { Agent } from "node:https";
import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { pipeline } from "node:stream/promises";

const httpsAgent = new Agent({ rejectUnauthorized: false });

export const downloadFile = async (fileUrl, savePath) => {
	const dirPath = dirname(savePath);

	mkdirSync(dirPath, { recursive: true });

	const localFilePath = join(cwd(), savePath);
	try {
		const response = await axios({
			method: "GET",
			url: fileUrl,
			responseType: "stream",
			httpsAgent,
		});

		await pipeline(response.data, createWriteStream(localFilePath));
	} catch (err) {
		throw new Error(err);
	}
};
