import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Appbar } from "../components/Appbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DisconnectedNotification, ErrorNotification, Notification, ResignNotification, TimeoutNotification } from "../components/Notification";
import TimeSelector from "../components/TimeOptions";
import ChessClock from "../components/ChessClock";
import ChessLoader from "../components/Loader";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const ERROR = "error"

export const Game = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [isBlack, setIsBlack] = useState(false);
  const [user, setUser] = useState(null);
  const [opponent, setOpponent] = useState("");
  const [loader, setLoader] = useState(false);
  const [resignMessage, setResignMessage] = useState("");
  const [winner, setWinner] = useState(null); 
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState("");
  const [disconnectedMessage, setDisconnectedMessage] = useState("");
  const [whiteTime, setWhiteTime] = useState(300); // Default: 5 minutes
  const [blackTime, setBlackTime] = useState(300); // Default: 5 minutes
  const [timeControl, setTimeControl] = useState(300); // Default to 5 minutes
  const [timeOut, setTimeOut] = useState(false);
  const [timeOutMessage, setTimeOutMessage] = useState("");
  

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

  // Add gameStarted state
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          setGameStarted(true);
          setIsBlack(message.payload.color === "black");
          setOpponent(message.payload.opponentName);
          setLoader(false);
          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log("Move made");
          break;
        case GAME_OVER:
          setGameStarted(false);
          setStarted(false);
          setLoader(false);
          setGameOver(true);
          const { winner, loser, checkmate, resign, disconnected, timeOut } = message.payload;

          if (resign) { // @ts-ignore
            const resigningPlayer = loser === user?.name ? user?.name : opponent;
            setResignMessage(`${resigningPlayer} has resigned.`); // @ts-ignore
            const winningPlayer = winner === user?.name ? user?.name : opponent;
            setWinner(winningPlayer);
          }

          if(checkmate) {
            setResignMessage(`${winner} wins by checkmate.`); // @ts-ignore
            const winningPlayer = winner === user?.name ? user?.name : opponent;
            setWinner(winningPlayer);
          }

          if(timeOut) {
            console.log("Timeout reached in frontend");
            setTimeOut(true);
            setTimeOutMessage(`${message.payload.winner} wins!\n${message.payload.loser} ran out of time.`);
            // setGameOver(true);
          }

          if(!checkmate && !resign && disconnected) {
            setDisconnectedMessage(message.payload.message); // @ts-ignore
            const winningPlayer = disconnected === user?.name ? opponent : user?.name;
            setWinner(winningPlayer);
          }
          break;
        case ERROR:
          console.error(message.payload.message);
          setError(message.payload.message);
          break;
      }
    };
  }, [socket, chess, opponent, user]);

  


  const handleResign = () => { 
    // Reset timers and game state
    setWhiteTime(timeControl);
    setBlackTime(timeControl);
    // @ts-ignore
    const resigningPlayer = user?.name; // @ts-ignore
    const winningPlayer = resigningPlayer === user?.name ? opponent : user?.name;
 // @ts-ignore
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

    setStarted(false);
    setLoader(false);
    setGameStarted(false);
    setChess(new Chess());
    setBoard(chess.board());
  };

  if (!socket) return
      <div>
        <ChessLoader message="Connecting" />
      </div>

  if (!user && !opponent) return
    <div>
      <ChessLoader message="Loading User Data" />
    </div>

  return (
    <div>
      <Appbar />
      <div className="justify-center flex bg-stone-700 h-screen lg:h-auto ">
        <div className="pt-8 max-w-screen-lg w-full ">
          <div className="lg:grid lg:grid-cols-6 gap-4 w-full">
            <div className="p-8 col-span-4 w-full flex justify-center bg-stone-800">
              <ChessBoard
                isBlack={isBlack}
                chess={chess}
                setBoard={setBoard}
                socket={socket}
                board={board}
                gameStarted={gameStarted}
                // opponent={opponent} // @ts-ignore
                // myName={user?.name}
              />
            </div>
            <div className="col-span-2 bg-stone-800 w-full flex flex-col items-center">
              <div className="pt-8 max-w-full flex flex-col gap-5 justify-center pb-10 sm:pb-0">
                
                {!started && loader && <h1 className="text-2xl text-white">Waiting for opponent...</h1>}
                {!loader && !started && (
                  <TimeSelector onTimeSelect={(time) => {
                    setTimeControl(time * 10)
                    setWhiteTime(time * 60)
                    setBlackTime(time * 60)
                    
                  }
        
                  } />
                )}
                {!loader && !started && (
                  <Button
                    onClick={() => {
                      setLoader(true);
                      socket.send(
                        JSON.stringify({
                          type: INIT_GAME,
                          payload: { // @ts-ignore
                            userId: user?.id, // @ts-ignore
                            userName: user?.name,
                            timeLimit: timeControl,
                          },
                        })
                      );
                    }}
                  >
                    Play
                  </Button>
                )}
                {started && ( // @ts-ignore
                  <ChessClock initialWhiteTime={whiteTime} initialBlackTime={blackTime} isWhiteTurn={chess.turn() === "w"} isBlack={isBlack} userName={user.name} opponent={opponent} />
                )}
                {started && (
                  <button
                    onClick={handleResign}
                    className="mx-5 shadow-lg px-8 py-4 max-w-full text-2xl bg-lime-700 hover:bg-lime-400 text-white font-bold rounded"
                  >
                    Resign
                  </button>
                )}
                {!started && !loader && (
                  <button
                  onClick={() => navigate("/")}
                  className="mx-5 shadow-lg px-8 py-4 max-w-full text-2xl bg-stone-700 hover:bg-stone-900 text-white font-bold rounded"
                >
                  Home
                </button>
                )}
                {resignMessage && (
                  <ResignNotification message={resignMessage} visible={resignMessage !== ""} />
                )}
                {timeOut && (
                  <TimeoutNotification visible={timeOut} message={timeOutMessage} />
                )}
                {disconnectedMessage && (
                  <DisconnectedNotification message={disconnectedMessage} visible={disconnectedMessage !== ""} />
                )}
                {gameOver && !resignMessage && !disconnectedMessage && !timeOut && (
                  <Notification visible={true} winner={winner} />
                )}
                {error && <ErrorNotification visible={true} message={error} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// import { useEffect, useState } from "react";
// import { Chess } from "chess.js";
// import { Button } from "../components/Button";
// import { ChessBoard } from "../components/ChessBoard";
// import { useSocket } from "../hooks/useSocket";
// import { Appbar } from "../components/Appbar";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import axios from "axios";
// import { DisconnectedNotification, ErrorNotification, Notification, ResignNotification, TimeoutNotification } from "../components/Notification";
// import TimeSelector from "../components/TimeOptions";
// import ChessClock from "../components/ChessClock";
// import ChessLoader from "../components/Loader";

// export const INIT_GAME = "init_game";
// export const MOVE = "move";
// export const GAME_OVER = "game_over";
// export const ERROR = "error"

// export const Game = () => {
//   const socket = useSocket();
//   const navigate = useNavigate();
//   const [chess, setChess] = useState(new Chess());
//   const [board, setBoard] = useState(chess.board());
//   const [started, setStarted] = useState(false);
//   const [isBlack, setIsBlack] = useState(false);
//   const [user, setUser] = useState(null);
//   const [opponent, setOpponent] = useState("");
//   const [loader, setLoader] = useState(false);
//   const [resignMessage, setResignMessage] = useState("");
//   const [winner, setWinner] = useState(null); 
//   const [gameOver, setGameOver] = useState(false);
//   const [error, setError] = useState("");
//   const [disconnectedMessage, setDisconnectedMessage] = useState("");
//   const [whiteTime, setWhiteTime] = useState(300); // Default: 5 minutes
//   const [blackTime, setBlackTime] = useState(300); // Default: 5 minutes
//   const [timeControl, setTimeControl] = useState(300); // Default to 5 minutes
//   const [timeOut, setTimeOut] = useState(false);
//   const [timeOutMessage, setTimeOutMessage] = useState("");
//   const [gameId, setGameId] = useState<string | null>(null);
//   const [gameLoading, setGameLoading] = useState(true);
  

//   useEffect(() => {
//     const Id = localStorage.getItem("gameId");
//     setGameId(Id);
//     console.log("Game ID", gameId);
//     if(!gameId) return;

//     async function fetchGame() {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-game/${gameId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         console.log("Game Data", response.data);
//         setStarted(true);
//         setGameStarted(true); // @ts-ignore
//         if(response.data.game.blackId === user?.id) {
//           setIsBlack(true);
//         }
//         // @ts-ignore
//         const opponentId = response.data.game.blackId === user?.id ? response.data.game.whiteId : response.data.game.blackId;
//         console.log("Opponent ID", opponentId);
//         const res = await axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-opponent/${opponentId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         console.log("Opponent Data", res.data);
//         setBoard(chess.board());
//         setOpponent(res.data.opponent.name);
//         setLoader(false);
//         setGameLoading(false);
//         // setIsBlack(game.color === "black");
//         // setOpponent(opponentName);
//         // setLoader(false);
//       } catch (error) {
//         console.error(error);
//       }
//     }

//     fetchGame();
//   },[gameId, user]);

  

//   // Fetch the user details
//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       })
//       .then((response) => {
//         setUser(response.data);
//         console.log("User's Name", response.data.name);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }, []);

//   // Add gameStarted state
//   const [gameStarted, setGameStarted] = useState(false);

//   useEffect(() => {
//     if (!socket) {
//       return;
//     }
//     socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       switch (message.type) {
//         case INIT_GAME:
//           setBoard(chess.board());
//           setStarted(true);
//           setGameStarted(true);
//           setIsBlack(message.payload.color === "black");
//           setOpponent(message.payload.opponentName);
//           setLoader(false);
//           break;
//         case MOVE:
//           const move = message.payload;
//           chess.move(move);
//           setBoard(chess.board());
//           console.log("Move made");
//           break;
//         case GAME_OVER:
//           setGameStarted(false);
//           setStarted(false);
//           setLoader(false);
//           setGameOver(true);
//           const { winner, loser, checkmate, resign, disconnected, timeOut } = message.payload;

//           if (resign) { // @ts-ignore
//             const resigningPlayer = loser === user?.name ? user?.name : opponent;
//             setResignMessage(`${resigningPlayer} has resigned.`); // @ts-ignore
//             const winningPlayer = winner === user?.name ? user?.name : opponent;
//             setWinner(winningPlayer);
//           }

//           if(checkmate) {
//             setResignMessage(`${winner} wins by checkmate.`); // @ts-ignore
//             const winningPlayer = winner === user?.name ? user?.name : opponent;
//             setWinner(winningPlayer);
//           }

//           if(timeOut) {
//             console.log("Timeout reached in frontend");
//             setTimeOut(true);
//             setTimeOutMessage(`${message.payload.winner} wins!\n${message.payload.loser} ran out of time.`);
//             // setGameOver(true);
//           }

//           if(!checkmate && !resign && disconnected) {
//             setDisconnectedMessage(message.payload.message); // @ts-ignore
//             const winningPlayer = disconnected === user?.name ? opponent : user?.name;
//             setWinner(winningPlayer);
//           }
//           break;
//         case ERROR:
//           console.error(message.payload.message);
//           setError(message.payload.message);
//           break;
//       }
//     };
//   }, [socket, chess, opponent, user]);

  


//   const handleResign = () => { 
//     // Reset timers and game state
//     setWhiteTime(timeControl);
//     setBlackTime(timeControl);
//     // @ts-ignore
//     const resigningPlayer = user?.name; // @ts-ignore
//     const winningPlayer = resigningPlayer === user?.name ? opponent : user?.name;
//  // @ts-ignore
//     socket.send(
//       JSON.stringify({
//         type: GAME_OVER,
//         payload: {
//           resign: true,
//           winner: winningPlayer,
//           loser: resigningPlayer,
//         },
//       })
//     );

//     setStarted(false);
//     setLoader(false);
//     setGameStarted(false);
//     setChess(new Chess());
//     setBoard(chess.board());
//   };

//   if (!socket || gameLoading) return
//       <div>
//         <ChessLoader message="Connecting" />
//       </div>

//   if (!user && !opponent) return
//     <div>
//       <ChessLoader message="Loading User Data" />
//     </div>

//   return (
//     <div>
//       <Appbar />
//       <div className="justify-center flex bg-stone-700 h-screen lg:h-auto ">
//         <div className="pt-8 max-w-screen-lg w-full ">
//           <div className="lg:grid lg:grid-cols-6 gap-4 w-full">
//             <div className="p-8 col-span-4 w-full flex justify-center bg-stone-800">
//               <ChessBoard
//                 isBlack={isBlack}
//                 chess={chess}
//                 setBoard={setBoard}
//                 socket={socket}
//                 board={board}
//                 gameStarted={gameStarted}
//                 opponent={opponent} // @ts-ignore
//                 myName={user?.name}
//               />
//             </div>
//             <div className="col-span-2 bg-stone-800 w-full flex flex-col items-center">
//               <div className="pt-8 max-w-full flex flex-col gap-5 justify-center pb-10 sm:pb-0">
                
//                 {!started && loader && <h1 className="text-2xl text-white">Waiting for opponent...</h1>}
//                 {!loader && !started && (
//                   <TimeSelector onTimeSelect={(time) => {
//                     setTimeControl(time * 10)
//                     setWhiteTime(time * 60)
//                     setBlackTime(time * 60)
                    
//                   }
        
//                   } />
//                 )}
//                 {!loader && !started && (
//                   <Button
//                     onClick={() => {
//                       setLoader(true);
//                       socket.send(
//                         JSON.stringify({
//                           type: INIT_GAME,
//                           payload: { // @ts-ignore
//                             userId: user?.id, // @ts-ignore
//                             userName: user?.name,
//                             timeLimit: timeControl,
//                           },
//                         })
//                       );
//                     }}
//                   >
//                     Play
//                   </Button>
//                 )}
//                 {started && ( // @ts-ignore
//                   <ChessClock initialWhiteTime={whiteTime} initialBlackTime={blackTime} isWhiteTurn={chess.turn() === "w"} isBlack={isBlack} userName={user.name} opponent={opponent} />
//                 )}
//                 {started && (
//                   <button
//                     onClick={handleResign}
//                     className="mx-5 shadow-lg px-8 py-4 max-w-full text-2xl bg-lime-700 hover:bg-lime-400 text-white font-bold rounded"
//                   >
//                     Resign
//                   </button>
//                 )}
//                 {!started && !loader && (
//                   <button
//                   onClick={() => navigate("/")}
//                   className="mx-5 shadow-lg px-8 py-4 max-w-full text-2xl bg-stone-700 hover:bg-stone-900 text-white font-bold rounded"
//                 >
//                   Home
//                 </button>
//                 )}
//                 {resignMessage && (
//                   <ResignNotification message={resignMessage} visible={resignMessage !== ""} />
//                 )}
//                 {timeOut && (
//                   <TimeoutNotification visible={timeOut} message={timeOutMessage} />
//                 )}
//                 {disconnectedMessage && (
//                   <DisconnectedNotification message={disconnectedMessage} visible={disconnectedMessage !== ""} />
//                 )}
//                 {gameOver && !resignMessage && !disconnectedMessage && !timeOut && (
//                   <Notification visible={true} winner={winner} />
//                 )}
//                 {error && <ErrorNotification visible={true} message={error} />}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
