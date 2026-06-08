'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  completed?: boolean;
}

export default function ProgressBar({ current, total, completed }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="progress-bar-container">
      <div
        className={`progress-bar-fill${completed ? ' completed' : ''}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
