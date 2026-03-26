import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizingInfrastructureModule } from './infrastructure/organizing-infrastructure.module';
import { OrganizingController } from './presentation/http/organizing.controller';
import { AssignLocationHandler } from './application/commands/handlers/assign-location.handler';
import { AddLogisticsTaskHandler, UpdateLogisticsStatusHandler } from './application/commands/handlers/logistics.handler';
import { AddEquipmentHandler, AddStaffHandler } from './application/commands/handlers/equipment-staff.handler';
import { AssignStaffTaskHandler, UpdateStaffTaskHandler } from './application/commands/handlers/staff-task.handler';

export const CommandHandlers = [
    AssignLocationHandler,
    AddLogisticsTaskHandler,
    UpdateLogisticsStatusHandler,
    AddEquipmentHandler,
    AddStaffHandler,
    AssignStaffTaskHandler,
    UpdateStaffTaskHandler
];

@Module({
    imports: [
        CqrsModule,
        OrganizingInfrastructureModule
    ],
    controllers: [
        OrganizingController
    ],
    providers: [
        ...CommandHandlers
    ]
})
export class OrganizingModule { }
