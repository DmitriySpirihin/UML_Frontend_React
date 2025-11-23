import { useRef } from 'react';

export function useLongPress(callback) {
  const timerRef = useRef();
  const intervalRef = useRef();
  const intervalMsRef = useRef(300);   // стартовый интервал
  const minInterval = 80;
  const step = 40; // на сколько уменьшать задержку каждый раз

  const runAction = () => {
    callback();
    if (intervalMsRef.current > minInterval) {
      intervalMsRef.current -= step;
      if (intervalMsRef.current < minInterval) intervalMsRef.current = minInterval;
    }
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(runAction, intervalMsRef.current);
  };

  const onPointerDown = () => {
    intervalMsRef.current = 300; // reset interval at start
    timerRef.current = setTimeout(() => {
      callback();
      intervalRef.current = setInterval(runAction, intervalMsRef.current);
    }, 300);
  };

  const clearAll = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
  };

  return {
    onPointerDown,
    onPointerUp: clearAll,
    onPointerLeave: clearAll,
    onMouseLeave: clearAll,
    onTouchEnd: clearAll,
  };
}
