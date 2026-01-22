import UserSession from '../models/UserSession.model.js';

class SessionService {
    /**
     * Get location from IP address
     */
    async getLocationFromIP(ip) {
        try {
            // Check if IP is localhost
            const localhostIPs = ['::1', '127.0.0.1', '::ffff:127.0.0.1', 'localhost'];
            if (localhostIPs.includes(ip)) {
                return {
                    country: 'Local',
                    countryCode: 'LC',
                    region: '',
                    regionName: 'Local',
                    city: 'Localhost',
                    zip: '',
                    lat: 0,
                    lon: 0,
                    timezone: 'UTC',
                };
            }
            
            const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone`);
            const data = await response.json();

            if (data.status === 'success') {
                return {
                    country: data.country || 'Unknown',
                    countryCode: data.countryCode || '',
                    region: data.region || '',
                    regionName: data.regionName || '',
                    city: data.city || 'Unknown',
                    zip: data.zip || '',
                    lat: data.lat || 0,
                    lon: data.lon || 0,
                    timezone: data.timezone || 'UTC',
                };
            }

            return {
                country: 'Unknown',
                countryCode: '',
                region: '',
                regionName: '',
                city: 'Unknown',
                zip: '',
                lat: 0,
                lon: 0,
                timezone: 'UTC',
            };
        } catch (error) {
            console.error('Geolocation error:', error);
            return {
                country: 'Unknown',
                city: 'Unknown',
            };
        }
    }

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
        const location = await this.getLocationFromIP(ip);

        const session = await UserSession.create({
            userId,
            sessionId,
            ip,
            userAgent,
            device,
            location,
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
