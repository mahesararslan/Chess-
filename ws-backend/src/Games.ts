import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME } from "./messages";

interface Player {
    socket: WebSocket;
    userId: string;
    userName: string;
}

export class Game {
    public player1: Player;
    public player2: Player;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    private player1TimeLeft: number;
    private player2TimeLeft: number;
    private lastMoveTime: Date;
    private currentTurn: Player;

    constructor(player1: Player, player2: Player, timeLimit: number) {
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
        } catch (error) {
            console.log(error);
            return;
        }

        if (this.board.isGameOver()) {
            const winnerName = this.board.turn() === 'w' ? this.player2.userName : this.player1.userName;

            this.player1.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: winnerName
                }
            }));

            this.player2.socket.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: winnerName
                }
            }));

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

    endGame(socket: WebSocket, payload: { winner?: string; loser?: string; timeOut?: boolean; resign?: boolean }) {
        if (payload.resign) {
            const winner = socket === this.player1.socket ? this.player2.userName : this.player1.userName;
            const loser = socket === this.player1.socket ? this.player1.userName : this.player2.userName;

            payload.winner = winner;
            payload.loser = loser;
        }

        this.player1.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload
        }));

        this.player2.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload
        }));
    }
}
