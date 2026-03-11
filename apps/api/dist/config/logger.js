"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, colorize, printf } = winston_1.default.format;
const devFormat = combine(colorize(), timestamp(), printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}: ${message}${metaString}`;
}));
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: process.env.NODE_ENV === 'production' ? combine(timestamp(), json()) : devFormat,
    transports: [new winston_1.default.transports.Console()],
});
//# sourceMappingURL=logger.js.map