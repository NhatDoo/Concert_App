const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log("Seeding categories via SQL...");
        const categories = [
            ['music', 'Nhạc Sống', 'Music', 'bg-blue-50 text-blue-600'],
            ['comedy', 'Hài Kịch', 'Mic2', 'bg-purple-50 text-purple-600'],
            ['nightlife', 'Nightlife', 'Star', 'bg-indigo-50 text-indigo-600'],
            ['arts', 'Sân Khấu', 'Tv', 'bg-pink-50 text-pink-600'],
            ['sports', 'Thể Thao', 'Map', 'bg-green-50 text-green-600'],
            ['more', 'Khác', 'Ticket', 'bg-gray-50 text-gray-600'],
        ];

        for (const [slug, name, icon, color] of categories) {
            await client.query(
                `INSERT INTO "Category" (id, slug, name, icon, color, "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET name = $2, icon = $3, color = $4, "updatedAt" = NOW()`,
                [slug, name, icon, color]
            );
        }
        console.log("Categories seeded successfully.");
    } catch (err) {
        console.error("Error seeding categories:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
