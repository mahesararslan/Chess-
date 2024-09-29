import { WebSocket } from "ws";
import { Game } from "./Games";
import { INIT_GAME, MOVE } from "./messages";
import { PrismaClient } from '../../node-backend/node_modules/.prisma/client';
import { WHITE } from "chess.js";

export class GameManager {
    private games: Game[] = [];
    private pendingUser: WebSocket | null;
    private users: WebSocket[] = [];


    constructor() {
        this.games = [];
        this.pendingUser = null;
    }

    addUser(socket: WebSocket) {   
        this.users.push(socket);
        this.addHandler(socket);

    }

    removeUser(socket: WebSocket) {

    }

    private addHandler(socket: WebSocket) {
        socket.on('message', async (data) => {
            const message = JSON.parse(data.toString());

            if(message.type === INIT_GAME) {
                if(this.pendingUser) {
                    const prisma = new PrismaClient();
                    // const game = await prisma.game.create({
                    //     data: {
                    //         player1: this.pendingUser,
                    //         player2: socket,
                    //         whiteId: this.pendingUser,
                    //         blackId: socket,
                    //         winner: null
                    //     }
                    // })
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;

                } else {
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE) {
                const game = this.games.find((game) => game.player1 === socket || game.player2 === socket);
                if(game) {
                    game.makeMove(socket, message.payload.move); 
                }
            }
        });
    }

    handleMessage() {

    }
}