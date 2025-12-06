import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const subject = searchParams.get('subject');
        const language = searchParams.get('language');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sortBy = searchParams.get('sortBy') || 'rating';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            tutorProfile: {
                isApproved: true,
            },
        };

        // Apply filters
        const tutorProfileWhere: any = {};

        if (minPrice || maxPrice) {
            tutorProfileWhere.hourlyRate = {};
            if (minPrice) tutorProfileWhere.hourlyRate.gte = parseFloat(minPrice);
            if (maxPrice) tutorProfileWhere.hourlyRate.lte = parseFloat(maxPrice);
        }

        if (language) {
            tutorProfileWhere.languages = {
                has: language,
            };
        }

        if (subject) {
            tutorProfileWhere.subjects = {
                some: {
                    subject: {
                        slug: subject,
                    },
                },
            };
        }

        if (Object.keys(tutorProfileWhere).length > 0) {
            where.tutorProfile = { ...where.tutorProfile, ...tutorProfileWhere };
        }

        // Get total count
        const total = await prisma.user.count({
            where: {
                role: 'TUTOR',
                ...where,
            },
        });

        // Fetch tutors with relations
        const tutors = await prisma.user.findMany({
            where: {
                role: 'TUTOR',
                ...where,
            },
            include: {
                tutorProfile: {
                    include: {
                        subjects: {
                            include: {
                                subject: true,
                            },
                        },
                        _count: {
                            select: {
                                bookings: true,
                            },
                        },
                    },
                },
                reviewsReceived: {
                    select: {
                        rating: true,
                    },
                },
            },
            skip,
            take: limit,
        });

        // Calculate average ratings and format response
        const tutorsWithRatings = tutors.map((tutor) => {
            const ratings = tutor.reviewsReceived.map((r) => r.rating);
            const averageRating = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                : 0;

            return {
                id: tutor.id,
                name: tutor.name,
                email: tutor.email,
                image: tutor.image,
                tutorProfile: tutor.tutorProfile,
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews: ratings.length,
            };
        });

        // Sort results
        let sortedTutors = [...tutorsWithRatings];
        switch (sortBy) {
            case 'price_asc':
                sortedTutors.sort((a, b) => (a.tutorProfile?.hourlyRate || 0) - (b.tutorProfile?.hourlyRate || 0));
                break;
            case 'price_desc':
                sortedTutors.sort((a, b) => (b.tutorProfile?.hourlyRate || 0) - (a.tutorProfile?.hourlyRate || 0));
                break;
            case 'rating':
                sortedTutors.sort((a, b) => b.averageRating - a.averageRating);
                break;
            case 'reviews':
                sortedTutors.sort((a, b) => b.totalReviews - a.totalReviews);
                break;
        }

        return NextResponse.json({
            tutors: sortedTutors,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search tutors' },
            { status: 500 }
        );
    }
}
