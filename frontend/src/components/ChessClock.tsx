import { useEffect, useState } from "react";
import { GAME_OVER } from "../screens/Game";
import { useSocket } from "../hooks/useSocket";

interface ChessClockProps {
  initialWhiteTime: number;
  initialBlackTime: number;
  isWhiteTurn: boolean;  // Determines which clock to reduce
  isBlack: boolean;
  opponent: string;
  userName: string;
}

export default function ChessClock({
  initialWhiteTime,
  initialBlackTime,
  isWhiteTurn,
  isBlack,
  opponent,
  userName,

}: ChessClockProps) {
  const socket = useSocket();
  const [whiteTime, setWhiteTime] = useState(initialWhiteTime);
  const [blackTime, setBlackTime] = useState(initialBlackTime);

  useEffect(() => {
    
    if(whiteTime === 0) {
      // @ts-ignore
      const winner = isBlack === true ? opponent : userName; // @ts-ignore
      const loser = isBlack === true ? userName : opponent;


      
      if(socket) {
        socket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              timeOut: true,
              winner: winner, // @ts-ignore
              loser: loser,
            },
          })
        )
      }
      
    }

    if(blackTime === 0) {
      // @ts-ignore
      const winner = isBlack === true ? userName : opponent; // @ts-ignore
      const loser = isBlack === true ? opponent : userName;

      if(socket) {
        socket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              timeOut: true,
              winner: winner, // @ts-ignore
              loser: loser,
            },
          })
        )
      }
    }


  }, [whiteTime, blackTime])

  // Format time in minutes:seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Decrease the time for the active player every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (isWhiteTurn && whiteTime > 0) {
        setWhiteTime((prev) => prev - 1);
      } else if (!isWhiteTurn && blackTime > 0) {
        setBlackTime((prev) => prev - 1);
      }
    }, 1000);

    // Clear the interval when the component unmounts or time reaches zero
    return () => clearInterval(interval);
  }, [isWhiteTurn, whiteTime, blackTime]);

  return (
    <div className="bg-stone-800 flex items-center justify-center p-4">
      <div className="bg-stone-700 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="grid grid-cols-2">
          <div className="p-6 border-r border-gray-200">
            <h2 className="text-2xl font-bold mb-2 text-center text-stone-200">White</h2>
            <div className="text-5xl font-mono font-bold text-center text-stone-200">
              {formatTime(whiteTime)}
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-center text-stone-200">Black</h2>
            <div className="text-5xl font-mono font-bold text-center text-stone-200">
              {formatTime(blackTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
