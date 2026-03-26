import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateArtistCommand, UpdateArtistCommand } from '../artist.command';
import { IARTIST_REPOSITORY } from '../../../domain/repository/artist.repository.interface';
import type { IArtistRepository } from '../../../domain/repository/artist.repository.interface';
import { Artist } from '../../../domain/entity/artist.entity';

@CommandHandler(CreateArtistCommand)
export class CreateArtistHandler implements ICommandHandler<CreateArtistCommand, string> {
    constructor(
        @Inject(IARTIST_REPOSITORY) private readonly repository: IArtistRepository,
    ) { }

    async execute(command: CreateArtistCommand): Promise<string> {
        const { name, bio, contactInfo } = command;

        const id = uuidv4();
        const artist = Artist.create(id, name, bio, contactInfo);

        await this.repository.save(artist);
        return id;
    }
}

@CommandHandler(UpdateArtistCommand)
export class UpdateArtistHandler implements ICommandHandler<UpdateArtistCommand, void> {
    constructor(
        @Inject(IARTIST_REPOSITORY) private readonly repository: IArtistRepository,
    ) { }

    async execute(command: UpdateArtistCommand): Promise<void> {
        const { artistId, name, bio, contactInfo } = command;

        const artist = await this.repository.findById(artistId);
        if (!artist) throw new NotFoundException('Artist not found');

        artist.updateDetails(name, bio, contactInfo);
        await this.repository.save(artist);
    }
}
