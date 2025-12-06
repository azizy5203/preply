import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.tutorSubject.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.tutorProfile.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create subjects
    console.log('📚 Creating subjects...');
    const subjects = await Promise.all([
        prisma.subject.create({ data: { name: 'Mathematics', slug: 'mathematics', icon: '🔢' } }),
        prisma.subject.create({ data: { name: 'English', slug: 'english', icon: '📖' } }),
        prisma.subject.create({ data: { name: 'Spanish', slug: 'spanish', icon: '🇪🇸' } }),
        prisma.subject.create({ data: { name: 'French', slug: 'french', icon: '🇫🇷' } }),
        prisma.subject.create({ data: { name: 'Physics', slug: 'physics', icon: '⚛️' } }),
        prisma.subject.create({ data: { name: 'Chemistry', slug: 'chemistry', icon: '🧪' } }),
        prisma.subject.create({ data: { name: 'Programming', slug: 'programming', icon: '💻' } }),
        prisma.subject.create({ data: { name: 'Music', slug: 'music', icon: '🎵' } }),
        prisma.subject.create({ data: { name: 'Art', slug: 'art', icon: '🎨' } }),
        prisma.subject.create({ data: { name: 'Business', slug: 'business', icon: '💼' } }),
        prisma.subject.create({ data: { name: 'SAT Prep', slug: 'sat-prep', icon: '📝' } }),
        prisma.subject.create({ data: { name: 'IELTS', slug: 'ielts', icon: '🎓' } }),
    ]);

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create demo students
    console.log('👨‍🎓 Creating students...');
    const students = await Promise.all([
        prisma.user.create({
            data: {
                name: 'John Smith',
                email: 'john@example.com',
                password: hashedPassword,
                role: Role.STUDENT,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Emma Johnson',
                email: 'emma@example.com',
                password: hashedPassword,
                role: Role.STUDENT,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Michael Chen',
                email: 'michael@example.com',
                password: hashedPassword,
                role: Role.STUDENT,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Sarah Williams',
                email: 'sarah@example.com',
                password: hashedPassword,
                role: Role.STUDENT,
            },
        }),
    ]);

    // Create demo tutors
    console.log('👨‍🏫 Creating tutors...');
    const tutorData = [
        {
            name: 'Dr. Maria Garcia',
            email: 'maria@tutor.com',
            bio: 'PhD in Mathematics with 15 years of teaching experience. Specialized in calculus and algebra.',
            hourlyRate: 45,
            languages: ['English', 'Spanish'],
            nationality: 'Spain',
            teachingApproach: 'I focus on building strong fundamentals and practical problem-solving skills.',
            subjectIds: [subjects[0].id, subjects[4].id], // Math, Physics
            yearsOfExperience: 15,
        },
        {
            name: 'James Wilson',
            email: 'james@tutor.com',
            bio: 'Native English speaker with TEFL certification. Helping students worldwide improve their English.',
            hourlyRate: 35,
            languages: ['English', 'French'],
            nationality: 'United Kingdom',
            teachingApproach: 'Conversational approach with focus on practical communication skills.',
            subjectIds: [subjects[1].id, subjects[11].id], // English, IELTS
            yearsOfExperience: 8,
        },
        {
            name: 'Sophie Dubois',
            email: 'sophie@tutor.com',
            bio: 'French language expert from Paris. Teaching French at all levels for the past 10 years.',
            hourlyRate: 38,
            languages: ['French', 'English', 'Spanish'],
            nationality: 'France',
            teachingApproach: 'Immersive learning with cultural context and real-life scenarios.',
            subjectIds: [subjects[3].id], // French
            yearsOfExperience: 10,
        },
        {
            name: 'David Kim',
            email: 'david@tutor.com',
            bio: 'Software engineer turned educator. Teaching programming from basics to advanced concepts.',
            hourlyRate: 55,
            languages: ['English', 'Korean'],
            nationality: 'USA',
            teachingApproach: 'Hands-on project-based learning with real-world applications.',
            subjectIds: [subjects[6].id], // Programming
            yearsOfExperience: 12,
        },
        {
            name: 'Ana Rodriguez',
            email: 'ana@tutor.com',
            bio: 'Native Spanish speaker from Argentina. Specializing in conversational Spanish and business Spanish.',
            hourlyRate: 32,
            languages: ['Spanish', 'English', 'Portuguese'],
            nationality: 'Argentina',
            teachingApproach: 'Interactive lessons focused on real conversation and cultural immersion.',
            subjectIds: [subjects[2].id], // Spanish
            yearsOfExperience: 7,
        },
        {
            name: 'Prof. Robert Brown',
            email: 'robert@tutor.com',
            bio: 'Chemistry professor at a leading university. Making chemistry fun and understandable.',
            hourlyRate: 50,
            languages: ['English'],
            nationality: 'Canada',
            teachingApproach: 'Visual demonstrations and practical experiments to solidify concepts.',
            subjectIds: [subjects[5].id], // Chemistry
            yearsOfExperience: 20,
        },
        {
            name: 'Lisa Anderson',
            email: 'lisa@tutor.com',
            bio: 'SAT prep specialist with 95% of students improving their scores by 200+ points.',
            hourlyRate: 60,
            languages: ['English'],
            nationality: 'USA',
            teachingApproach: 'Strategic test-taking techniques combined with content mastery.',
            subjectIds: [subjects[10].id, subjects[0].id], // SAT Prep, Math
            yearsOfExperience: 11,
        },
        {
            name: 'Marco Rossi',
            email: 'marco@tutor.com',
            bio: 'Professional musician and music theory teacher. Helping students discover the joy of music.',
            hourlyRate: 40,
            languages: ['English', 'Italian'],
            nationality: 'Italy',
            teachingApproach: 'Combining technique with creativity to develop well-rounded musicians.',
            subjectIds: [subjects[7].id], // Music
            yearsOfExperience: 14,
        },
        {
            name: 'Emily Taylor',
            email: 'emily@tutor.com',
            bio: 'Art teacher with MFA degree. Teaching various forms of visual arts and art history.',
            hourlyRate: 42,
            languages: ['English'],
            nationality: 'Australia',
            teachingApproach: 'Encouraging creative expression while building technical skills.',
            subjectIds: [subjects[8].id], // Art
            yearsOfExperience: 9,
        },
        {
            name: 'Thomas Mueller',
            email: 'thomas@tutor.com',
            bio: 'MBA graduate with 15 years in business. Teaching business fundamentals and strategy.',
            hourlyRate: 48,
            languages: ['English', 'German'],
            nationality: 'Germany',
            teachingApproach: 'Case study method with real business scenarios and practical insights.',
            subjectIds: [subjects[9].id], // Business
            yearsOfExperience: 15,
        },
    ];

    const tutors = [];
    for (const tutor of tutorData) {
        const user = await prisma.user.create({
            data: {
                name: tutor.name,
                email: tutor.email,
                password: hashedPassword,
                role: Role.TUTOR,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random`,
            },
        });

        const profile = await prisma.tutorProfile.create({
            data: {
                userId: user.id,
                bio: tutor.bio,
                hourlyRate: tutor.hourlyRate,
                languages: tutor.languages,
                nationality: tutor.nationality,
                teachingApproach: tutor.teachingApproach,
                yearsOfExperience: tutor.yearsOfExperience,
                isApproved: true,
            },
        });

        // Connect subjects
        for (const subjectId of tutor.subjectIds) {
            await prisma.tutorSubject.create({
                data: {
                    tutorProfileId: profile.id,
                    subjectId,
                },
            });
        }

        // Create availability (example schedule)
        const days = [1, 2, 3, 4, 5]; // Mon-Fri
        for (const day of days) {
            await prisma.availability.create({
                data: {
                    tutorProfileId: profile.id,
                    dayOfWeek: day,
                    startTime: '09:00',
                    endTime: '17:00',
                },
            });
        }

        tutors.push({ user, profile });
    }

    console.log(`✅ Created ${tutors.length} tutors`);

    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviewTexts = [
        'Excellent teacher! Very patient and explains concepts clearly.',
        'Great tutor, highly recommended! My skills improved significantly.',
        'Very knowledgeable and professional. Worth every penny.',
        'Patient and understanding. Makes learning enjoyable.',
        'Fantastic lessons! I look forward to each session.',
        'Best tutor I have ever had. Results speak for themselves.',
        'Very helpful and always prepared for lessons.',
        'Engaging teaching style that keeps you motivated.',
        'Explains difficult concepts in an easy-to-understand way.',
        'Highly professional and punctual. Great experience overall.',
    ];

    let reviewCount = 0;
    for (let i = 0; i < tutors.length; i++) {
        const tutor = tutors[i];
        const numReviews = Math.floor(Math.random() * 10) + 5; // 5-14 reviews per tutor

        for (let j = 0; j < numReviews; j++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const rating = Math.random() > 0.7 ? 5 : Math.random() > 0.5 ? 4 : Math.random() > 0.3 ? 3 : 4;
            const comment = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

            // Create a past booking first
            const booking = await prisma.booking.create({
                data: {
                    studentId: student.id,
                    tutorId: tutor.user.id,
                    tutorProfileId: tutor.profile.id,
                    dateTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in past 30 days
                    duration: 60,
                    status: 'COMPLETED',
                    totalPrice: tutor.profile.hourlyRate,
                },
            });

            await prisma.review.create({
                data: {
                    bookingId: booking.id,
                    studentId: student.id,
                    tutorId: tutor.user.id,
                    rating,
                    comment,
                },
            });

            // Create payment for completed booking
            await prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    amount: tutor.profile.hourlyRate,
                    status: 'MOCK_SUCCESS',
                    method: 'MOCK',
                },
            });

            reviewCount++;
        }
    }

    console.log(`✅ Created ${reviewCount} reviews`);

    // Create some upcoming bookings
    console.log('📅 Creating upcoming bookings...');
    for (let i = 0; i < 10; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const tutor = tutors[Math.floor(Math.random() * tutors.length)];
        const futureDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Next 7 days

        await prisma.booking.create({
            data: {
                studentId: student.id,
                tutorId: tutor.user.id,
                tutorProfileId: tutor.profile.id,
                dateTime: futureDate,
                duration: 60,
                status: 'CONFIRMED',
                totalPrice: tutor.profile.hourlyRate,
            },
        });
    }

    // Create some favorites
    console.log('❤️  Creating favorites...');
    for (const student of students) {
        const favoriteTutors = tutors.slice(0, Math.floor(Math.random() * 3) + 2);
        for (const tutor of favoriteTutors) {
            await prisma.favorite.create({
                data: {
                    studentId: student.id,
                    tutorId: tutor.user.id,
                },
            });
        }
    }

    // Create sample conversations
    console.log('💬 Creating conversations...');
    for (let i = 0; i < 5; i++) {
        const student = students[i % students.length];
        const tutor = tutors[i % tutors.length];

        const conversation = await prisma.conversation.create({
            data: {
                participant1Id: student.id,
                participant2Id: tutor.user.id,
                lastMessageAt: new Date(),
            },
        });

        // Add some messages
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: student.id,
                content: 'Hi! I am interested in booking a lesson with you.',
                isRead: true,
            },
        });

        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: tutor.user.id,
                content: 'Hello! I would be happy to help. What subject are you interested in?',
                isRead: true,
            },
        });
    }

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('🎉 Summary:');
    console.log(`   - ${subjects.length} subjects`);
    console.log(`   - ${students.length} students`);
    console.log(`   - ${tutors.length} tutors`);
    console.log(`   - ${reviewCount} reviews`);
    console.log('');
    console.log('📧 Demo Accounts:');
    console.log('   Student: john@example.com / password123');
    console.log('   Tutor: maria@tutor.com / password123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
