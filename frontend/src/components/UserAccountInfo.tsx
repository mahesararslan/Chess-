import { Avatar2 } from './Avatar';

interface UserAccountInfoProps {
  name: string;
  username: string;
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
}

export default function UserAccountInfo({
  name,
  username,
  totalGames,
  wins,
  draws,
  losses
}: UserAccountInfoProps) {
  return (
    <div className="min-h-screen bg-stone-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-stone-800 p-6 text-white">
          <div className="flex items-center space-x-4">
            {/* <img
              src={avatarUrl}
              alt={`${name}'s avatar`}
              className="w-20 h-20 rounded-full border-4 border-white"
            /> */}
            <Avatar2 size="big" name={name} />
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-blue-200">@{username}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Game Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Games</p>
              <p className="text-2xl font-bold text-gray-800">{totalGames}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Wins</p>
              <p className="text-2xl font-bold text-green-800">{wins}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Draws</p>
              <p className="text-2xl font-bold text-yellow-800">{draws}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Losses</p>
              <p className="text-2xl font-bold text-red-800">{losses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          <p className="text-center text-gray-600 text-sm">
            Win Rate: {((wins / totalGames) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}