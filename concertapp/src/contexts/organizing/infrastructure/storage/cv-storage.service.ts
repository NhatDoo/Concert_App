import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class CvStorageService {
    private readonly minioClient: Minio.Client;
    private readonly endpoint: string;
    private readonly port: number;

    constructor(private readonly configService: ConfigService) {
        this.endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
        this.port = this.configService.get<number>('MINIO_PORT', 9000);

        this.minioClient = new Minio.Client({
            endPoint: this.endpoint,
            port: this.port,
            useSSL: this.configService.get<boolean>('MINIO_USE_SSL', false),
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'admin'),
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'Nhat123456789'),
        });
    }

    async uploadCv(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
        const bucketName = 'staff-cvs';

        // Ensure the bucket exists
        const bucketExists = await this.minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await this.minioClient.makeBucket(bucketName);

            // Set bucket policy to public read
            const publicPolicy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${bucketName}/*`],
                    },
                ],
            };
            await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
        }

        // Upload the file
        await this.minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
            'Content-Type': contentType,
        });

        const protocol = this.configService.get<boolean>('MINIO_USE_SSL', false) ? 'https' : 'http';
        return `${protocol}://${this.endpoint}:${this.port}/${bucketName}/${fileName}`;
    }
}
