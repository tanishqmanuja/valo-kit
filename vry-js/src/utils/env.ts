export const isProduction = () => process.env.NODE_ENV === "production";
export const isDevelopment = () => !isProduction();
export const isPackaged = () => Boolean(process.env.pkg);
export const isStreamerModeEnabled = () => process.env.STREAMER_MODE;
