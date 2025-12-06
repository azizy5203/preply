import { User, TutorProfile, Subject, Booking, Review, Message, Conversation, Payment } from '@prisma/client';

export type TutorWithProfile = User & {
    tutorProfile: TutorProfile & {
        subjects: Array<{
            subject: Subject;
        }>;
    };
};

export type TutorWithDetails = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    tutorProfile: TutorProfile & {
        subjects: Array<{
            subject: Subject;
        }>;
        _count: {
            bookings: number;
        };
    };
    averageRating: number;
    totalReviews: number;
};

export type BookingWithRelations = Booking & {
    student: User;
    tutor: User;
    tutorProfile: TutorProfile;
    review?: Review | null;
    payment?: Payment | null;
};

export type ReviewWithRelations = Review & {
    student: User;
    booking: Booking;
};

export type ConversationWithDetails = Conversation & {
    participant1: User;
    participant2: User;
    messages: Message[];
    _count: {
        messages: number;
    };
};

export type MessageWithSender = Message & {
    sender: User;
};

export interface SearchFilters {
    subject?: string;
    language?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'reviews';
    page?: number;
    limit?: number;
}

export interface TutorSearchResult {
    tutors: TutorWithDetails[];
    total: number;
    page: number;
    totalPages: number;
}
