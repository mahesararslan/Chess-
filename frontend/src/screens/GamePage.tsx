
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Clock, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { INIT_GAME } from "./Game"
import { useSocket } from "../hooks/useSocket"
import axios from "axios"

export function GamePage() {
    const socket = useSocket();
    const [selectedTime, setSelectedTime] = useState(5) // Default to 5 minutes
    const [isSearching, setIsSearching] = useState(false)
    const [animateBoard, setAnimateBoard] = useState(false)
    const loadingTextRef = useRef(null)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
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
            setUser(response.data);
            console.log("User's Name", response.data.name);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Message received:", message);

            switch (message.type) {
                case INIT_GAME:
                    // @ts-ignore
                    navigate(`/game?gameId=${message.payload.gameId}`);
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
        if (!socket) return
        alert("Game starting");
        console.log(selectedTime);
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
                {/* Header */}
                <div className="my-8 flex justify-center items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">New Game</h1>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
                    {/* Chess Board */}
                    <div
                        className={`relative mb-8 w-full max-w-md mx-auto ${animateBoard ? "animate-pulse-subtle" : "animate-fade-in"
                            }`}
                    >
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

                    {/* Game Options */}
                    <div className="w-full max-w-md animate-fade-in animation-delay-200">
                        {!isSearching ? (
                            <>
                                {/* Time Selection */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                        Select Time Control
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        {timeOptions.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-3 px-4 rounded-lg transition-all duration-300 ${selectedTime === time
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
                            </>
                        ) : (
                            /* Waiting for Opponent */
                            <div className="text-center py-8 animate-fade-in">
                                <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto mb-4" />
                                <p ref={loadingTextRef} className="text-xl font-medium text-amber-400">
                                    Waiting for opponent...
                                </p>
                                <p className="mt-2 text-gray-400">Time control: {selectedTime} minutes</p>
                                <button
                                    onClick={() => setIsSearching(false)}
                                    className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


