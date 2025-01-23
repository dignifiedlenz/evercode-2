// src/app/course/_components/ProgressBar.tsx

'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number; // Value between 0 and 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 h-[75vh] w-2 bg-gray-300 rounded">
      <div
        className="w-full rounded transition-all duration-500"
        style={{ height: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
