import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../../prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        // Ensure user is populated from JWT if not already present
        if (!request.user && request.headers.authorization) {
            try {
                const token = request.headers.authorization.split(' ')[1];
                if (token) {
                    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                    request.user = { id: payload.sub, role: payload.role, email: payload.email };
                }
            } catch (e) {
                // Ignore parse errors, user remains undefined
            }
        }

        const user = request.user;
        if (!user) return false;

        const MANAGERIAL_ROLES = [
            'EVENT_MANAGER',
            'MANAGER',
            'PRODUCTION_MANAGER',
            'TECHNICAL_MANAGER',
            'MARKETING_MANAGER',
            'TALENT_MANAGER'
        ];

        // 1. Direct match for User role (ORGANIZER, ADMIN, etc.)
        if (requiredRoles.includes(user.role)) return true;

        // 2. Special check for STAFF sub-roles
        if (user.role === 'STAFF') {
            const staff = await this.prisma.staff.findFirst({
                where: { userId: user.id }
            });
            if (!staff) return false;

            // If a specific role is required (e.g., EVENT_MANAGER)
            if (requiredRoles.includes(staff.role)) return true;

            // If a general MANAGER role is required, any managerial role is allowed
            if (requiredRoles.includes('MANAGER') && MANAGERIAL_ROLES.includes(staff.role)) {
                return true;
            }
        }

        return false;
    }
}
