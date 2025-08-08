// components/SkeletonCard.jsx
import React from 'react';
import clsx from 'clsx';

export default function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={clsx('rounded-2xl border border-gray-200 bg-white p-4', className)}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-3 w-full bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}
