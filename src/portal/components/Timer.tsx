import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface TimerProps {
  startTimestamp: number;
  onTimeUp: () => void;
  isSubmitted: boolean;
  duration: number; // Duration in seconds
}

const Timer: React.FC<TimerProps> = ({ startTimestamp, onTimeUp, isSubmitted, duration }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const { data: session } = useSession();

  useEffect(() => {
    if (!startTimestamp || isSubmitted) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
      const remainingSeconds = Math.max(0, duration - elapsedSeconds);
      
      if (remainingSeconds === 0) {
        onTimeUp();
        return 0;
      }
      
      return remainingSeconds;
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTimestamp, onTimeUp, isSubmitted, duration]);

  if (!startTimestamp || isSubmitted) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4 flex items-center justify-center rounded-xl bg-gray-50 p-4 shadow-md dark:bg-gray-800">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatTime(timeLeft)} remaining
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your answers will be automatically submitted when time runs out
        </div>
      </div>
    </div>
  );
};

export default Timer; 