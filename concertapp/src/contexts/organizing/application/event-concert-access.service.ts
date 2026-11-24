import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class EventConcertAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async canManage(userId: string, concertId: string): Promise<boolean> {
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      select: { organizerId: true, eventManagerId: true },
    });
    if (!concert) return false;
    if (concert.organizerId === userId) return true;

    const staff = await this.prisma.staff.findMany({
      where: { userId },
      select: { id: true, concertId: true, role: true },
    });
    return staff.some(
      (member) =>
        member.id === concert.eventManagerId ||
        (member.role === 'EVENT_MANAGER' && member.concertId === concertId),
    );
  }

  async canJoinCall(userId: string, concertId: string): Promise<boolean> {
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      select: { organizerId: true, eventManagerId: true },
    });
    if (!concert) return false;
    if (concert.organizerId === userId) return true;

    const staff = await this.prisma.staff.findMany({
      where: { userId },
      select: { id: true, concertId: true, managerId: true, vendorId: true },
    });
    if (
      staff.some(
        (member) =>
          member.id === concert.eventManagerId ||
          member.concertId === concertId,
      )
    )
      return true;

    const managerIds = staff
      .map((member) => member.managerId)
      .filter((id): id is string => Boolean(id));
    if (managerIds.length > 0) {
      const managedByConcertManager = await this.prisma.staff.findFirst({
        where: { id: { in: managerIds }, concertId },
      });
      if (managedByConcertManager) return true;
    }

    const vendorIds = staff
      .map((member) => member.vendorId)
      .filter((id): id is string => Boolean(id));
    if (vendorIds.length > 0) {
      const acceptedRequirement = await this.prisma.eventRequirement.findFirst({
        where: { concertId, status: 'ACCEPTED', vendorId: { in: vendorIds } },
        select: { id: true },
      });
      if (acceptedRequirement) return true;
    }

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) return false;

    return Boolean(
      await this.prisma.eventRequirement.findFirst({
        where: { concertId, status: 'ACCEPTED', vendorId: vendor.id },
        select: { id: true },
      }),
    );
  }
}
