import { WebSocket } from "ws";
import { Game } from "./Games";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

interface User {
    socket: WebSocket;
    userId: string;
    userName: string;
    timeLimit?: number; // Optional timeLimit to match games
}

export class GameManager {
    private static instance: GameManager;
    private games: Game[] = [];
    private pendingUsers: { [key: number]: User | null } = {}; // Store pending users by timeLimit
    private users: User[] = [];

    private constructor() {
        this.games = [];
        this.pendingUsers = {};  // Initialize empty pending users
    }

    // Singleton getInstance()
    public static getInstance() {
        if (!this.instance) {
            this.instance = new GameManager();
        }
        return this.instance;
    }

    addUser(socket: WebSocket) {
        this.users.push({ socket, userId: "", userName: "" });
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        const disconnectedUser = this.users.find(user => user.socket === socket);

        if (disconnectedUser) {
            const game = this.games.find(game =>
                game.player1.socket === socket || game.player2.socket === socket
            );

            if (game) {
                const opponent = game.player1.socket === socket ? game.player2 : game.player1;

                opponent.socket.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        disconnected: true,
                        message: "You have won because your opponent has left the game."
                    }
                }));

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
                    console.log("User ", user); // console 1
                    return user;
                });

                // Check if there's a pending user with the same time limit
                console.log("Checking for pending users with the same time limit: ", this.pendingUsers); // console 2
                if (this.pendingUsers[timeLimit]) {
                    const pendingUser = this.pendingUsers[timeLimit];
                    if (pendingUser) {
                        // Create a new game
                        const game = new Game(pendingUser, { socket, userId, userName}, timeLimit);
                        this.games.push(game);

                        // Notify both players that the game has started
                        pendingUser.socket.send(JSON.stringify({
                            type: INIT_GAME,
                            payload: {
                                opponentName: userName,
                                color: "white"
                            }
                        }));

                        socket.send(JSON.stringify({
                            type: INIT_GAME,
                            payload: {
                                opponentName: pendingUser.userName,
                                color: "black"
                            }
                        }));

                        // Clear the pending user for this time limit
                        this.pendingUsers[timeLimit] = null;
                    }
                } else {
                    console.log("Adding user to pending list because no user with the same time limit was found");
                    // No pending user with the same time limit, add this user to the pending list
                    this.pendingUsers[timeLimit] = { socket, userId, userName, timeLimit };
                    console.log(this.pendingUsers); // console 2
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }

            if (message.type === GAME_OVER) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket);
                if (game) {
                    game.endGame(socket, message.payload);
                    this.games = this.games.filter(g => g !== game);
                }
            }
        });
    }
}
