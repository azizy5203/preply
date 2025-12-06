import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20,
    });

    return NextResponse.json(notifications);
}

export async function PATCH(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all as read
    // Or specific ID if provided in body? For now simple "Mark all as read" logic
    // Let's support specific IDs if valid body provided, else all.

    try {
        const body = await request.json().catch(() => ({}));
        const { id } = body;

        if (id) {
            await prisma.notification.update({
                where: { id, userId: session.user.id },
                data: { isRead: true }
            });
        } else {
            await prisma.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true }
            });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
