const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBooking(bookingId) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tickets: true }
    });

    if (!booking) {
        console.log(`Booking ${bookingId} not found.`);
        return;
    }

    console.log('--- Booking Info ---');
    console.log(`ID: ${booking.id}`);
    console.log(`Status: ${booking.status}`);
    console.log(`Tickets count: ${booking.tickets.length}`);
    booking.tickets.forEach(t => {
        console.log(`  - Ticket ID: ${t.id}, Type: ${t.ticketType}, CheckedIn: ${t.isCheckedIn}`);
    });
}

const bookingId = process.argv[2];
if (bookingId) {
    checkBooking(bookingId)
        .catch(console.error)
        .finally(() => prisma.$disconnect());
} else {
    console.log('Usage: node check_booking.js <bookingId>');
}
