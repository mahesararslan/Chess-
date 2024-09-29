import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private moves: string[];
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket, ) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        // let both players know that the game has started
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            }
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }))
    }

    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // validate the type of move using zod

        // check if it is the player's turn
        if (this.board.turn() === 'w' && socket === this.player2) {
            console.log("It is not your turn, white's turn")
            return;
        }
        

        if (this.board.turn() === 'b' && socket === this.player1) {
            console.log("It is not your turn, black's turn")
            return;
        }
        
        try {

            this.board.move(move)
        } catch (error) {
            // send an error message to the player
            console.log(error)
            return;
        }

        if (this.board.isGameOver()) { // Stringify it because you can only send strings over the websockets
            if (this.board.turn() === 'b') {
                this.player2.send(JSON.stringify({
                    type: "move",
                    payload: move
                }))
            } else {
                this.player1.send(JSON.stringify({
                    type: "move",
                    payload: move
                }))
            }
            this.player1.send (JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'black' : 'white'
                }
            }))
            this.player2.send (JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'black' : 'white'
                }
            }))

            return;
        }

        if (this.board.turn() === 'b') {
            this.player2.send(JSON.stringify({
                type: "move",
                payload: move
            }))
        } else {
            this.player1.send(JSON.stringify({
                type: "move",
                payload: move
            }))
        }


        // update the board
        // push the move

        // check if the game is over
        // send the updated board to both players
        // return;
    }
}