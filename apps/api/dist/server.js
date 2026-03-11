"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = require("./routes/authRoutes");
const guideRoutes_1 = require("./routes/guideRoutes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/v1/auth', authRoutes_1.authRoutes);
app.use('/api/v1/guides', guideRoutes_1.guideRoutes);
app.use(errorHandler_1.errorHandler);
const port = Number(env_1.env.PORT);
app.listen(port, () => {
    logger_1.logger.info(`API listening on port ${port}`);
});
//# sourceMappingURL=server.js.map