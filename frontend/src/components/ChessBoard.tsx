import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useRef, useState } from "react";
import { MOVE } from "../utils/messages";

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
    isBlack: boolean;
    gameStarted: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
    chess,
    board,
    socket,
    setBoard,
    isBlack,
    gameStarted,

}) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [whiteKingInCheck, setWhiteKingInCheck] = useState<Square | null>(null);
    const [blackKingInCheck, setBlackKingInCheck] = useState<Square | null>(null);
    const moveSound = useRef(new Audio('/move.mp3'));

    // Reverse the board rows if the player is black
    const displayBoard = isBlack ? [...board].reverse() : board;

    const isPlayerPiece = (square: Piece | null): boolean => {
        if (!square) return false;
        return isBlack ? square.color === 'b' : square.color === 'w';
    };

    const updateCheckStatus = () => {
        const whiteKingSquare = findKingSquare('w');
        const blackKingSquare = findKingSquare('b');

        if (chess.inCheck()) {
            if (chess.turn() === 'w') {
                setWhiteKingInCheck(whiteKingSquare);
                setBlackKingInCheck(null);
            } else {
                setBlackKingInCheck(blackKingSquare);
                setWhiteKingInCheck(null);
            }
        } else {
            setWhiteKingInCheck(null);
            setBlackKingInCheck(null);
        }
    };

    const findKingSquare = (color: Color): Square | null => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color) {
                    const fileIndex = j % 8;
                    const rankIndex = 8 - i;
                    return String.fromCharCode(97 + fileIndex) + rankIndex as Square;
                }
            }
        }
        return null;
    };

    const handleSquareClick = (squareRepresentation: Square, square: Piece | null) => {
        if (!gameStarted) {
            console.log("The game has not started yet.");
            return;
        }

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
                                move: { from, to: squareRepresentation },
                            },
                        })
                    );
                    setBoard(chess.board());
                    setFrom(null);
                    setSelectedSquare(null);
                    updateCheckStatus();
                    moveSound.current.play();
                } else {
                    console.log("Invalid move attempted");
                }
            }
        }
    };

    const handleDragStart = (squareRepresentation: Square, square: Piece | null) => {
        if (!gameStarted) {
            console.log("The game has not started yet.");
            return;
        }

        if (square && isPlayerPiece(square)) {
            setFrom(squareRepresentation);
        } else {
            console.log("You can't drag your opponent's pieces.");
        }
    };

    const handleDrop = (squareRepresentation: Square) => {
        if (!gameStarted) {
            console.log("The game has not started yet.");
            return;
        }

        if (from) {
            const move = chess.move({ from, to: squareRepresentation });
            if (move) {
                socket.send(
                    JSON.stringify({
                        type: MOVE,
                        payload: {
                            move: { from, to: squareRepresentation },
                        },
                    })
                );
                setBoard(chess.board());
                setFrom(null);
                setSelectedSquare(null);
                updateCheckStatus();
                moveSound.current.play();
                
            } else {
                console.log("Invalid move attempted");
            }
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const getSquareRepresentation = (i: number, j: number): Square => {
        const fileIndex = isBlack ? 7 - (j % 8) : j % 8;
        const rankIndex = isBlack ? i + 1 : 8 - i;
        return String.fromCharCode(97 + fileIndex) + rankIndex as Square;
    };

    const isKingInCheck = (squareRepresentation: Square): boolean => {
        return squareRepresentation === whiteKingInCheck || squareRepresentation === blackKingInCheck;
    };

    return (
        <div className="text-white-200 rounded-lg">


            {displayBoard.map((row, i) => {
                const displayRow = isBlack ? [...row].reverse() : row;

                return (
                    <div key={i} className="flex">
                        
                        {displayRow.map((square, j) => {
                            const squareRepresentation = getSquareRepresentation(i, j);
                            const isSelected = selectedSquare === squareRepresentation;
                            const isInCheck = isKingInCheck(squareRepresentation);

                            return (
                                <div
                                    key={j}
                                    onClick={() => handleSquareClick(squareRepresentation, square)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(squareRepresentation)}
                                    className={`w-10 h-10 sm:w-14 sm:h-14  ${(i + j) % 2 === 0 ? "bg-lime-100" : "bg-lime-700"} 
                                        ${isSelected ? "border-4 border-yellow-500" : ""}
                                        ${isInCheck ? "border-4 border-red-600" : ""}`}
                                >
                                    
                                    <div className="w-full justify-center flex h-full">
                                        <div className="h-full justify-center flex flex-col">
                                            
                                            {square ? (
                                                <img
                                                    className="w-16 h-16"
                                                    src={`/${square.color}${square.type}.png`}
                                                    alt={`Chess piece: ${square.color}${square.type}`}
                                                    draggable={gameStarted}
                                                    onDragStart={() => handleDragStart(squareRepresentation, square)}
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


  