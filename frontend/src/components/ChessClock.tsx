// import { useEffect, useState } from "react";
// import { GAME_OVER } from "../screens/Game";
// import { useSocket } from "../hooks/useSocket";

// interface ChessClockProps {
//   initialWhiteTime: number;
//   initialBlackTime: number;
//   isWhiteTurn: boolean;  // Determines which clock to reduce
//   isBlack: boolean;
//   opponent: string;
//   userName: string;
// }

// export default function ChessClock({
//   initialWhiteTime,
//   initialBlackTime,
//   isWhiteTurn,
//   isBlack,
//   opponent,
//   userName,

// }: ChessClockProps) {
//   const socket = useSocket();
//   const [whiteTime, setWhiteTime] = useState(initialWhiteTime);
//   const [blackTime, setBlackTime] = useState(initialBlackTime);

//   useEffect(() => {
    
//     if(whiteTime === 0) {
//       // @ts-ignore
//       const winner = isBlack === true ? opponent : userName; // @ts-ignore
//       const loser = isBlack === true ? userName : opponent;


      
//       if(socket) {
//         socket.send(
//           JSON.stringify({
//             type: GAME_OVER,
//             payload: {
//               timeOut: true,
//               winner: winner, // @ts-ignore
//               loser: loser,
//             },
//           })
//         )
//       }
      
//     }

//     if(blackTime === 0) {
//       // @ts-ignore
//       const winner = isBlack === true ? userName : opponent; // @ts-ignore
//       const loser = isBlack === true ? opponent : userName;

//       if(socket) {
//         socket.send(
//           JSON.stringify({
//             type: GAME_OVER,
//             payload: {
//               timeOut: true,
//               winner: winner, // @ts-ignore
//               loser: loser,
//             },
//           })
//         )
//       }
//     }


//   }, [whiteTime, blackTime])

//   // Format time in minutes:seconds
//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   // Decrease the time for the active player every second
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (isWhiteTurn && whiteTime > 0) {
//         setWhiteTime((prev) => prev - 1);
//       } else if (!isWhiteTurn && blackTime > 0) {
//         setBlackTime((prev) => prev - 1);
//       }
//     }, 1000);

//     // Clear the interval when the component unmounts or time reaches zero
//     return () => clearInterval(interval);
//   }, [isWhiteTurn, whiteTime, blackTime]);

//   return (
//     <div className="bg-stone-800 flex items-center justify-center p-4">
//       <div className="bg-stone-700 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
//         <div className="grid grid-cols-2">
//           <div className="p-6 border-r border-gray-200">
//             <h2 className="text-2xl font-bold mb-2 text-center text-stone-200">White</h2>
//             <div className="text-5xl font-mono font-bold text-center text-stone-200">
//               {formatTime(whiteTime)}
//             </div>
//           </div>
//           <div className="p-6">
//             <h2 className="text-2xl font-bold mb-2 text-center text-stone-200">Black</h2>
//             <div className="text-5xl font-mono font-bold text-center text-stone-200">
//               {formatTime(blackTime)}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"
import { useSocket } from "../hooks/useSocket"
import { GAME_OVER } from "../utils/messages"
import Popup from "./Popup"

interface ChessClockProps {
  initialTime: number
  isWhiteTurn: boolean
  isRunning: boolean
  isBlack: boolean
  opponent: string
  userName: string
}

function ChessClock({ initialTime, isWhiteTurn, isRunning, isBlack, opponent, userName }: ChessClockProps) {
  const socket = useSocket()
  // Convert minutes to milliseconds
  const initialTimeMs = initialTime * 60 * 1000

  const [whiteTime, setWhiteTime] = useState(initialTimeMs)
  const [blackTime, setBlackTime] = useState(initialTimeMs)
  const intervalRef = useRef(null)

  // Format time as mm:ss
  const formatTime = (timeMs: any) => {
    const totalSeconds = Math.floor(timeMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  
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

  // Handle clock ticking
  useEffect(() => {
    if (isRunning) { // @ts-ignore
      intervalRef.current = setInterval(() => {
        if (isWhiteTurn) {
          setWhiteTime((prev) => Math.max(0, prev - 100))
        } else {
          setBlackTime((prev) => Math.max(0, prev - 100))
        }
      }, 100)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isWhiteTurn])

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
      {/* Black's clock */}
      <div
        className={`flex-1 rounded-lg p-3 flex items-center justify-between ${
          !isWhiteTurn && isRunning ? "bg-amber-600 text-white animate-pulse-subtle" : "bg-gray-700"
        } transition-colors duration-300`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${!isWhiteTurn && isRunning ? "text-white" : "text-amber-400"}`} />
          <span className="font-mono text-xl font-bold">{formatTime(blackTime)}</span>
        </div>
        <span className="text-sm">Black</span>
      </div>

      {/* White's clock */}
      <div
        className={`flex-1 rounded-lg p-3 flex items-center justify-between ${
          isWhiteTurn && isRunning ? "bg-amber-600 text-white animate-pulse-subtle" : "bg-gray-700"
        } transition-colors duration-300`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isWhiteTurn && isRunning ? "text-white" : "text-amber-400"}`} />
          <span className="font-mono text-xl font-bold">{formatTime(whiteTime)}</span>
        </div>
        <span className="text-sm">White</span>
      </div>
    </div>
  )
}

export default ChessClock



export function ChessClockBot({ initialTime, isWhiteTurn, isRunning, isBlack, opponent, userName }: ChessClockProps) {
  // Convert minutes to milliseconds
  const initialTimeMs = initialTime * 60 * 1000

  const [whiteTime, setWhiteTime] = useState(initialTimeMs)
  const [blackTime, setBlackTime] = useState(initialTimeMs)
  const intervalRef = useRef(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({ title: "", message: "" })
  

  // Format time as mm:ss
  const formatTime = (timeMs: any) => {
    const totalSeconds = Math.floor(timeMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  
  useEffect(() => {
    
    if(whiteTime === 0) {
      // @ts-ignore
      const winner = isBlack === true ? opponent : userName; // @ts-ignore
      const loser = isBlack === true ? userName : opponent;
      
      // set popup
      setPopupData({ title: "Time up", message: `${winner} wins!` })
      setShowPopup(true)
    }

    if(blackTime === 0) {
      // @ts-ignore
      const winner = isBlack === true ? userName : opponent; // @ts-ignore
      const loser = isBlack === true ? opponent : userName;

      // set popup
      setPopupData({ title: "Time up", message: `${winner} wins!` })
      setShowPopup(true)
      
    }


  }, [whiteTime, blackTime])

  // Handle clock ticking
  useEffect(() => {
    if (isRunning) { // @ts-ignore
      intervalRef.current = setInterval(() => {
        if (isWhiteTurn) {
          setWhiteTime((prev) => Math.max(0, prev - 100))
        } else {
          setBlackTime((prev) => Math.max(0, prev - 100))
        }
      }, 100)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isWhiteTurn])

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
      {/* Game Over Popup */}
      {showPopup && <Popup title={popupData.title} message={popupData.message} onClose={() => setShowPopup(false)} />}
      {/* Black's clock */}
      <div
        className={`flex-1 rounded-lg p-3 flex items-center justify-between ${
          !isWhiteTurn && isRunning ? "bg-amber-600 text-white animate-pulse-subtle" : "bg-gray-700"
        } transition-colors duration-300`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${!isWhiteTurn && isRunning ? "text-white" : "text-amber-400"}`} />
          <span className="font-mono text-xl font-bold">{formatTime(blackTime)}</span>
        </div>
        <span className="text-sm">Black</span>
      </div>

      {/* White's clock */}
      <div
        className={`flex-1 rounded-lg p-3 flex items-center justify-between ${
          isWhiteTurn && isRunning ? "bg-amber-600 text-white animate-pulse-subtle" : "bg-gray-700"
        } transition-colors duration-300`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isWhiteTurn && isRunning ? "text-white" : "text-amber-400"}`} />
          <span className="font-mono text-xl font-bold">{formatTime(whiteTime)}</span>
        </div>
        <span className="text-sm">White</span>
      </div>
    </div>
  )
}

