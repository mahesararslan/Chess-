// import { WebSocket } from "ws";
// import { Redis } from "ioredis";
// import { Game } from "./Games";
// import { INIT_GAME, MOVE, ERROR, GAME_OVER } from "./messages";
// import { PrismaClient } from '../../node-backend/node_modules/prisma/prisma-client'
// const prisma = new PrismaClient();

// interface User {
//     socket: WebSocket;
//     userId: string;
//     userName: string;
//     timeLimit: number;
// }

// export class GameManager {
//     private static instance: GameManager;
//     private games: Game[] = [];
//     private pendingUsers: { [key: number]: User | null } = {};
//     private redis: Redis;
//     private serverId: string;

//     private constructor(redis: Redis, serverId: string) {
//         this.redis = redis;
//         this.games = [];
//         this.pendingUsers = {};
//         this.serverId = serverId;
//     }

//     public static getInstance(redis: Redis, serverId: string) {
//         if (!this.instance) {
//             this.instance = new GameManager(redis, serverId);
//         }
//         return this.instance;
//     }

//     addUser(socket: WebSocket) {
//         socket.on('message', (data) => this.handleMessage(socket, data.toString()));
//     }

//     removeUser(socket: WebSocket) {
//         this.games = this.games.filter(game => {
//             if (game.player1.socket === socket || game.player2.socket === socket) {
//                 const opponent = game.player1.socket === socket ? game.player2 : game.player1; // @ts-ignore
//                 opponent.socket.send(JSON.stringify({ type: GAME_OVER, payload: { message: "Opponent left the game" } }));
//                 game.endGame(socket, { disconnected: true });
//                 return false;
//             }
//             return true;
//         });
//     }

//     handleMessage(socket: WebSocket, message: string) {
//         const data = JSON.parse(message);
//         if (data.type === INIT_GAME) {
//             this.findMatch(socket, data.payload);
//         } else if (data.type === MOVE) {
//             this.handleMove(data.payload);
//         }
//     }

//     private async findMatch(socket: WebSocket, payload: any) {
//         const { userId, userName, timeLimit } = payload;

//         if (this.pendingUsers[timeLimit]) {
//             console.log("Local match found");
//             // Local match found
//             const opponent = this.pendingUsers[timeLimit];
//             if(opponent.userId === userId) {
//                 socket.send(JSON.stringify({ type: ERROR, payload: { message: "You can't play against yourself" } }));
//                 return;
//             }

//             this.pendingUsers[timeLimit] = null;
//             this.startGame(opponent!, { socket, userId, userName, timeLimit });
//         } else {
//             console.log("Local match not found");
//             // Add the user to pendingUsers
//             this.pendingUsers[timeLimit] = { socket, userId, userName, timeLimit };

//             // Broadcast matchmaking request to other servers
//             this.redis.publish('FIND_MATCH', JSON.stringify({ ...payload, serverId: this.serverId }));
//         }
//     }

//     async startGame(player1: User, player2: User) { 
//         const newGame = await prisma.game.create({
//             data: {
//                 whiteId: player1.userId,
//                 blackId: player2.userId,
//                 moves: []
//             }
//         });
//         const game = new Game(newGame.id, player1, player2, player1.timeLimit);
//         this.games.push(game);
//         if (player1.socket) { player1.socket.send(JSON.stringify({ type: 'GAME_STARTED' })) }
//         if (player2.socket) { player2.socket.send(JSON.stringify({ type: 'GAME_STARTED' })) }
//     }

//     startGameFromRedis(payload: any) {
//         const { userId, userName, timeLimit, serverId } = payload;

//         // Ignore messages from self
//         if (serverId === this.serverId) {
//             console.log("Ignoring message from self");
//             return;
//         }

//         const player1 = this.pendingUsers[timeLimit];
//         if (player1) {
//             this.startGame(player1, { socket: null as any, userId, userName, timeLimit });
//             this.pendingUsers[timeLimit] = null;
//         }
//     }

//     handleMove(payload: any) {
//         const { socket, gameId, move } = payload;
//         const game = this.games.find(g => g.id === gameId);
//         if (game) {
//             game.makeMove(socket, move);
//             this.redis.publish('SYNC_MOVE', JSON.stringify({ gameId, move, serverId: this.serverId }));
//         }
//     }

//     syncMoveFromRedis(payload: any) {
//         const { gameId, move, serverId } = payload;

//         // Ignore messages from self
//         if (serverId === this.serverId) {
//             console.log("Ignoring message from self");
//             return;
//         }

//         const game = this.games.find(g => g.id === gameId);
//         if (game) {
//             game.makeMove(null as any, move); // No need to pass socket for Redis-synced moves
//         }
//     }
// }


import { WebSocket } from "ws";
import { Game } from "./Games";
import { ERROR, GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { Redis } from "ioredis";
import { PrismaClient } from '../../node-backend/node_modules/prisma/prisma-client'
import { RedisGame } from "./RedisGames";
const prisma = new PrismaClient();

interface User {
    socket: WebSocket;
    userId: string;
    userName: string;
    timeLimit?: number; // Optional timeLimit to match games
    color?: string;
}

export class GameManager {
    private static instance: GameManager;
    private games: Game[] = [];
    private redisGames: RedisGame[] = [];
    private pendingUsers: { [key: number]: User | null } = {}; // Store pending users by timeLimit
    private users: User[] = [];
    private redis: Redis;
    private serverId: string;

    private constructor(redis: Redis, serverId: string) {
        this.redis = redis;
        this.games = [];
        this.pendingUsers = {};  // Initialize empty pending users
        this.serverId = serverId;
    }

    // Singleton getInstance()
    public static getInstance(redis: Redis, serverId: string) {
        if (!this.instance) {
            this.instance = new GameManager(redis, serverId);
        }
        return this.instance;
    }

    addUser(socket: WebSocket) {
        this.users.push({ socket, userId: "", userName: "" });
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        const disconnectedUser = this.users.find(user => user.socket === socket);
        const connectedUser = this.users.find(user => user.socket !== socket);

        if (disconnectedUser) {
            const game = this.games.find(game =>
                game.player1.socket === socket || game.player2.socket === socket
            );

            if (game) {

                const opponent = game.player1.socket === socket ? game.player2 : game.player1;
                game.endGame(socket, { winner: opponent.userName, disconnected: true });

                if (opponent.socket) {
                    opponent.socket.send(JSON.stringify({
                        type: GAME_OVER,
                        payload: {
                            disconnected: true,
                            message: "You have won because your opponent has left the game."
                        }
                    }));
                }

                this.games = this.games.filter(g => g !== game);
            }

            this.users = this.users.filter(user => user.socket !== socket);

            // If user was pending, remove from pendingUsers
            for (const timeLimit in this.pendingUsers) {
                if (this.pendingUsers[timeLimit] && this.pendingUsers[timeLimit]?.socket === socket) {
                    this.pendingUsers[timeLimit] = null;
                }
            }
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', async (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                const { userId, userName, timeLimit } = message.payload;

                // Check if the user is already in another game from a different socket
                const isUserInGame = this.users.some(user => user.userId === userId && user.socket !== socket);

                if (isUserInGame) {
                    socket.send(JSON.stringify({
                        type: "error",
                        payload: {
                            message: "User is already in a game from another tab."
                        }
                    }));
                    return;
                }

                // Update user details
                this.users = this.users.map(user => {
                    if (user.socket === socket) {
                        return { socket, userId, userName, timeLimit };
                    }

                    return user;
                });

                // Check if there's a pending user with the same time limit

                if (this.pendingUsers[timeLimit]) {
                    const pendingUser = this.pendingUsers[timeLimit];
                    if(pendingUser?.userId === userId) {
                        socket.send(JSON.stringify({
                            type: ERROR,
                            payload: {
                                message: "You can't play against yourself"
                            }
                        }));
                        return;
                    }
                    if (pendingUser) {
                        console.log("Pending user found", pendingUser);
                        console.log("Current user", { socket, userId, userName });
                        // make a db call to create a new game
                        try {
                            const newGame = await prisma.game.create({
                                data: {
                                    whiteId: pendingUser.userId,
                                    blackId: userId,
                                    moves: []
                                }
                            });

                            // Create a new game
                            if (newGame) {
                                const game = new Game(newGame.id, pendingUser, { socket, userId, userName }, timeLimit);
                                this.games.push(game);


                                // Clear the pending user for this time limit
                                this.pendingUsers[timeLimit] = null;
                            }
                            else {
                                pendingUser.socket.send(JSON.stringify({
                                    type: ERROR,
                                    payload: {
                                        message: "Couldn't create game due to some internal error, please try again!"
                                    }
                                }))

                                socket.send(JSON.stringify({
                                    type: ERROR,
                                    payload: {
                                        message: "Couldn't create game due to some internal error, please try again!"
                                    }
                                }))
                            }
                        }
                        catch (e) {
                            console.log(e)

                            pendingUser.socket.send(JSON.stringify({
                                type: ERROR,
                                payload: {
                                    message: "Couldn't create game due to some internal error, please try again!"
                                }
                            }))

                            socket.send(JSON.stringify({
                                type: ERROR,
                                payload: {
                                    message: "Couldn't create game due to some internal error, please try again!"
                                }
                            }))
                        }
                    }
                } else {
                    // check if there's a pending user with the same time limit in redis
                    this.redis.publish('FIND_MATCH', JSON.stringify({ userId, userName, timeLimit , serverId: this.serverId }));
                    // No pending user with the same time limit, add this user to the pending list
                    this.pendingUsers[timeLimit] = { socket, userId, userName, timeLimit };
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
                else {
                    console.log("Game locally not found for move, looking into redis: ", message.payload);
                    this.handleMove(socket, message.payload);
                }
            }

            if (message.type === GAME_OVER) {
                console.log("Game over message received");
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket);
                console.log("Game found", game);
                if (game) {
                    game.endGame(socket, message.payload);
                    this.games = this.games.filter(g => g !== game);
                }
                if (message.payload.timeOut) {
                    this.users = this.users.filter(user => user.socket !== socket);
                    // find game:
                    const game = this.games.find(game => game.player1.userName === message.payload.winner && game.player2.userName === message.payload.loser) || this.games.find(game => game.player1.userName === message.payload.loser && game.player2.userName === message.payload.winner);
                    if (game) {
                        game.endGame(socket, message.payload);
                        this.games = this.games.filter(g => g !== game);
                    }
                }

            }
        });
    }

    async startGame(player1: User, player2: User, color: string, gameId: string) {

        if(gameId && color) {
            // add color in player2
            player2.color = color; 
        const game = new RedisGame(gameId, player2, player1, player1.timeLimit || 0, this.serverId, this.redis);
        this.redisGames.push(game);
        // if (player1.socket) { player1.socket.send(JSON.stringify({ type: 'GAME_STARTED' })) }
        if (player2.socket) {
            player2.socket.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color,
                    opponent: player1.userId
                }
            }));
        }
        }
        else if (!gameId && color) {
            const newGame = await prisma.game.create({
                data: {
                    whiteId: player1.userId,
                    blackId: player2.userId,
                    moves: []
                }
            });
            player2.color = color;
            const game = new RedisGame(newGame.id, player2, player1, player1.timeLimit || 0, this.serverId, this.redis);
            this.redisGames.push(game);
            // if (player1.socket) { player1.socket.send(JSON.stringify({ type: 'GAME_STARTED' })) }
            if (player2.socket) {
                player2.socket.send(JSON.stringify({
                    type: INIT_GAME,
                    payload: {
                        color,
                        opponent: player1.userId
                    }
                }));
            }
        }
        else {
            // check if a pending user is present
            const pendingUser = this.pendingUsers[player1.timeLimit!];
            if(pendingUser) {
                this.startGame(player1, pendingUser, "white", null as any);
            }
        }
    }

    startGameFromRedis(payload: any) {
        const { userId, userName, timeLimit, serverId, color, gameId } = payload;

        // Ignore messages from self
        if (serverId === this.serverId) {
            console.log("Ignoring message from startGameFromRedis");
            return;
        }

        const player1 = this.pendingUsers[timeLimit];
        console.log("Player1: ", player1?.userName);
        if (player1 && userId) {
            console.log("Starting game from Redis between ", player1?.userName, " and " , { userId, userName, timeLimit });
            this.startGame({ socket: null as any, userId, userName, timeLimit }, player1, color, gameId);
            
            this.pendingUsers[timeLimit] = null;
        }
    }

    handleMove( socket: WebSocket, payload: any) {
        const { move } = payload;
        const game = this.redisGames.find(g => g.player1.socket === socket);
        
        if (game) {
            game.makeMove(socket, move);
            this.redis.publish('SYNC_MOVE', JSON.stringify({ gameId:game.id, move, serverId: this.serverId }));
        }
    }

    syncMoveFromRedis(payload: any) {
        const { gameId, move, serverId } = payload;

        // Ignore messages from self
        if (serverId === this.serverId) {
            console.log("Ignoring message from self");
            return;
        }
        console.log("Syncing move from Redis: ", payload);
        const game = this.redisGames.find(g => g.id === gameId);
        if (game) {
            game.makeMove(null as any, move); // No need to pass socket for Redis-synced moves
        }
    }

    
}
