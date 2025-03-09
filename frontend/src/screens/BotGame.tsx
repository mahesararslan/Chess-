import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Popup from "../components/Popup";
import { Loader2 } from "lucide-react";
import PlayerInfo from "../components/PlayerInfo";
import axios from "axios";
import { ChessClockBot } from "../components/ChessClock";

const BotGame = () => {
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [selectedTime, setSelectedTime] = useState(5) // Default to 5 minutes
    const [isSearching, setIsSearching] = useState(false)
    const [animateBoard, setAnimateBoard] = useState(false)
    const loadingTextRef = useRef(null)
    const [user, setUser] = useState(null)
    const [currentPlayer, setCurrentPlayer] = useState(null)
    const [opponent, setOpponent] = useState(null)
    const [gameState, setGameState] = useState("setup")
    const [difficulty, setDifficuly] = useState("medium")
    const timeOptions = [3, 5, 10];
    const isBlack = false;

    const makeBotMove = () => {
        let move = null;

        if (difficulty === 'easy') {
            const moves = chess.moves();
            move = moves[Math.floor(Math.random() * moves.length)];
        } else if (difficulty === 'medium') {
            move = getBestCaptureMove() || getRandomMove();
        } else if (difficulty === 'hard') {
            move = getMinimaxMove();
        }

        if (move) {
            setTimeout(() => {
                chess.move(move);
                setBoard(chess.board());
            }, 2000);
        }
    };

    const getRandomMove = () => {
        const moves = chess.moves();
        return moves[Math.floor(Math.random() * moves.length)];
    };

    const getBestCaptureMove = () => {
        return chess.moves().find((move) => move.includes("x"));
    };

    const getMinimaxMove = () => {
        // Minimax logic with depth control
        const moves = chess.moves();
        return moves[0];
    };

    const handleStartGame = () => {
        setAnimateBoard(true);
        setGameState("playing");
        setIsSearching(true); // @ts-ignore
        
    };

    useEffect(() => {
        axios
        .get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
        .then((response) => {
            const user = response.data;
            setUser(user);
            setCurrentPlayer(user); // @ts-ignore
            console.log("User's Name", user?.name);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    return <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">

                {/* Header */}
                {(gameState === "setup") ? (
                    <div className="my-8 flex justify-center items-center">
                        <h1 className="text-2xl md:text-3xl font-bold">New Game</h1>
                    </div>
                ): (
                    <div className="my-8 flex justify-center items-center"></div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                {gameState === "setup" && (
                    <div className="w-full max-w-md animate-fade-in">
                    {/* Chess Board Preview */}
                    <div className="mb-8 w-full max-w-md mx-auto">
                        <div className="aspect-square relative">
                        <div className="absolute inset-0 bg-amber-500 rounded-xl blur-3xl transform -rotate-2"></div>
                            <img
                                src="/chessboard.png"
                                alt="Chess board"
                                className={`relative rounded-xl shadow-2xl w-full h-full object-cover ${animateBoard
                                        ? "animate-subtle-float"
                                        : "transform hover:rotate-3 transition-transform duration-500"
                                    }`}
                            />
                    </div>
                    </div>

                    {/* Time Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Select Time Control</h2>
                        <div className="grid grid-cols-3 gap-4">
                        {timeOptions.map((time) => (
                            <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 px-4 rounded-lg transition-all duration-300 ${
                                selectedTime === time
                                ? "bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-lg scale-105"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                            >
                            {time} min
                            </button>
                        ))}
                        </div>
                    </div>

                    {/* Select Difficuly level */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Select Difficulty Level</h2>
                        <div className="grid grid-cols-3 gap-4">
                        {["easy", "medium", "hard"].map((level) => (
                            <button
                            key={level}
                            onClick={() => setDifficuly(level)}
                            className={`py-3 px-4 rounded-lg transition-all duration-300 ${
                                difficulty === level
                                ? "bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-lg scale-105"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                            >
                            {level}
                            </button>
                        ))}
                        </div>
                    </div>


                    {/* Start Game Button */}
                    <button
                        onClick={handleStartGame}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 mb-4"
                    >
                        Start Game
                    </button>
                    </div>
                )}

                
                {(gameState === "playing" || gameState === "gameOver") && (
                    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 animate-fade-in">
                    {/* Game Info - Top on mobile, left on desktop */}
                    <div className="flex flex-col gap-6 order-2 lg:order-1">
                        {/* Player Info */}
                        <div className="flex flex-col gap-4">
                        <PlayerInfo player={{name:"ChessBot" ,image:"data:image/jpeg;base64,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"}} isActive={!(!isBlack && chess.turn() === "w" || isBlack && chess.turn() === "b")} />
                        <PlayerInfo player={currentPlayer} isActive={!isBlack && chess.turn() === "w" || isBlack && chess.turn() === "b"} />
                        </div>

                        {/* @ts-ignore */}
                        <ChessClockBot initialTime={selectedTime} isWhiteTurn={chess.turn() === "w"} isRunning={gameState === "playing"} isBlack={isBlack} userName={user?.name} opponent={opponent?.name} />
                        {gameState === "gameOver" && (
                            
                            <div className="flex flex-col gap-4">
                                <h2 className="text-xl font-semibold">Game Over</h2>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all duration-300"
                                >
                                    New Game
                                </button>
                            </div>
                        )}

                        
                    </div>

                    {/* Chess Board - Center on mobile, right on desktop */}
                    <div className="order-1 lg:order-2 flex items-center justify-center">
                    <ChessBoard
                        chess={chess}
                        board={board}
                        setBoard={setBoard}
                        isBlack={false}
                        onPlayerMove={() => makeBotMove()}
                        setGameState={setGameState}
                    />
                    </div>
                    </div>
                )}
            </div>
        </div>
    </div>

    // return (
    //     <div>
    //         <ChessBoard
    //             chess={chess}
    //             board={board}
    //             setBoard={setBoard}
    //             isBlack={false}
    //             onPlayerMove={() => makeBotMove()}
    //         />
    //     </div>
    // )
};


interface Piece {
    square: Square;
    type: PieceSymbol;
    color: Color;
}

interface ChessBoardProps {
    chess: Chess;
    board: (Piece | null)[][];
    setBoard: React.Dispatch<React.SetStateAction<(Piece | null)[][]>>;
    isBlack: boolean;
    onPlayerMove: (move: { from: Square; to: Square }) => void;
    setGameState: React.Dispatch<React.SetStateAction<string>>;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
    chess,
    board,
    setBoard,
    isBlack,
    onPlayerMove,
    setGameState
}) => {
    const [from, setFrom] = useState<Square | null>(null);
        const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
        const [whiteKingInCheck, setWhiteKingInCheck] = useState<Square | null>(null);
        const [blackKingInCheck, setBlackKingInCheck] = useState<Square | null>(null);
        const [showPopup, setShowPopup] = useState(false)
        const [popupData, setPopupData] = useState({ title: "", message: "" })
    
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

            if(chess.isCheckmate()) {
                // popup
                setShowPopup(true);
                // who won?
                chess.turn() === 'w' ? setPopupData({ title: "Game Over", message: "It's a checkmate, You Won!" }) :
                setPopupData({ title: "Game Over", message: "It's a checkmate, You Lost!" });
                setGameState("gameOver");
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
                        onPlayerMove({ from, to: squareRepresentation });
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
    
            if (square && isPlayerPiece(square)) {
                setFrom(squareRepresentation);
            } else {
                console.log("You can't drag your opponent's pieces.");
            }
        };

        const handleDrop = (squareRepresentation: Square) => {
        
                if (from) {
                    const move = chess.move({ from, to: squareRepresentation });
                    if (move) {
                        setBoard(chess.board());
                        setFrom(null);
                        setSelectedSquare(null);
                        updateCheckStatus();
                        onPlayerMove({ from, to: squareRepresentation });
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
                                        {/* Game Over Popup */}
                                        {showPopup && <Popup title={popupData.title} message={popupData.message} onClose={() => setShowPopup(false)} />}
                                        
                                        <div className="w-full justify-center flex h-full">
                                            <div className="h-full justify-center flex flex-col">
                                                
                                                {square ? (
                                                    <img
                                                        className="w-16 h-16 transition-transform duration-2000 ease-in-out"
                                                        src={`/${square.color}${square.type}.png`}
                                                        alt={`Chess piece: ${square.color}${square.type}`}
                                                        draggable={true}
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

export default BotGame;