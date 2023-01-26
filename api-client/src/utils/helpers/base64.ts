export const base64ToJSON = (base64: string) => {
	const plain = Buffer.from(base64, "base64").toString("utf8");
	return JSON.parse(plain);
};
