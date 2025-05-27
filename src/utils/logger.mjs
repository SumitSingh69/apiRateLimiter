import fs from "fs";
import path from "path";

const logFilePath = path.join(process.cwd(), "logs.txt");

export const logEvent = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error("Logging error:", err);
    });

    console.log(logMessage.trim());
};
