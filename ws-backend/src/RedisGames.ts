import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME } from "./messages";
import { PrismaClient } from '../../node-backend/node_modules/prisma/prisma-client'
import { Redis } from "ioredis";

const prisma = new PrismaClient();

interface Player {
    socket: WebSocket;
    userId: string;
    userName: string;
    color?: string;
}

interface RedisPlayer {
    userId: string;
    userName: string;
}


export class RedisGame {
    public id: string;
    public player1: Player;
    public player2: RedisPlayer;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    private player1TimeLeft: number;
    private player2TimeLeft: number;
    private lastMoveTime: Date;
    private currentTurn: Player;
    private redis: Redis
    private serverId: string

    constructor(id: string,player1: Player, player2: Player, timeLimit: number, serverId: string, redis: Redis) {
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
        this.serverId = serverId;
        this.redis = redis;

        if(player1.socket) {
            player1.socket.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "white",
                    opponent: player2.userId
                }
            }));
        }

        // if (player2.socket) {
        //     player2.socket.send(JSON.stringify({
        //         type: INIT_GAME,
        //         payload: {
        //             color: "black",
        //             opponent: player1.userId
        //         }
        //     }));
        // }
        // publish to redis for player2
        redis.publish('START_GAME', JSON.stringify({
            serverId,
            gameId: id,
            userId: player1.userId,
            userName: player1.userName,
            timeLimit,
            color: "black"
        }));

    }

    // private updateTime() {
    //     const currentTime = new Date();
    //     const timeSpent = currentTime.getTime() - this.lastMoveTime.getTime();

    //     if (this.currentTurn === this.player1) {
    //         this.player1TimeLeft -= timeSpent;
    //         if (this.player1TimeLeft <= 0) {
    //             this.endGame(this.player2.socket, { winner: this.player2.userName, loser: this.player1.userName, timeOut: true });
    //             return;
    //         }
    //     } else {
    //         this.player2TimeLeft -= timeSpent;
    //         if (this.player2TimeLeft <= 0) {
    //             this.endGame(this.player1.socket, { winner: this.player1.userName, loser: this.player2.userName, timeOut: true });
    //             return;
    //         }
    //     }

    //     this.lastMoveTime = currentTime;
    // }

    makeMove(socket: WebSocket, move: { from: string; to: string }) {
        // this.updateTime();

        // if (this.board.turn() === 'w' && socket === this.player2.socket) {
        //     console.log("It is not your turn, white's turn");
        //     return;
        // }

        // if (this.board.turn() === 'b' && socket === this.player1.socket) {
        //     console.log("It is not your turn, black's turn");
        //     return;
        // }
        console.log("reached before try and catch")
        try {
            // log the moves in history array.
            this.board.history().forEach((move: any) => {
                console.log(move);
            });
            this.board.move(move);
            this.moves.push(JSON.stringify(move));
        } catch (error) {
            console.log(error);
            return;
        }

        // const opponentSocket = socket === this.player1.socket ? this.player2.socket : this.player1.socket;
        console.log("sending the move to", this.player1.userName)
        this.player1.socket.send(JSON.stringify({
            type: "move",
            payload: move
        }));
        // publish move to redis
        // this.redis.publish('SYNC_MOVE', JSON.stringify({
        //     serverId: this.serverId,
        //     gameId: this.id,
        //     move: move
        // }));
        

        // this.currentTurn = socket === this.player1.socket ? this.player2 : this.player1;
        // this.lastMoveTime = new Date();


        if (this.board.isGameOver()) {
            const winner = this.board.turn() === 'w' ? (this.player1.color === 'white' ? this.player2 : this.player1) : (this.player1.color === 'black' ? this.player1 : this.player2);
            const loser = winner === this.player1 ? this.player2 : this.player1;
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

        
    }
    async endGame2(winner: Player | RedisPlayer, loser: Player | RedisPlayer, payload: { winner?: string; loser?: string; checkmate:boolean; timeOut?: boolean; resign?: boolean }) {

        this.player1.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload
        }));

        // this.player2.socket.send(JSON.stringify({
        //     type: GAME_OVER,
        //     payload
        // }));
        // publish to redis:
        this.redis.publish('GAME_OVER', JSON.stringify({
            serverId: this.serverId,
            gameId: this.id,
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

    async endGame(socket: WebSocket, payload: { winner?: string; loser?: string; timeOut?: boolean; resign?: boolean; disconnected?: boolean; }) {   
        if (payload.resign) {
            const winner = socket === this.player1.socket ? this.player2 : this.player1;
            const loser = socket === this.player1.socket ? this.player1 : this.player2;

            payload.winner = winner.userName;
            payload.loser = loser.userName;

            this.player1.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload
            }));
    
            // this.player2.socket.send(JSON.stringify({
            //     type: GAME_OVER,
            //     payload
            // }));
            // publish to redis
            this.redis.publish('GAME_OVER', JSON.stringify({
                serverId: this.serverId,
                gameId: this.id,
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
    
            // this.player2.socket.send(JSON.stringify({
            //     type: GAME_OVER,
            //     payload
            // }));
            // publish to redis
            this.redis.publish('GAME_OVER', JSON.stringify({
                serverId: this.serverId,
                gameId: this.id,
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


        if(payload.disconnected) {
            console.log("Player disconnected")
            // search for the player who disconnected
            const winner = payload.winner === this.player1.userName ? this.player1 : this.player2;
            const loser = payload.winner === this.player1.userName ? this.player2 : this.player1;

            console.log("Winner: ", winner.userName)
            console.log("Loser: ", loser.userName)

            payload.winner = winner.userName;
            payload.loser = loser.userName;
    
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
