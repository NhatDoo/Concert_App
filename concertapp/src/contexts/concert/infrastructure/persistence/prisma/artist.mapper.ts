import { Artist } from '../../../domain/entity/artist.entity';

export class ArtistMapper {
    static toDomain(raw: any): Artist {
        return new Artist(
            raw.id,
            raw.name,
            raw.bio ?? '',
            raw.contactInfo ?? ''
        );
    }

    static toPersistence(artist: Artist) {
        return {
            id: artist.getId(),
            name: artist.getName(),
            bio: artist.getBio(),
            contactInfo: artist.getContactInfo()
        };
    }
}
