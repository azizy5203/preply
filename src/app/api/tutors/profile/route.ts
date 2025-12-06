import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
    bio: z.string().optional(),
    hourlyRate: z.number().min(5).max(500).optional(),
    languages: z.array(z.string()).optional(),
    nationality: z.string().optional(),
    teachingApproach: z.string().optional(),
    introVideoUrl: z.string().url().optional(),
    subjectIds: z.array(z.string()).optional(),
});

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'TUTOR') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const data = updateProfileSchema.parse(body);

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

        // Update tutor profile
        const { subjectIds, ...profileData } = data;

        await prisma.tutorProfile.update({
            where: { id: tutorProfile.id },
            data: profileData,
        });

        // Update subjects if provided
        if (subjectIds) {
            // Delete existing subject associations
            await prisma.tutorSubject.deleteMany({
                where: { tutorProfileId: tutorProfile.id },
            });

            // Create new associations
            await prisma.tutorSubject.createMany({
                data: subjectIds.map((subjectId) => ({
                    tutorProfileId: tutorProfile.id,
                    subjectId,
                })),
            });
        }

        // Fetch updated profile
        const updatedProfile = await prisma.tutorProfile.findUnique({
            where: { id: tutorProfile.id },
            include: {
                subjects: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
