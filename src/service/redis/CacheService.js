const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      // eslint-disable-next-line no-undef
      host: process.env.REDIS_SERVER,
      port: 6379
    });
    this._client.on('error', (error) => {
      console.error(error);
    });
    this._client.connect();
  }
  // Fungsi CacheService.set
  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }
  // Fungsi CacheService.get
  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error('Cache tidak ditemukan');
    return result;
  }

  // Fungsi CacheService.delete
  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;