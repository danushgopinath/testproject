"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.googleAuth = googleAuth;
exports.linkedinAuth = linkedinAuth;
exports.me = me;
exports.refresh = refresh;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService_1 = require("../services/authService");
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
async function register(req, res) {
    const result = await authService_1.authService.register(req.body, res);
    res.status(201).json(result);
}
async function login(req, res) {
    const result = await authService_1.authService.login(req.body, res);
    res.status(200).json(result);
}
async function googleAuth(req, res) {
    const { idToken } = req.body;
    if (!idToken) {
        throw new errors_1.AuthError('Missing idToken', 400);
    }
    const result = await authService_1.authService.googleAuth(idToken, res);
    res.status(200).json(result);
}
async function linkedinAuth(req, res) {
    const { code } = req.body;
    if (!code) {
        throw new errors_1.AuthError('Missing authorization code', 400);
    }
    const result = await authService_1.authService.linkedinAuth(code, res);
    res.status(200).json(result);
}
async function me(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new errors_1.AuthError('Missing token', 401);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new errors_1.AuthError('Missing token', 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        const result = await authService_1.authService.me(decoded.sub);
        res.status(200).json(result);
    }
    catch {
        throw new errors_1.AuthError('Invalid or expired token', 401);
    }
}
async function refresh(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new errors_1.AuthError('No refresh token', 401);
    }
    const result = await authService_1.authService.refresh(refreshToken, res);
    res.status(200).json(result);
}
async function logout(_req, res) {
    const result = authService_1.authService.logout(res);
    res.status(200).json(result);
}
//# sourceMappingURL=authController.js.map