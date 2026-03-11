"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.userRepository = {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({ where: { email } });
    },
    async findById(id) {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    },
    async findByGoogleId(googleId) {
        return prisma_1.prisma.user.findUnique({ where: { googleId } });
    },
    async findByLinkedinId(linkedinId) {
        return prisma_1.prisma.user.findUnique({ where: { linkedinId } });
    },
    async createUser(params) {
        return prisma_1.prisma.user.create({
            data: {
                email: params.email,
                passwordHash: params.passwordHash ?? null,
                role: params.role,
                firstName: params.firstName,
                lastName: params.lastName,
                googleId: params.googleId ?? null,
                linkedinId: params.linkedinId ?? null,
                authProvider: params.authProvider ?? 'EMAIL',
                avatarUrl: params.avatarUrl ?? null,
                isEmailVerified: params.isEmailVerified ?? false,
            },
        });
    },
    async updateUser(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data,
        });
    },
};
//# sourceMappingURL=userRepository.js.map