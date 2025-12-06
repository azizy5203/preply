import { prisma } from './prisma';

export async function confirmMockPayment(bookingId: string) {
    // Update booking status to CONFIRMED
    const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
    });

    // Create mock payment record
    const payment = await prisma.payment.create({
        data: {
            bookingId,
            amount: booking.totalPrice,
            status: 'MOCK_SUCCESS',
            method: 'MOCK',
        },
    });

    return { booking, payment };
}

export function calculateLessonPrice(hourlyRate: number, duration: number): number {
    return (hourlyRate * duration) / 60;
}

// Placeholder for future Stripe integration
export async function createStripePaymentIntent(amount: number, bookingId: string) {
    throw new Error('Stripe integration coming soon. Currently using mock payments.');
}
