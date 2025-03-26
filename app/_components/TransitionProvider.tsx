'use client';

import { createContext, useContext, useState } from 'react';

type TransitionDirection = 'up' | 'down' | 'left' | 'right';

const TransitionContext = createContext<{
  direction: TransitionDirection;
  setDirection: (direction: TransitionDirection) => void;
}>({
  direction: 'right',
  setDirection: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<TransitionDirection>('right');

  return (
    <TransitionContext.Provider value={{ direction, setDirection }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionDirection() {
  return useContext(TransitionContext);
} 