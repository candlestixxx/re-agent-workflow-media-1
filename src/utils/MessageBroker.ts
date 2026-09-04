import { createClient } from 'redis';

/**
 * Basic Message Broker mapping inter-service events via Redis Pub/Sub.
 */
export class MessageBroker {
  private static publisher = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  private static subscriber = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  private static initialized = false;

  private static initPromise: Promise<void> | null = null;

  public static async init() {
    if (this.initialized) return;

    // Prevent race conditions where init is called simultaneously from different orchestrator flows
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          await this.publisher.connect();
          await this.subscriber.connect();
          this.initialized = true;
          console.log('[MessageBroker] Connected to Redis.');
        } catch (error) {
          console.warn('[MessageBroker] Failed to connect to Redis, dropping payloads as fallback.');
        }
      })();
    }

    return this.initPromise;
  }

  public static async publish(channel: string, message: any) {
    if (!this.initialized) {
      throw new Error('MessageBroker is not initialized. Cannot publish message.');
    }
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  public static async subscribe(channel: string, callback: (message: any) => void) {
    if (!this.initialized) return;
    await this.subscriber.subscribe(channel, (message) => {
      try {
        callback(JSON.parse(message));
      } catch (err) {
        callback(message);
      }
    });
  }
}
