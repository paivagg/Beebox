import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        // Performance Monitoring
        tracesSampleRate: 1.0,
    });
} else {
    console.warn("Sentry DSN not found in backend. Error tracking disabled.");
}
