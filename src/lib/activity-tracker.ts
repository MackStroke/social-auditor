/**
 * Activity Tracker — fire-and-forget event logging for feature usage analytics.
 * Events are sent to /api/activity/track and persisted in the activity_events table.
 */

type FeatureName = 'audit' | 'generate_copy' | 'simulate' | 'ab_test' | 'page_view';

/**
 * Track a user activity event. This is a fire-and-forget call — it will
 * never throw or block the caller, even on failure.
 */
export function trackEvent(feature: FeatureName, metadata?: Record<string, unknown>) {
    try {
        // Use navigator.sendBeacon for reliability (survives page unloads),
        // falling back to fetch for broader compatibility.
        const payload = JSON.stringify({ feature, metadata: metadata ?? {} });

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon('/api/activity/track', blob);
        } else {
            fetch('/api/activity/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            }).catch(() => { /* swallow — analytics should never break the app */ });
        }
    } catch {
        // Silently ignore — analytics must never disrupt the user experience
    }
}
