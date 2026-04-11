import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new (require('pg').Pool)({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
    { slug: "music", name: "Nhạc Sống", icon: "Music", color: "bg-blue-50 text-blue-600" },
    { slug: "comedy", name: "Hài Kịch", icon: "Mic2", color: "bg-purple-50 text-purple-600" },
    { slug: "nightlife", name: "Nightlife", icon: "Star", color: "bg-indigo-50 text-indigo-600" },
    { slug: "arts", name: "Sân Khấu", icon: "Tv", color: "bg-pink-50 text-pink-600" },
    { slug: "sports", name: "Thể Thao", icon: "Map", color: "bg-green-50 text-green-600" },
    { slug: "more", name: "Khác", icon: "Ticket", color: "bg-gray-50 text-gray-600" },
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
