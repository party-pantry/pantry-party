import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button } from 'react-bootstrap';

interface CookingTimerProps {
  prepTime: number;
  cookTime: number;
  downTime?: number;
  onTimerFinish?: () => void;
}

const CookingTimer: React.FC<CookingTimerProps> = ({ prepTime, cookTime, downTime, onTimerFinish }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = prepTime + cookTime + (downTime || 0);

  const memoizedOnTimerFinish = useCallback(() => {
    if (onTimerFinish) {
      setTimeout(() => {
        onTimerFinish();
      }, 0);
    }
  }, [onTimerFinish]);

  useEffect(() => {
    setTimeLeft(totalTime * 60);
    setIsActive(false);
    setIsPaused(false);
  }, [totalTime]);

  const handleStart = (): void => {
    if (timeLeft > 0) {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handlePause = (): void => {
    if (isActive) {
      setIsPaused(true);
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleReset = (): void => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(totalTime * 60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false);
            setIsPaused(false);
            memoizedOnTimerFinish();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, memoizedOnTimerFinish]);

  const formatTime = (time: number): string => {
    if (typeof time !== 'number' || Number.isNaN(time) || time < 0) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const totalTimeInSeconds = totalTime * 60;
  const progressPercentage = totalTimeInSeconds > 0
    ? ((totalTimeInSeconds - timeLeft) / totalTimeInSeconds) * 100
    : 0;

  const getPathColor = (): string => {
    if (progressPercentage >= 90) return 'red';
    if (progressPercentage >= 50) return 'goldenrod';
    return 'green';
  };

  return (
      <div className='flex flex-col items-center p-6 bg-white rounded-2xl shadow-md'>
        <div className='relative mb-6'>
          <div className='relative w-48 h-48'>
            <CircularProgressbar
              value={progressPercentage}
              text={formatTime(timeLeft)}
              styles={buildStyles({
                textSize: '16px',
                pathColor: getPathColor(),
                textColor: 'black',
                trailColor: '#D3D3D3',
                backgroundColor: 'white',
                pathTransitionDuration: 1,
              })}
            />
          </div>
        </div>

      <div className='d-flex justify-content-between gap-4 w-75'>
        {!isActive ? (
          <Button className='w-50' variant='success' onClick={handleStart}>
            {isPaused ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button className='w-50' variant='warning' onClick={handlePause}>
            Pause
          </Button>
        )}
        <Button className='w-50' variant='danger' onClick={handleReset}>
          Reset
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Total time: {totalTime} minutes
      </p>
    </div>
  );
};

export default CookingTimer;
