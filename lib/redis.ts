import { Redis } from 'ioredis';

/**
 * Redis client singleton
 * Initializes connection to Redis server if REDIS_URL is available
 * Falls back to null if not available or connection fails
 */
const getRedisClient = (): Redis | null => {
  const url = process.env.REDIS_URL;
  
  if (!url) {
    console.warn('REDIS_URL not set, using in-memory fallback');
    return null;
  }

  try {
    const client = new Redis(url);
    
    client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    return client;
  } catch (error) {
    console.error('Redis initialization failed:', error);
    return null;
  }
};

export const redis = getRedisClient();

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
  return redis !== null;
};
