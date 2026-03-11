"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const logger_1 = require("../config/logger");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, _req, res, _next) {
    let error = err;
    if (!(err instanceof errors_1.AppError)) {
        logger_1.logger.error('Unexpected error', { err });
        error = new errors_1.AppError('Something went wrong', 500, false);
    }
    const appError = error;
    res.status(appError.statusCode).json({
        status: 'error',
        message: appError.message,
    });
}
//# sourceMappingURL=errorHandler.js.map