import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState, useEffect } from "react";
import { MOVE } from "../screens/Game";
import { useNavigate } from "react-router-dom";

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
    gameStarted
}) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [whiteKingInCheck, setWhiteKingInCheck] = useState<Square | null>(null);
    const [blackKingInCheck, setBlackKingInCheck] = useState<Square | null>(null);
    const [checkmate, setCheckmate] = useState<boolean>(false);
    const [winner, setWinner] = useState<Color | null>(null);

    // Reverse the board rows if the player is black
    const displayBoard = isBlack ? [...board].reverse() : board;

    const isPlayerPiece = (square: Piece | null): boolean => {
        if (!square) return false;
        return isBlack ? square.color === 'b' : square.color === 'w';
    };

    useEffect(() => {
        updateCheckStatus();
    }, [board, chess]);

    const updateCheckStatus = () => {
        const whiteKingSquare = findKingSquare('w');
        const blackKingSquare = findKingSquare('b');

        if (chess.inCheck()) {

            if (chess.isCheckmate()) {
                const winner = chess.turn() === 'w' ? 'b' : 'w';
                setWinner(winner);   
                setCheckmate(true);
            }
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
                                move: { from, to: squareRepresentation }
                            }
                        })
                    );
                    setBoard(chess.board());
                    setFrom(null);
                    setSelectedSquare(null);
                    updateCheckStatus();
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
                            move: { from, to: squareRepresentation }
                        }
                    })
                );
                setBoard(chess.board());
                setFrom(null);
                setSelectedSquare(null);
                updateCheckStatus();
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
            {checkmate && <Notification winner={winner} visible={checkmate} />}

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
                                    className={`w-16 h-16 ${(i + j) % 2 === 0 ? "bg-lime-100" : "bg-lime-700"} 
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

const Notification = ({visible, winner}: {
    visible: boolean;
    winner: Color | null;
}) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(visible);
  
    const closeNotification = () => {
      setIsVisible(false);
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-80">
            <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={closeNotification}
            >
                &times;
            </button>
            <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl">
                        {winner === 'w' ? "White" : "Black"} wins by checkmate!
                    </p>
                    <button className="font-bold p-5 mt-8 bg-stone-800 w-full hover:bg-stone-600 rounded-lg text-white" onClick={() => {
                        navigate("/game")
                    }}>
                        Dashboard
                    </button>
            </div>
        </div>
      </div>
    );
  };
  