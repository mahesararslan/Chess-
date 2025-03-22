
import { useState, useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"
import Navbar from "../components/Navbar"
import { GAME_OVER, INIT_GAME, MOVE } from "../utils/messages"
import { useSocket } from "../hooks/useSocket"
import axios from "axios"
import { ChessBoard } from "../components/ChessBoard"
import ChessClock from "../components/ChessClock"
import PlayerInfo from "../components/PlayerInfo"
import { Chess } from "chess.js"
import Popup from "../components/Popup"

export function GamePage() {
    const socket = useSocket();
    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [selectedTime, setSelectedTime] = useState(5) // Default to 5 minutes
    const [isSearching, setIsSearching] = useState(false)
    const [animateBoard, setAnimateBoard] = useState(false)
    const loadingTextRef = useRef(null)
    const [user, setUser] = useState(null)
    const [currentPlayer, setCurrentPlayer] = useState(null)
    const [opponent, setOpponent] = useState(null)
    const [isBlack, setIsBlack] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [popupData, setPopupData] = useState({ title: "", message: "" })
    // const navigate = useNavigate()
    const [gameState, setGameState] = useState("setup") // setup, searching, playing
    
    // Timer options
    const timeOptions = [3, 5, 10];

    // Fetch the user details
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

    async function setOpponentDetails(opponent: string) {
        if(!opponent) return;
        
        console.log("Opponent Details being set: ", opponent);
        try {
            const res = await axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-opponent/${opponent}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
            setOpponent(res.data.opponent);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Message received:", message);

            switch (message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    console.log("message.payload", message.payload);
                    setOpponentDetails(message.payload.opponent);
                    setIsBlack(message.payload.color === "black");
                    setGameState("playing")
                    setGameStarted(true);
                    break;
                case MOVE:
                          const move = message.payload;
                          chess.move(move);
                          setBoard(chess.board());
                          console.log("Move made");
                          break;
                case GAME_OVER:
                    setShowPopup(true);
                    setGameState("gameOver")

                    const { winner, loser, checkmate, resign, disconnected, timeOut } = message.payload;

                    if (checkmate) {
                        setPopupData({
                            title: "Checkmate!",
                            message: `${winner} has won the game by checkmate.`,
                        });
                    } else if (resign) {
                        setPopupData({
                            title: "Resignation",
                            message: `${loser} has resigned. ${winner} wins the game.`,
                        });
                    } else if (disconnected) {
                        setPopupData({
                            title: "Opponent Disconnected",
                            message: `${winner} has won the game because the opponent has disconnected.`,
                        });
                    } else if (timeOut) {
                        setPopupData({
                            title: "Time's Up!",
                            message: `${winner} has won the game on time.`,
                        });
                    }
                    break;
                default:
                    break;
            }
        };


    }, [socket]);



    // Handle start game
    const handleStartGame = () => {
        setIsSearching(true)
        setAnimateBoard(true)
        setGameState("searching")
        if (!socket) return
        if(!user) {
            return;
        }
        
        socket.send(
            JSON.stringify({
                type: INIT_GAME,
                payload: { // @ts-ignore
                    userId: user?.id, // @ts-ignore
                    userName: user?.name,
                    timeLimit: selectedTime * 60,
                },
            })
        );
    }

    // Loading dots animation
    useEffect(() => {
        if (!isSearching || !loadingTextRef.current) return

        let dots = 0
        const interval = setInterval(() => {
            dots = (dots + 1) % 4
            if (loadingTextRef.current) { // @ts-ignore
                loadingTextRef.current.textContent = `Waiting for opponent${".".repeat(dots)}`
            }
        }, 500)

        return () => clearInterval(interval)
    }, [isSearching])

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
                {/* Game Over Popup */}
                {showPopup && <Popup title={popupData.title} message={popupData.message} onClose={() => setShowPopup(false)} />}

                {/* Header */}
                {(gameState === "setup" || gameState === "searching") ? (
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

                    {/* Start Game Button */}
                    <button
                        onClick={handleStartGame}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 mb-4"
                    >
                        Start Game
                    </button>
                    </div>
                )}

                {gameState === "searching" && (
                    <div className="text-center py-8 animate-fade-in">
                    <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto mb-4" />
                    <p ref={loadingTextRef} className="text-xl font-medium text-amber-400">
                        Waiting for opponent...
                    </p>
                    <p className="mt-2 text-gray-400">Time control: {selectedTime} minutes</p>
                    <button
                        onClick={() => setGameState("setup")}
                        className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    </div>
                )}

                {(gameState === "playing" || gameState === "gameOver") && (
                    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 animate-fade-in">
                    {/* Game Info - Top on mobile, left on desktop */}
                    <div className="flex flex-col gap-6 order-2 lg:order-1">
                        {/* Player Info */}
                        <div className="flex flex-col gap-4">
                        <PlayerInfo player={opponent} isActive={!(!isBlack && chess.turn() === "w" || isBlack && chess.turn() === "b")} />
                        <PlayerInfo player={currentPlayer} isActive={!isBlack && chess.turn() === "w" || isBlack && chess.turn() === "b"} />
                        </div>

                        {/* @ts-ignore */}
                        <ChessClock initialTime={selectedTime} isWhiteTurn={chess.turn() === "w"} isRunning={gameState === "playing"} isBlack={isBlack} userName={user?.name} opponent={opponent?.name} />

                        {/* Game Controls */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {/* @ts-ignore */}
                            {gameState === "playing" ? (
                                <button onClick={() => { 
                                    if(!socket) return;
                                    // @ts-ignore
                                    const resigningPlayer = user?.name; // @ts-ignore
                                    const winningPlayer = opponent?.name;
                                    socket.send(
                                          JSON.stringify({
                                            type: GAME_OVER,
                                            payload: {
                                              resign: true,
                                              winner: winningPlayer,
                                              loser: resigningPlayer,
                                            },
                                          })
                                        );
                                }} className="py-2 px-4 bg-red-700/70 hover:bg-red-600 rounded-lg col-span-2 transition-colors">Resign</button>
                            ) : (
                                <button onClick={() => {
                                    window.location.reload();
                                }} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg col-span-2 transition-colors">New Game</button>
                            )}                        
                        </div>
                    </div>

                    {/* Chess Board - Center on mobile, right on desktop */}
                    <div className="order-1 lg:order-2 flex items-center justify-center">
                        <ChessBoard 
                            isBlack={isBlack}
                            chess={chess}
                            setBoard={setBoard} // @ts-ignore
                            socket={socket}
                            board={board}
                            gameStarted={gameStarted}
                        />
                    </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

