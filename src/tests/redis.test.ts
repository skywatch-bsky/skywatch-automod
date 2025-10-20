import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the 'redis' module in a way that avoids hoisting issues.
// The mock implementation is self-contained.
vi.mock('redis', () => {
  const mockClient = {
    on: vi.fn(),
    connect: vi.fn(),
    quit: vi.fn(),
    exists: vi.fn(),
    set: vi.fn(),
  };
  return {
    createClient: vi.fn(() => mockClient),
  };
});

// Import the mocked redis first to get a reference to the mock client
import { createClient } from 'redis';
const mockRedisClient = createClient();

// Import the modules to be tested
import {
  tryClaimPostLabel,
  tryClaimAccountLabel,
  connectRedis,
  disconnectRedis,
} from '../redis.js';
import { logger } from '../logger.js';

// Suppress logger output during tests
vi.mock('../logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Redis Cache Logic', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection', () => {
    it('should call redisClient.connect on connectRedis', async () => {
      await connectRedis();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should call redisClient.quit on disconnectRedis', async () => {
      await disconnectRedis();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe('tryClaimPostLabel', () => {
    it('should return true and set key if key does not exist', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');
      const result = await tryClaimPostLabel('at://uri', 'test-label');
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'post-label:at://uri:test-label',
        '1',
        { NX: true, EX: 60 * 60 * 24 * 7 }
      );
    });

    it('should return false if key already exists', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue(null);
      const result = await tryClaimPostLabel('at://uri', 'test-label');
      expect(result).toBe(false);
    });

    it('should return true and log warning on Redis error', async () => {
      const redisError = new Error('Redis down');
      vi.mocked(mockRedisClient.set).mockRejectedValue(redisError);
      const result = await tryClaimPostLabel('at://uri', 'test-label');
      expect(result).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        { err: redisError, atURI: 'at://uri', label: 'test-label' },
        'Error claiming post label in Redis, allowing through'
      );
    });
  });

  describe('tryClaimAccountLabel', () => {
    it('should return true and set key if key does not exist', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');
      const result = await tryClaimAccountLabel('did:plc:123', 'test-label');
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'account-label:did:plc:123:test-label',
        '1',
        { NX: true, EX: 60 * 60 * 24 * 7 }
      );
    });

    it('should return false if key already exists', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue(null);
      const result = await tryClaimAccountLabel('did:plc:123', 'test-label');
      expect(result).toBe(false);
    });
  });
});