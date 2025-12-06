import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createBookingSchema = z.object({
    tutorId: z.string(),
    dateTime: z.string(),
    duration: z.number().int().min(30).max(120),
    notes: z.string().optional(),
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
        const { tutorId, dateTime, duration, notes } = createBookingSchema.parse(body);

        // Get tutor profile to get hourly rate
        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { userId: tutorId },
        });

        if (!tutorProfile) {
            return NextResponse.json(
                { error: 'Tutor not found' },
                { status: 404 }
            );
        }

        // Calculate total price
        const totalPrice = (tutorProfile.hourlyRate * duration) / 60;

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                studentId: session.user.id,
                tutorId,
                tutorProfileId: tutorProfile.id,
                dateTime: new Date(dateTime),
                duration,
                totalPrice,
                notes,
                status: 'PENDING',
            },
            include: {
                // tutor: true, // Removed as it conflicts with schema
                tutorProfile: true,
            },
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Booking creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}
