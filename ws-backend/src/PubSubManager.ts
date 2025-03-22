import { createClient, RedisClientType } from 'redis';

export class PubSubManager {
    private static instance: PubSubManager;
    private redisClient: RedisClientType;
    private subscriptions: Map<string, Set<string>>; // Map<gameId, Set<userId>>

    // Private constructor to prevent direct construction calls with the `new` operator
    private constructor() {
        // Create a Redis client and connect to the Redis server
        this.redisClient = createClient({ url: process.env.REDIS_URL });
        this.redisClient.connect();
        this.subscriptions = new Map();
    }

    // The static method that controls the access to the singleton instance
    public static getInstance(): PubSubManager {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }

    /**
     * Subscribe a user to a game.
     * @param userId - The ID of the user subscribing.
     * @param gameId - The ID of the game to subscribe to.
     */
    public userSubscribe(userId: string, gameId: string) {
        if (!this.subscriptions.has(gameId)) {
            this.subscriptions.set(gameId, new Set());
        }
        this.subscriptions.get(gameId)?.add(userId);

        // Subscribe to the Redis channel if this is the first user for this game
        if (this.subscriptions.get(gameId)?.size === 1) {
            this.redisClient.subscribe(gameId, (message) => {
                this.handleMessage(gameId, message);
            });
            console.log(`Subscribed to Redis channel: ${gameId}`);
        }
    }

    /**
     * Unsubscribe a user from a game.
     * @param userId - The ID of the user unsubscribing.
     * @param gameId - The ID of the game to unsubscribe from.
     */
    public userUnsubscribe(userId: string, gameId: string) {
        this.subscriptions.get(gameId)?.delete(userId);

        // Unsubscribe from the Redis channel if no users are left for this game
        if (this.subscriptions.get(gameId)?.size === 0) {
            this.redisClient.unsubscribe(gameId);
            console.log(`Unsubscribed from Redis channel: ${gameId}`);
        }
    }

    /**
     * Handle messages received from the Redis channel.
     * @param gameId - The ID of the game.
     * @param message - The message received (game state or move).
     */
    private handleMessage(gameId: string, message: string) {
        console.log(`Message received on channel ${gameId}: ${message}`);

        // Broadcast the message to all users subscribed to this game
        this.subscriptions.get(gameId)?.forEach((userId) => {
            console.log(`Sending message to user ${userId} for game ${gameId}`);
            // Here, you would send the message to the user (e.g., via WebSocket or another mechanism)
            this.sendMessageToUser(userId, message);
        });
    }

    /**
     * Publish a message (game state or move) to a game channel.
     * @param gameId - The ID of the game.
     * @param message - The message to publish (e.g., game state or move).
     */
    public async publish(gameId: string, message: string) {
        await this.redisClient.publish(gameId, message);
        console.log(`Published message to Redis channel ${gameId}: ${message}`);
    }

    /**
     * Send a message to a specific user.
     * @param userId - The ID of the user.
     * @param message - The message to send.
     */
    private sendMessageToUser(userId: string, message: string) {
        // Implement logic to send the message to the user (e.g., via WebSocket)
        console.log(`Sending message to user ${userId}: ${message}`);
        // Example: wsServer.sendToUser(userId, message);
    }

    // Cleanup on instance destruction
    public async disconnect() {
        await this.redisClient.quit();
    }
}

// // Import the necessary module from the 'redis' package
// import { createClient, RedisClientType } from 'redis';

// export class PubSubManager {
//     private static instance: PubSubManager;
//     private redisClient: RedisClientType;
//     private subscriptions: Map<string, string[]>;

//     // Private constructor to prevent direct construction calls with the `new` operator
//     private constructor() {
//         // Create a Redis client and connect to the Redis server

//         this.redisClient = createClient({url : process.env.REDIS_URL});
//         this.redisClient.connect();
//         this.subscriptions = new Map();
//     }

//     // The static method that controls the access to the singleton instance
//     public static getInstance(): PubSubManager {
//         if (!PubSubManager.instance) {
//             PubSubManager.instance = new PubSubManager();
//         }
//         return PubSubManager.instance;
//     }

//     public userSubscribe(userId: string, stock: string) {
//         if (!this.subscriptions.has(stock)) {
//             this.subscriptions.set(stock, []);
//         }
//         this.subscriptions.get(stock)?.push(userId);

//         if (this.subscriptions.get(stock)?.length === 1) {
//             this.redisClient.subscribe(stock, (message) => {
//                 this.handleMessage(stock, message);
//             });
//             console.log(`Subscribed to Redis channel: ${stock}`);
//         }
//     }

//     public userUnSubscribe(userId: string, stock: string) {
//         this.subscriptions.set(stock, this.subscriptions.get(stock)?.filter((sub) => sub !== userId) || []);

//         if (this.subscriptions.get(stock)?.length === 0) {
//             this.redisClient.unsubscribe(stock);
//             console.log(`UnSubscribed to Redis channel: ${stock}`);
//         }
//     }

//     // Define the method that will be called when a message is published to the subscribed channel
//     private handleMessage(stock: string, message: string) {
//         console.log(`Message received on channel ${stock}: ${message}`);
//         this.subscriptions.get(stock)?.forEach((sub) => {
//             console.log(`Sending message to user: ${sub}`);
//         });
//     }

//     // Cleanup on instance destruction
//     public async disconnect() {
//         await this.redisClient.quit();
//     }
// }