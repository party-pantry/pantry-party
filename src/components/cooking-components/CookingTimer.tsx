import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';

interface CookingTimerProps {
  prepTime: number;
  cookTime: number;
  downTime?: number;
}

const CookingTimer: React.FC<CookingTimerProps> = ({ prepTime, cookTime, downTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = prepTime + cookTime + (downTime || 0);

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
            // TODO: Add notification or sound when timer ends
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
  }, [isActive, timeLeft]);

  const formatTime = (time: number): string => {
    if (typeof time !== 'number' || Number.isNaN(time) || time < 0) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  /* Progress Bar Logic
  const totalTimeInSeconds = totalTime * 60;
  const progressPercentage = totalTimeInSeconds > 0
    ? ((totalTimeInSeconds - timeLeft) / totalTimeInSeconds) * 100
    : 0;
  */

  return (
      <div className='text-center'>
        <div className='mb-3'>
          <h2 className='display-4'>{formatTime(timeLeft)}</h2>
          {/* Not using progress bar for now
          <div className='progress' style={{ height: '10px', width: '300px', margin: '0 auto' }}>
            <div
              className='progress-bar'
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: timeLeft < 60 ? 'red' : 'green',
              }}
            />
          </div>
          */}
        </div>

      <div className='d-flex justify-content-center gap-2'>
        {!isActive ? (
          <Button variant='success' onClick={handleStart}>
            {isPaused ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button variant='warning' onClick={handlePause}>
            Pause
          </Button>
        )}
        <Button variant='danger' onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default CookingTimer;
