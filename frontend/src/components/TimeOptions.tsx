import { useState } from 'react';

interface TimeSelectorProps {
  onTimeSelect: (time: number) => void;
}

export default function TimeSelector({ onTimeSelect }: TimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const timeOptions = [
    { label: '3 min', value: 3 },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
  ];

  const handleTimeSelect = (time: number) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Select Match Time</h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        {timeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleTimeSelect(option.value)}
            className={`
              w-full sm:w-auto px-4 py-3 text-lg font-semibold rounded-lg
              transition-colors duration-200 ease-in-out font-mono
              ${
                selectedTime === option.value
                  ? 'bg-lime-600 text-white'
                  : 'bg-white text-lime-600 border-2 border-lime-600 hover:bg-blue-100'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}