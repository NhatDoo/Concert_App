import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new (require('pg').Pool)({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
    { slug: "music", name: "Nhạc Sống" },
    { slug: "comedy", name: "Hài Kịch" },
    { slug: "nightlife", name: "Nightlife" },
    { slug: "arts", name: "Sân Khấu" },
    { slug: "sports", name: "Thể Thao" },
    { slug: "more", name: "Khác" },
];

async function main() {
    console.log('Seeding categories...');
    for (const cat of CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: cat,
            create: cat,
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
