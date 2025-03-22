import WebSocket from 'ws';
import { GameManager } from './GameManager';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Get the port from the command-line argument or use a default value
const PORT = process.argv[2] || 8080;

// Generate a unique server ID (e.g., using the port number)
const serverId = `server-${PORT}`;

// Initialize Redis connections
const redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisPublisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// @ts-ignore
const wss = new WebSocket.Server({ port: PORT });
const gameManager = GameManager.getInstance(redisPublisher, serverId); // Pass the serverId to GameManager

console.log(`WebSocket server ${serverId} is running on port ${PORT}`);

wss.on('connection', (ws) => {
    gameManager.addUser(ws);

    ws.on('close', () => {
        gameManager.removeUser(ws);
    });

    ws.on('error', (err) => {
        console.log('Error: ', err);
    });

    ws.on('message', (data) => {
        console.log('Received: %s', data);
        // gameManager.handleMessage(ws, data.toString());
    });

    ws.send('Hello! Message From Server!!');
});

// Subscribe to Redis channels using the subscriber connection
redisSubscriber.subscribe('FIND_MATCH', (err, count) => {
    if (err) console.error('Failed to subscribe: ', err.message);
    else console.log(`Subscribed to FIND_MATCH channel. Total subscriptions: ${count}`);
});

redisSubscriber.subscribe('START_GAME', (err, count) => {
    if (err) console.error('Failed to subscribe: ', err.message);
    else console.log(`Subscribed to START_GAME channel. Total subscriptions: ${count}`);
});

redisSubscriber.subscribe('SYNC_MOVE', (err, count) => {
    if (err) console.error('Failed to subscribe: ', err.message);
    else console.log(`Subscribed to SYNC_MOVE channel. Total subscriptions: ${count}`);
});

// Handle messages from Redis
redisSubscriber.on('message', (channel, message) => {
    
    const payload = JSON.parse(message);

    // Ignore messages published by this server
    if (payload.serverId === serverId) {
        console.log(`Ignoring message from self (serverId: ${serverId})`);
        return;
    }
    console.log(`Received message from Redis channel ${channel}: ${message}`);

    if (channel === 'FIND_MATCH' || channel === 'START_GAME') {
        gameManager.startGameFromRedis(payload);
    }
     else if (channel === 'SYNC_MOVE') {
        gameManager.syncMoveFromRedis(payload);
    }
});

// import WebSocket from 'ws'
// import { GameManager } from './GameManager'
// const PORT = process.env.PORT || 8080; // @ts-ignore
// const wss = new WebSocket.Server({ port: PORT })
// const gameManager = GameManager.getInstance();

// wss.on('connection', (ws) => {

//     gameManager.addUser(ws)

//     ws.on('close', () => {
//         gameManager.removeUser(ws)
//     })

//     ws.on('error', (err) => {
//         console.log('Error: ', err)
//     })

//     ws.on('message', (data) => {
//         console.log('Received: %s', data)  
//     })

//     ws.send('Hello! Message From Server!!')
// })
