import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizingInfrastructureModule } from './infrastructure/organizing-infrastructure.module';
import { OrganizingController } from './presentation/http/organizing.controller';
import { VendorController } from './presentation/http/vendor.controller';
import { AssignLocationHandler } from './application/commands/handlers/assign-location.handler';
import { AddLogisticsTaskHandler, UpdateLogisticsStatusHandler } from './application/commands/handlers/logistics.handler';
import { AddEquipmentHandler, AddStaffHandler } from './application/commands/handlers/equipment-staff.handler';
import { AssignStaffTaskHandler, UpdateStaffTaskHandler } from './application/commands/handlers/staff-task.handler';
import { BulkAddStaffHandler } from './application/commands/handlers/bulk-add-staff.handler';
import { InviteStaffHandler } from './application/commands/handlers/invite-staff.handler';
import { CreateJobPostHandler } from './application/commands/handlers/create-job-post.handler';
import { UpdateJobPostHandler } from './application/commands/handlers/update-job-post.handler';
import { DeleteJobPostHandler } from './application/commands/handlers/delete-job-post.handler';
import { UpdateStaffProfileHandler } from './application/commands/handlers/update-staff-profile.handler';
import { CreateEventRequirementHandler } from './application/commands/handlers/create-event-requirement.handler';
import { CreateZoneHandler } from './application/commands/handlers/create-zone.handler';
import { CreateShiftHandler } from './application/commands/handlers/create-shift.handler';
import { AssignStaffToShiftHandler } from './application/commands/handlers/assign-staff-shift.handler';
import { GetOrganizerStatsHandler } from './application/queries/handlers/get-organizer-stats.handler';
import { GetConcertStaffHandler } from './application/queries/handlers/get-concert-staff.handler';
import { GetJobsHandler } from './application/queries/handlers/get-jobs.handler';
import { GetJobByIdHandler } from './application/queries/handlers/get-job-by-id.handler';
import { GetRequirementsHandler } from './application/queries/handlers/get-requirements.handler';
import { CreateStaffOnRegistrationHandler } from './application/events/handlers/create-staff-on-registration.handler';

export const CommandHandlers = [
    AssignLocationHandler,
    AddLogisticsTaskHandler,
    UpdateLogisticsStatusHandler,
    AddEquipmentHandler,
    AddStaffHandler,
    AssignStaffTaskHandler,
    UpdateStaffTaskHandler,
    BulkAddStaffHandler,
    InviteStaffHandler,
    CreateJobPostHandler,
    UpdateJobPostHandler,
    DeleteJobPostHandler,
    UpdateStaffProfileHandler,
    CreateEventRequirementHandler,
    CreateZoneHandler,
    CreateShiftHandler,
    AssignStaffToShiftHandler
];

export const QueryHandlers = [
    GetOrganizerStatsHandler,
    GetConcertStaffHandler,
    GetJobsHandler,
    GetJobByIdHandler,
    GetRequirementsHandler
];

export const EventHandlers = [
    CreateStaffOnRegistrationHandler
];

@Module({
    imports: [
        CqrsModule,
        OrganizingInfrastructureModule
    ],
    controllers: [
        OrganizingController,
        VendorController
    ],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        ...EventHandlers
    ]
})
export class OrganizingModule { }
