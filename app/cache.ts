import { createClient } from "redis";
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../constants/cache";

export default interface Cache {
  get(key: string): Promise<string | null>;
  pluck(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
}

export class RedisCache implements Cache {
  private client;

  constructor(client: any) {
    this.client = client;
  }
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }
  async pluck(key: string): Promise<string | null> {
    return await this.client.getDel(key);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.client.set(key, value, { NX: true, EX: ttl });
  }

  static async initFromEnv(): Promise<RedisCache> {
    const client = createClient({
      password: REDIS_PASSWORD,
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });
    await client.connect();

    return new RedisCache(client);
  }
}
