import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

interface Piece {
    square: Square;
    type: PieceSymbol;
    color: Color;
}

interface ChessBoardProps {
    chess: Chess;
    board: (Piece | null)[][];
    socket: WebSocket;
    setBoard: React.Dispatch<React.SetStateAction<(Piece | null)[][]>>;
    isBlack: boolean; // Determines if the player is black
    gameStarted: boolean; // Add gameStarted prop
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
    chess,
    board,
    socket,
    setBoard,
    isBlack,
    gameStarted
}) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

    // Reverse the board rows if the player is black
    const displayBoard = isBlack ? [...board].reverse() : board;

    // Function to check if it's the player's turn and they're moving their own piece
    const isPlayerPiece = (square: Piece | null): boolean => {
        if (!square) return false; // No piece on the square
        return isBlack ? square.color === 'b' : square.color === 'w'; // Check if the piece matches the player's color
    };

    const handleSquareClick = (squareRepresentation: Square, square: Piece | null) => {

        console.log("Game started: ", gameStarted);
        if (!gameStarted) {
            console.log("The game has not started yet.");
            return; // Prevent any movement if the game hasn't started
        }
        // Allow selection if it's the player's turn and they're clicking on their own piece
        if (!from) {
            if (square && isPlayerPiece(square)) {
                if (squareRepresentation === selectedSquare) {
                    setFrom(null);
                    setSelectedSquare(null);
                } else {
                    setFrom(squareRepresentation);
                    setSelectedSquare(squareRepresentation);
                }
            } else {
                console.log("You can't move your opponent's pieces.");
                setFrom(null);
                setSelectedSquare(null);
            }
        } else {
            if (from === squareRepresentation) {
                setFrom(null);
                setSelectedSquare(null);
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
                } else {
                    console.log("Invalid move attempted");
                }
            }
        }
    };

    const handleDragStart = (squareRepresentation: Square, square: Piece | null) => {
        if (!gameStarted) {
            console.log("The game has not started yet.");
            return; // Prevent dragging if the game hasn't started
        }
        // Allow drag only if it's the player's piece
        if (square && isPlayerPiece(square)) {
            setFrom(squareRepresentation);
        } else {
            console.log("You can't drag your opponent's pieces.");
        }
    };

    const handleDrop = (squareRepresentation: Square) => {
        if (!gameStarted) {
            console.log("The game has not started yet.");
            return; // Prevent dragging if the game hasn't started
        }
        
        if (from) {
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
            } else {
                console.log("Invalid move attempted");
            }
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Necessary to allow dropping
    };

    return (
        <div className="text-white-200 rounded-lg">
            {displayBoard.map((row, i) => {
                const displayRow = isBlack ? [...row].reverse() : row;

                return (
                    <div key={i} className="flex">
                        {displayRow.map((square, j) => {
                            const fileIndex = isBlack ? 7 - (j % 8) : j % 8;
                            const rankIndex = isBlack ? i + 1 : 8 - i;
                            const squareRepresentation = String.fromCharCode(97 + fileIndex) + rankIndex as Square;

                            const isSelected = selectedSquare === squareRepresentation;

                            return (
                                <div
                                    key={j}
                                    onClick={() => handleSquareClick(squareRepresentation, square)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(squareRepresentation)}
                                    className={`w-16 h-16 ${(i + j) % 2 === 0 ? "bg-lime-100" : "bg-lime-700"} ${isSelected ? "border-4 border-yellow-500" : ""}`}
                                >
                                    <div className="w-full justify-center flex h-full">
                                        <div className="h-full justify-center flex flex-col">
                                            {square ? (
                                                <img
                                                    className="w-16 h-16"
                                                    src={`/${square.color === "b" ? `b${square.type}` : `w${square.type}`}.png`}
                                                    alt={`Chess piece: ${square.color}${square.type}`}
                                                    draggable // Enable dragging for the image
                                                    onDragStart={() => handleDragStart(squareRepresentation, square)} // Handle drag start
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
