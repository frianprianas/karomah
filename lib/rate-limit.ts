
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
        return { success: true };
    }

    if (now - record.lastReset > windowMs) {
        // Reset jika sudah lewat window (misal 1 menit)
        record.count = 1;
        record.lastReset = now;
        return { success: true };
    }

    if (record.count >= limit) {
        return { success: false };
    }

    record.count += 1;
    return { success: true };
}
