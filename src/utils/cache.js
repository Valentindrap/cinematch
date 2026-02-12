// TMDB Data Cache with expiration
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days
const CACHE_PREFIX = 'tmdb_cache_';

export const cacheManager = {
    set: (key, data) => {
        try {
            const cacheItem = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    },

    get: (key) => {
        try {
            const cached = localStorage.getItem(CACHE_PREFIX + key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age > CACHE_DURATION) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }

            return data;
        } catch (e) {
            console.warn('Cache retrieval failed:', e);
            return null;
        }
    },

    has: (key) => {
        return cacheManager.get(key) !== null;
    },

    clear: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    },

    clearExpired: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(CACHE_PREFIX)) {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const { timestamp } = JSON.parse(cached);
                        if (Date.now() - timestamp > CACHE_DURATION) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            });
        } catch (e) {
            console.warn('Cache cleanup failed:', e);
        }
    },
};

// Run cleanup on initialization
cacheManager.clearExpired();
