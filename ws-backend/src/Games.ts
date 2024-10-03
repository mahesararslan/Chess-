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

    constructor(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();

        
        this.player1.socket.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white",
                opponentName: player2.userName  
            }
        }));

        this.player2.socket.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black",
                opponentName: player1.userName  
            }
        }));
    }

    makeMove(socket: WebSocket, move: { from: string; to: string }) {
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
    }

    endGame(socket: WebSocket, payload: { winner?: string; loser?: string; resign?: boolean }) {
        if (payload.resign) {
            const winner = socket === this.player1.socket ? this.player2.userName : this.player1.userName;
            const loser = socket === this.player1.socket ? this.player1.userName : this.player2.userName;
    
            console.log(`${winner} wins by resignation`);
            payload.winner = winner;
            payload.loser = loser;
        }
    
       
        this.player1.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                ...payload,
                opponentResigned: socket === this.player1.socket ? this.player1.userName : this.player2.userName,  // Send the name of the opponent who resigned
            }
        }));
    
        this.player2.socket.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                ...payload,
                opponentResigned: socket === this.player1.socket ? this.player1.userName : this.player2.userName,  // Send the name of the opponent who resigned
            }
        }));
    }
}
