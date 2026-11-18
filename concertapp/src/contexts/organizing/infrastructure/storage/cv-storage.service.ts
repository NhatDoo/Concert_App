import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    createS3StorageConfig,
    getStorageObjectUrl,
    S3StorageConfig,
} from '../../../../common/storage/s3-storage.config';

@Injectable()
export class CvStorageService {
    private readonly storageConfig: S3StorageConfig;

    constructor(private readonly configService: ConfigService) {
        this.storageConfig = createS3StorageConfig(this.configService);
    }

    async uploadCv(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
        const key = `staff-cvs/${fileName}`;
        await this.storageConfig.client.send(
            new PutObjectCommand({
                Bucket: this.storageConfig.storageBucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            }),
        );

        return getStorageObjectUrl(
            this.storageConfig.publicUrl,
            this.storageConfig.endpointUrl,
            this.storageConfig.storageBucket,
            key,
        );
    }
}
