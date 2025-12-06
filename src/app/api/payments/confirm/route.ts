import { NextRequest, NextResponse } from 'next/server';
import { confirmMockPayment } from '@/lib/payment';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const confirmPaymentSchema = z.object({
    bookingId: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bookingId } = confirmPaymentSchema.parse(body);

        // Verify booking belongs to user
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking || booking.studentId !== session.user.id) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Confirm mock payment
        const result = await confirmMockPayment(bookingId);

        return NextResponse.json({
            message: 'Payment confirmed successfully (Mock)',
            booking: result.booking,
            payment: result.payment,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Payment confirmation error:', error);
        return NextResponse.json(
            { error: 'Failed to confirm payment' },
            { status: 500 }
        );
    }
}
