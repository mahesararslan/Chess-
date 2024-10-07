import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME } from "./messages";
import { PrismaClient } from '../../node-backend/node_modules/prisma/prisma-client'

const prisma = new PrismaClient();

interface Player {
    socket: WebSocket;
    userId: string;
    userName: string;
}


export class Game {
    public id: string;
    public player1: Player;
    public player2: Player;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    private player1TimeLeft: number;
    private player2TimeLeft: number;
    private lastMoveTime: Date;
    private currentTurn: Player;

    constructor(id: string,player1: Player, player2: Player, timeLimit: number) {
        this.id = id;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        this.player1TimeLeft = timeLimit * 60 * 1000; // Convert minutes to milliseconds
        this.player2TimeLeft = timeLimit * 60 * 1000;
        this.lastMoveTime = new Date();
        this.currentTurn = player1;

        player1.socket.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white",
                opponentName: player2.userName
            }
        }));

        player2.socket.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black",
                opponentName: player1.userName
            }
        }));
    }

    private updateTime() {
        const currentTime = new Date();
        const timeSpent = currentTime.getTime() - this.lastMoveTime.getTime();

        if (this.currentTurn === this.player1) {
            this.player1TimeLeft -= timeSpent;
            if (this.player1TimeLeft <= 0) {
                this.endGame(this.player2.socket, { winner: this.player2.userName, loser: this.player1.userName, timeOut: true });
                return;
            }
        } else {
            this.player2TimeLeft -= timeSpent;
            if (this.player2TimeLeft <= 0) {
                this.endGame(this.player1.socket, { winner: this.player1.userName, loser: this.player2.userName, timeOut: true });
                return;
            }
        }

        this.lastMoveTime = currentTime;
    }

    makeMove(socket: WebSocket, move: { from: string; to: string }) {
        this.updateTime();

        if (this.board.turn() === 'w' && socket === this.player2.socket) {
            console.log("It is not your turn, white's turn");
            return;
        }

        if (this.board.turn() === 'b' && socket === this.player1.socket) {
            console.log("It is not your turn, black's turn");
            return;
        }

        try {
            this.board.move(move);
            this.moves.push(JSON.stringify(move));
        } catch (error) {
            console.log(error);
            return;
        }

        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? this.player2 : this.player1;
            const loser = this.board.turn() === 'w' ? this.player1 : this.player2;
            const payload = {
                winner: winner.userName,
                loser: loser.userName,
                checkmate: true,
                resign: false,
                timeOut: false
            }
            this.endGame2(winner, loser, payload)

            // this.player1.socket.send(JSON.stringify({
            //     type: GAME_OVER,
            //     payload: {
            //         winner: winnerName
            //     }
            // }));

            // this.player2.socket.send(JSON.stringify({
            //     type: GAME_OVER,
            //     payload: {
            //         winner: winnerName
            //     }
            // }));

            return;
        }

        const opponentSocket = socket === this.player1.socket ? this.player2.socket : this.player1.socket;

        opponentSocket.send(JSON.stringify({
            type: "move",
            payload: move
        }));

        this.currentTurn = socket === this.player1.socket ? this.player2 : this.player1;
        this.lastMoveTime = new Date();
    }
    async endGame2(winner: Player, loser: Player, payload: { winner?: string; loser?: string; checkmate:boolean; timeOut?: boolean; resign?: boolean }) {

        this.player1.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload
        }));

        this.player2.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload
        }));

        // @ts-ignore
        console.log("winnerID: ",winner.userId)
        console.log("moves: ", this.moves);



        // db call
        try{
            const updatedGame = await prisma.game.update({
                where: {
                    id: this.id
                },
                data: { // @ts-ignore
                    winnerId: winner.userId,
                    moves: this.moves,
    
                }
            })
            console.log("Game Update:", updatedGame)

            // @ts-ignore
            await this.updatePlayerStats(winner.id, this.player1.userId, this.player2.userId)
        }
        catch(e) {
            console.log(e);
            console.log("Error in db call")
        }

        
    }

    async endGame(socket: WebSocket, payload: { winner?: string; loser?: string; timeOut?: boolean; resign?: boolean }) {
        if (payload.resign) {
            const winner = socket === this.player1.socket ? this.player2 : this.player1;
            const loser = socket === this.player1.socket ? this.player1 : this.player2;

            payload.winner = winner.userName;
            payload.loser = loser.userName;

            this.player1.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload
            }));
    
            this.player2.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload
            }));
    
            // @ts-ignore
            console.log("winnerID: ",winner.userId)
            console.log("moves: ", this.moves);


            // db call
            try{
                const updatedGame = await prisma.game.update({
                    where: {
                        id: this.id
                    },
                    data: { // @ts-ignore
                        winnerId: winner.userId,
                        moves: this.moves,
        
                    }
                })
                console.log("Game Update:", updatedGame)

                // @ts-ignore
                await this.updatePlayerStats(winner.userId, this.player1.userId, this.player2.userId)
            }
            catch(e) {
                console.log(e);
                console.log("Error in db call")
            }
        }

        if(payload.timeOut) { 
            console.log("Time out happened")
            const winner = payload.winner === this.player1.userName ? this.player2 : this.player1;
            const loser = payload.winner === this.player1.userName ? this.player1 : this.player2;

            console.log("Winner: ", winner.userName)
            console.log("Loser: ", loser.userName)

            payload.winner = winner.userName;
            payload.loser = loser.userName;

            this.player1.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload
            }));
    
            this.player2.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload
            }));
    
            // @ts-ignore
            console.log("winnerID: ",winner.userId)
            console.log("moves: ", this.moves);

            // db call
            try{
                const updatedGame = await prisma.game.update({
                    where: {
                        id: this.id
                    },
                    data: { // @ts-ignore
                        winnerId: winner.userId,
                        moves: this.moves,
        
                    }
                })
                console.log("Game Update:", updatedGame)

                // @ts-ignore
                await this.updatePlayerStats(winner.userId, this.player1.userId, this.player2.userId)
            }
            catch(e) {
                console.log(e);
                console.log("Error in db call")
            }
        }
        
    }

    private async updatePlayerStats(winnerId: string, player1Id: string, player2Id: string) {
        if (winnerId === player1Id) {
            // Player 1 won, Player 2 lost
            await prisma.user.update({
                where: { id: player1Id },
                data: {
                    wins: { increment: 1 },
                    total_games: { increment: 1 },
                },
            });
            await prisma.user.update({
                where: { id: player2Id },
                data: {
                    losses: { increment: 1 },
                    total_games: { increment: 1 },
                },
            });
        } else if (winnerId === player2Id) {
            // Player 2 won, Player 1 lost
            await prisma.user.update({
                where: { id: player2Id },
                data: {
                    wins: { increment: 1 },
                    total_games: { increment: 1 },
                },
            });
            await prisma.user.update({
                where: { id: player1Id },
                data: {
                    losses: { increment: 1 },
                    total_games: { increment: 1 },
                },
            });
        } else {
            // It's a draw
            await prisma.user.updateMany({
                where: { id: { in: [player1Id, player2Id] } },
                data: {
                    draws: { increment: 1 },
                    total_games: { increment: 1 },
                },
            });
        }
    }
}
