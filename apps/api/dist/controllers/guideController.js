"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGuides = listGuides;
exports.getGuide = getGuide;
const guideService_1 = require("../services/guideService");
const errors_1 = require("../utils/errors");
async function listGuides(req, res) {
    const result = await guideService_1.guideService.listPublicGuides(req.query);
    res.json(result);
}
async function getGuide(req, res) {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
        throw new errors_1.AppError('Invalid guide ID', 400);
    }
    const result = await guideService_1.guideService.getPublicGuide(id);
    res.json(result);
}
//# sourceMappingURL=guideController.js.map