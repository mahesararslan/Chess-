import { FaChessKnight } from "react-icons/fa";

export default function ChessLoader({message}: {message: string}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 flex items-center justify-center">
            <FaChessKnight className="w-16 h-16 text-white animate-bounce" />
          {/* <svg
            className="w-16 h-16 text-black animate-bounce"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19 22H5v-2h14v2M17.16 8.26A8.94 8.94 0 0018 5.5C18 3 16 1 13.5 1c-1.62 0-3.06.45-3.94 1.32l-.66-.66C8.53 1.29 8 1.47 8 2v4c0 .28.22.5.5.5h4c.53 0 .71-.53.34-.9l-.66-.66C12.85 4.36 13.62 4 14.5 4c1.38 0 2.5 1.12 2.5 2.5 0 .95-.53 1.75-1.29 2.18l.9 1.13c1.13-.75 1.9-1.93 2.09-3.31l-1.54-.24zM9.17 19.65l.9-1.13c-1.13-.75-1.9-1.93-2.09-3.31l-1.54.24c.29 2.12 1.4 3.98 2.73 5.2zM17.16 15.74A8.94 8.94 0 0018 13c0-2.5-2-4.5-4.5-4.5-1.62 0-3.06.45-3.94 1.32l-.66-.66C8.53 8.79 8 8.97 8 9.5v4c0 .28.22.5.5.5h4c.53 0 .71-.53.34-.9l-.66-.66c.67-.58 1.44-.94 2.32-.94 1.38 0 2.5 1.12 2.5 2.5 0 .95-.53 1.75-1.29 2.18l.9 1.13c1.13-.75 1.9-1.93 2.09-3.31l-1.54-.24zM9.17 12.13l.9-1.13c-1.13-.75-1.9-1.93-2.09-3.31l-1.54.24c.29 2.12 1.4 3.98 2.73 5.2z" />
          </svg> */}
        </div>
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin"></div>
      </div>
      <p className="ml-4 text-xl font-semibold text-gray-700">{message}</p>
    </div>
  );
}