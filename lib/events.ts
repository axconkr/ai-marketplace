import { EventEmitter } from 'events';

// Declare a global variable to store the shared event emitter
// This ensures that even across Hot Module Replacement (HMR) in development,
// we use the same instance.
const globalForEvents = global as unknown as {
    eventBus: EventEmitter;
};

export const eventBus = globalForEvents.eventBus || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
    globalForEvents.eventBus = eventBus;
}

export const EVENTS = {
    NOTIFICATION_CREATED: 'notification:created',
};
