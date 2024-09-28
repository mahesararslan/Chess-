import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket";
import { Chess } from 'chess.js'
// TODO: Move together, there's code repetition here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false)
    const [isBlack, setIsBlack] = useState(false)
    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    setStarted(true)
                    setIsBlack(message.payload.color === "black")
                    break;
                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    console.log("Move made");
                    break;
                case GAME_OVER:
                    console.log("Game over");
                    break;
            }
        }
    }, [socket]);
    if (!socket) return <div>Connecting...</div>
    return <div className="justify-center flex bg-stone-700">
        <div className="pt-8 max-w-screen-lg w-full ">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="p-8 col-span-4 w-full flex justify-center bg-stone-800">
                    <ChessBoard isBlack={isBlack} chess={chess} setBoard={setBoard} socket={socket} board={board} />
                </div>
                <div className="col-span-2 bg-stone-800 w-full flex flex-col items-center">
                    <div className="pt-8 w-full flex justify-center">
                        {!started && <Button onClick={() => {
                            socket.send(JSON.stringify({
                                type: INIT_GAME
                            }))
                        }} >
                            Play
                        </Button>}
                    </div>
                </div>
            </div>
        </div>
    </div>
}