import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({
    chess,
    board,
    socket,
    setBoard,
    isBlack
}: {
    chess: Chess;
    setBoard: React.Dispatch<React.SetStateAction<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>>;
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    isBlack: boolean; // Determines if the player is black
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const [selectedSquare, setSelectedSquare] = useState<null | Square>(null);

    // Reverse the board rows if the player is black
    const displayBoard = isBlack ? [...board].reverse() : board;

    const handleSquareClick = (squareRepresentation: Square, square: any) => {
        if (!from) {
            // Check if the selected piece belongs to the player
            if (square && ((isBlack && square.color === "b") || (!isBlack && square.color === "w"))) {
                if (squareRepresentation === selectedSquare) {
                    // If the same piece is clicked, deselect it
                    setFrom(null);
                    setSelectedSquare(null);
                } else {
                    // Select the clicked piece
                    setFrom(squareRepresentation);
                    setSelectedSquare(squareRepresentation);
                }
            } else {
                
                console.log("You can't move your opponent's pieces.");
                setFrom(null);
                setSelectedSquare(null);
            }
        } else {
            const move = chess.move({ from, to: squareRepresentation });
            if (move) {
                socket.send(
                    JSON.stringify({
                        type: MOVE,
                        payload: {
                            move: { from, to: squareRepresentation }
                        }
                    })
                );
                setBoard(chess.board());
                setFrom(null);
                setSelectedSquare(null);
            }
        }
    };

    return (
        <div className="text-white-200 rounded-lg">
            {displayBoard.map((row, i) => {
                // Reverse columns if the player is black
                const displayRow = isBlack ? [...row].reverse() : row;

                return (
                    <div key={i} className="flex">
                        {displayRow.map((square, j) => {
                            const fileIndex = isBlack ? 7 - (j % 8) : j % 8;
                            const rankIndex = isBlack ? i + 1 : 8 - i;
                            const squareRepresentation = String.fromCharCode(97 + fileIndex) + rankIndex as Square;

                            // Move the `isSelected` declaration inside the correct map function
                            const isSelected = selectedSquare === squareRepresentation;

                            return (
                                <div
                                    onClick={() => handleSquareClick(squareRepresentation, square)}
                                    key={j}
                                    className={`w-16 h-16 ${(i + j) % 2 === 0 ? "bg-lime-100" : "bg-lime-700"} ${isSelected ? "border-4 border-yellow-500" : ""}`} // Add border for selected square
                                >
                                    <div className="w-full justify-center flex h-full">
                                        <div className="h-full justify-center flex flex-col">
                                            {square ? (
                                                <img
                                                    className="w-16 h-16"
                                                    src={`/${square.color === "b" ? `b${square.type}` : `w${square.type}`}.png`}
                                                    alt={`Chess piece: ${square.color}${square.type}`}
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
