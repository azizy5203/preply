import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'TUTOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { userId: session.user.id },
            include: { availability: true },
        });

        if (!tutorProfile) {
            return NextResponse.json({ availability: [] });
        }

        return NextResponse.json(tutorProfile.availability);
    } catch (error) {
        console.error('Failed to fetch availability:', error);
        return NextResponse.json(
            { error: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'TUTOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { availability } = body;

        // Validate input
        if (!Array.isArray(availability)) {
            return NextResponse.json(
                { error: 'Invalid availability data' },
                { status: 400 }
            );
        }

        // Get tutor profile
        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!tutorProfile) {
            return NextResponse.json(
                { error: 'Tutor profile not found' },
                { status: 404 }
            );
        }

        // Transaction: Delete all existing slots and create new ones
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing availability
            await tx.availability.deleteMany({
                where: { tutorProfileId: tutorProfile.id },
            });

            // 2. Create new availability slots
            if (availability.length > 0) {
                await tx.availability.createMany({
                    data: availability.map((slot: any) => ({
                        id: crypto.randomUUID(),
                        tutorProfileId: tutorProfile.id,
                        dayOfWeek: slot.dayOfWeek,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                    })),
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save availability:', error);
        return NextResponse.json(
            { error: 'Failed to save availability' },
            { status: 500 }
        );
    }
}
