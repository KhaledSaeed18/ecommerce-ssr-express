import UserSession from '../models/UserSession.model.js';

class SessionService {
    /**
     * Parse user agent to extract device info
     */
    parseUserAgent(userAgent) {
        const device = {
            browser: 'Unknown',
            os: 'Unknown',
        };

        // Simple browser detection
        if (userAgent.includes('Chrome')) device.browser = 'Chrome';
        else if (userAgent.includes('Firefox')) device.browser = 'Firefox';
        else if (userAgent.includes('Safari')) device.browser = 'Safari';
        else if (userAgent.includes('Edge')) device.browser = 'Edge';

        // Simple OS detection
        if (userAgent.includes('Windows')) device.os = 'Windows';
        else if (userAgent.includes('Mac')) device.os = 'macOS';
        else if (userAgent.includes('Linux')) device.os = 'Linux';
        else if (userAgent.includes('Android')) device.os = 'Android';
        else if (userAgent.includes('iOS')) device.os = 'iOS';

        return device;
    }

    /**
     * Create a new session record
     */
    async createSession(userId, sessionId, ip, userAgent) {
        const device = this.parseUserAgent(userAgent);

        const session = await UserSession.create({
            userId,
            sessionId,
            ip,
            userAgent,
            device,
            location: {
                country: 'Unknown',
                city: 'Unknown',
            },
            lastSeenAt: new Date(),
            isRevoked: false,
        });

        return session;
    }

    /**
     * Get session by session ID
     */
    async getSession(sessionId) {
        return await UserSession.findOne({ sessionId });
    }

    /**
     * Update session last seen time
     */
    async updateLastSeen(sessionId) {
        await UserSession.findOneAndUpdate(
            { sessionId },
            { lastSeenAt: new Date() }
        );
    }

    /**
     * Revoke a session (single device logout)
     */
    async revokeSession(sessionId) {
        await UserSession.findOneAndUpdate(
            { sessionId },
            {
                isRevoked: true,
                revokedAt: new Date(),
            }
        );
    }

    /**
     * Revoke all sessions for a user (logout all devices)
     */
    async revokeAllUserSessions(userId) {
        await UserSession.updateMany(
            { userId, isRevoked: false },
            {
                isRevoked: true,
                revokedAt: new Date(),
            }
        );
    }

    /**
     * Get all active sessions for a user
     */
    async getUserActiveSessions(userId) {
        return await UserSession.find({
            userId,
            isRevoked: false,
        }).sort({ lastSeenAt: -1 });
    }

    /**
     * Validate session
     */
    async validateSession(sessionId) {
        const session = await this.getSession(sessionId);

        if (!session) {
            return { valid: false, reason: 'Session not found' };
        }

        if (session.isRevoked) {
            return { valid: false, reason: 'Session revoked' };
        }

        return { valid: true, session };
    }
}

export default new SessionService();
