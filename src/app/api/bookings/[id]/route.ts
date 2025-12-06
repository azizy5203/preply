import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateBookingSchema = z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status } = updateBookingSchema.parse(body);

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                tutor: true,
                student: true,
                tutorProfile: true, // Need this to access hourlyRate if needed (though not used here) or just for context
            },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Verify ownership
        // Only tutor can confirm/cancel (or maybe student can cancel pending?)
        // For MVP, enable Tutor to updated status.
        const isTutor = booking.tutorId === session.user.id;
        const isStudent = booking.studentId === session.user.id;

        if (!isTutor && !isStudent) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (isStudent && status !== 'CANCELLED') {
            // Students can only cancel
            return NextResponse.json({ error: 'Students can only cancel bookings' }, { status: 403 });
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status },
        });

        // Create notification
        let notificationUserId = isTutor ? booking.studentId : booking.tutorId;
        let title = '';
        let message = '';
        let type = 'INFO';

        if (status === 'CONFIRMED') {
            title = 'Booking Confirmed';
            message = `Your lesson with ${booking.tutor.name} has been confirmed!`;
            type = 'SUCCESS';
        } else if (status === 'CANCELLED') {
            title = 'Booking Cancelled';
            message = `The lesson scheduled for ${booking.dateTime.toLocaleString()} has been cancelled.`;
            type = 'WARNING';
        }

        if (title) {
            await prisma.notification.create({
                data: {
                    userId: notificationUserId,
                    title,
                    message,
                    type,
                    link: isTutor ? `/tutor/bookings` : `/student/lessons`,
                }
            });
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
        console.error('Booking update error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
