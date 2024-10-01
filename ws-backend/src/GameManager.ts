import { WebSocket } from "ws";
import { Game } from "./Games";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { PrismaClient } from '../../node-backend/node_modules/.prisma/client';

interface User {
    socket: WebSocket;
    userId: string;
    userName: string;
}

export class GameManager {
    private games: Game[] = [];
    private pendingUser: User | null;
    private users: User[] = []; // Store both socket, userId, and userName

    constructor() {
        this.games = [];
        this.pendingUser = null;
    }

    addUser(socket: WebSocket) {
        this.users.push({ socket, userId: "", userName: "" }); // Add user without id initially
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user.socket !== socket);
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', async (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                const { userId, userName } = message.payload;

                // Check if the user is already in a game
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

                // Update user's id and name in users array
                this.users = this.users.map(user => {
                    if (user.socket === socket) {
                        return { socket, userId, userName };
                    }
                    return user;
                });

                if (this.pendingUser) {
                    // Create a new game if there's a pending user
                    const game = new Game(this.pendingUser, { socket, userId, userName });
                    this.games.push(game);

                    // Notify both players that the game has started and send opponent's name
                    this.pendingUser.socket.send(JSON.stringify({
                        type: INIT_GAME,
                        payload: {
                            opponentName: userName,  // Send opponent's name to pending user
                            color: "white"
                        }
                    }));

                    socket.send(JSON.stringify({
                        type: INIT_GAME,
                        payload: {
                            opponentName: this.pendingUser.userName,  // Send opponent's name to the new user
                            color: "black"
                        }
                    }));

                    this.pendingUser = null; // Reset pending user
                } else {
                    // Set this user as pending
                    this.pendingUser = { socket, userId, userName };
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find((game) => game.player1.socket === socket || game.player2.socket === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move); 
                }
            }

            if(message.type === GAME_OVER) {
                const game = this.games.find((game) => game.player1.socket === socket || game.player2.socket === socket);
                if (game) {
                    game.endGame(socket, message.payload);
                    this.games = this.games.filter(g => g !== game); // Remove the game from the list of games
                }
            }
        });
    }
}
