import type { AuthProvider, UserRole } from '../../generated/prisma'
import { prisma } from '../config/prisma'

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } })
  },

  async findByLinkedinId(linkedinId: string) {
    return prisma.user.findUnique({ where: { linkedinId } })
  },

  async createUser(params: {
    email: string
    passwordHash?: string
    role: UserRole
    firstName: string
    lastName: string
    googleId?: string
    linkedinId?: string
    authProvider?: AuthProvider
    avatarUrl?: string
    isEmailVerified?: boolean
  }) {
    return prisma.user.create({
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
    })
  },

  async updateUser(id: string, data: {
    googleId?: string
    linkedinId?: string
    avatarUrl?: string
    isEmailVerified?: boolean
  }) {
    return prisma.user.update({
      where: { id },
      data,
    })
  },
}
