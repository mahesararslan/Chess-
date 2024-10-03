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
    private static instance: GameManager;
    private games: Game[] = [];
    private pendingUser: User | null;
    private users: User[] = [];

    private constructor() {
        this.games = [];
        this.pendingUser = null;
    }

    // singleton getIntance()
    public static getInstance() {
        if(!this.instance) {
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
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', async (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                const { userId, userName } = message.payload;

                
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

                
                this.users = this.users.map(user => {
                    if (user.socket === socket) {
                        return { socket, userId, userName };
                    }
                    return user;
                });

                if (this.pendingUser) {
                   
                    const game = new Game(this.pendingUser, { socket, userId, userName });
                    this.games.push(game);

                    
                    this.pendingUser.socket.send(JSON.stringify({
                        type: INIT_GAME,
                        payload: {
                            opponentName: userName,  
                            color: "white"
                        }
                    }));

                    socket.send(JSON.stringify({
                        type: INIT_GAME,
                        payload: {
                            opponentName: this.pendingUser.userName, 
                            color: "black"
                        }
                    }));

                    this.pendingUser = null; 
                } else {
                    
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
                    this.games = this.games.filter(g => g !== game); 
                }
            }
        });
    }
}
