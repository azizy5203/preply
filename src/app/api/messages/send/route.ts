import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const sendMessageSchema = z.object({
    conversationId: z.string().optional(),
    recipientId: z.string(),
    content: z.string().min(1),
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
        const { conversationId, recipientId, content } = sendMessageSchema.parse(body);

        let conversation;

        if (conversationId) {
            // Use existing conversation
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });
        } else {
            // Find or create conversation
            conversation = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { participant1Id: session.user.id, participant2Id: recipientId },
                        { participant1Id: recipientId, participant2Id: session.user.id },
                    ],
                },
            });

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        participant1Id: session.user.id,
                        participant2Id: recipientId,
                    },
                });
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: session.user.id,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Update conversation lastMessageAt
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
