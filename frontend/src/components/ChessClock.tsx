import React from 'react';

interface ChessClockProps {
  whiteTime: number;
  blackTime: number;
}

export default function ChessClock({ whiteTime, blackTime }: ChessClockProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className=" bg-stone-800 flex items-center justify-center p-4">
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