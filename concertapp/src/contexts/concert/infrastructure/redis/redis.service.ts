import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;

    onModuleInit() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            // You can add password or TLS config here if needed
        });

        this.redisClient.on('error', (err) => {
            console.error('Redis client error', err);
        });
    }

    onModuleDestroy() {
        this.redisClient.quit();
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        } else {
            await this.redisClient.set(key, JSON.stringify(value));
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redisClient.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return data as T;
        }
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}
