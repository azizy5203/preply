import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all conversations for the user
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1Id: session.user.id },
                    { participant2Id: session.user.id },
                ],
            },
            include: {
                participant1: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                participant2: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                lastMessageAt: 'desc',
            },
        });

        // Get unread counts for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: session.user!.id },
                        isRead: false,
                    },
                });

                return {
                    ...conv,
                    unreadCount,
                    otherParticipant:
                        conv.participant1Id === session.user!.id
                            ? conv.participant2
                            : conv.participant1,
                };
            })
        );

        return NextResponse.json(conversationsWithUnread);
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { error: 'Failed to get conversations' },
            { status: 500 }
        );
    }
}
