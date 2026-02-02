import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { eventBus, EVENTS } from '@/lib/events';

/**
 * GET /api/notifications/stream
 * SSE endpoint for real-time notifications
 */
export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const user = await requireAuth(request);
        const userId = user.userId;

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                // Heartbeat interval to keep connection alive
                const heartbeat = setInterval(() => {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                }, 30000);

                // Define the listener
                const onNotification = (notification: any) => {
                    // Only send if the notification belongs to this user
                    if (notification.user_id === userId) {
                        const data = JSON.stringify(notification);
                        controller.enqueue(encoder.encode(`event: notification\ndata: ${data}\n\n`));
                    }
                };

                // Subscribe to events
                eventBus.on(EVENTS.NOTIFICATION_CREATED, onNotification);

                // Cleanup on close
                request.signal.addEventListener('abort', () => {
                    clearInterval(heartbeat);
                    eventBus.off(EVENTS.NOTIFICATION_CREATED, onNotification);
                    controller.close();
                });
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
