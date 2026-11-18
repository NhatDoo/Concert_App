import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../../domain/service/storage.service.interface';
import {
    createS3StorageConfig,
    getStorageObjectUrl,
    S3StorageConfig,
} from '../../../../common/storage/s3-storage.config';

@Injectable()
export class S3StorageService implements IStorageService {
    private readonly storageConfig: S3StorageConfig;

    constructor(configService: ConfigService) {
        this.storageConfig = createS3StorageConfig(configService);
    }

    async uploadFile(bucketName: string, objectName: string, buffer: Buffer, contentType: string): Promise<string> {
        const key = `${bucketName}/${objectName}`;

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
