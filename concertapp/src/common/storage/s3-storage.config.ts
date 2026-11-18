import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export interface S3StorageConfig {
    client: S3Client;
    endpointUrl: URL;
    storageBucket: string;
    publicUrl?: string;
}

export function createS3StorageConfig(configService: ConfigService): S3StorageConfig {
    const endpointUrl = new URL(configService.getOrThrow<string>('AWS_ENDPOINT_URL_S3'));
    if (endpointUrl.protocol !== 'http:' && endpointUrl.protocol !== 'https:') {
        throw new Error('AWS_ENDPOINT_URL_S3 must use HTTP or HTTPS');
    }

    return {
        client: new S3Client({
            endpoint: endpointUrl.toString(),
            region: configService.getOrThrow<string>('AWS_REGION'),
            forcePathStyle: true,
            credentials: {
                accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
            },
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
        }),
        endpointUrl,
        storageBucket: configService.getOrThrow<string>('STORAGE_BUCKET'),
        publicUrl: configService.get<string>('STORAGE_PUBLIC_URL'),
    };
}

export function getStorageObjectUrl(
    publicUrl: string | undefined,
    endpointUrl: URL,
    bucketName: string,
    objectName: string,
): string {
    const baseUrl = new URL(publicUrl || endpointUrl.origin);
    const basePath = baseUrl.pathname.replace(/\/+$/, '');
    const objectPath = [bucketName, ...objectName.split('/')].map(encodeURIComponent).join('/');
    return `${baseUrl.origin}${basePath}/${objectPath}`;
}
