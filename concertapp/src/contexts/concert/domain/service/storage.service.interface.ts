export interface IStorageService {
    uploadFile(bucketName: string, objectName: string, buffer: Buffer, contentType: string): Promise<string>;
}

export const ISTORAGE_SERVICE = Symbol('IStorageService');
