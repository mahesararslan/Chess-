import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Appbar } from "../components/Appbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ErrorNotification, Notification, ResignNotification } from "../components/Notification";
import { error } from "console";

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
  const [resignMessage, setResignMessage] = useState(""); // To show opponent resignation
  const [winner, setWinner] = useState(null); // To track the winner
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState("");

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
          const { winner, loser, resign } = message.payload;

          if (resign) { // @ts-ignore
            const resigningPlayer = loser === user?.name ? user?.name : opponent;
            setResignMessage(`${resigningPlayer} has resigned.`); // @ts-ignore
            const winningPlayer = winner === user?.name ? user?.name : opponent;
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

  const handleResign = () => { // @ts-ignore
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

  if (!socket) return <div>Connecting...</div>;

  if (!user && !opponent) return <div>Loading user data...</div>;

  return (
    <div>
      <Appbar />
      <div className="justify-center flex bg-stone-700">
        <div className="pt-8 max-w-screen-lg w-full ">
          <div className="grid grid-cols-6 gap-4 w-full">
            <div className="p-8 col-span-4 w-full flex justify-center bg-stone-800">
              <ChessBoard
                isBlack={isBlack}
                chess={chess}
                setBoard={setBoard}
                socket={socket}
                board={board}
                gameStarted={gameStarted}
                opponent={opponent} // @ts-ignore
                myName={user?.name}
              />
            </div>
            <div className="col-span-2 bg-stone-800 w-full flex flex-col items-center">
              <div className="pt-8 max-w-full flex flex-col gap-5 justify-center">
                {/* Loader for waiting */}
                {!started && loader && <h1 className="text-2xl text-white">Waiting for opponent...</h1>}
                {/* Button to start the game */}
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
                          },
                        })
                      );
                    }}
                  >
                    Play
                  </Button>
                )}
                {/* Show Resign button for active player */}
                {started && (
                  <button
                    onClick={handleResign}
                    className="mx-5 shadow-lg px-8 py-4 w-full text-2xl bg-lime-700 hover:bg-lime-400 text-white font-bold rounded"
                  >
                    Resign
                  </button>
                )}
                {/* Show Dashboard button for the winner */}
                {winner && (
                  <button
                    onClick={() => navigate("/")}
                    className="mx-5 shadow-lg px-8 py-4 w-full text-2xl bg-stone-700 hover:bg-stone-900 text-white font-bold rounded"
                  >
                    Dashboard
                  </button>
                )}
                {resignMessage && (
                  <ResignNotification message={resignMessage} visible={resignMessage !== ""} />
                )}
                {gameOver && !resignMessage && (
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
