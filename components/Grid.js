// components/Grid.jsx
import React from 'react';
import clsx from 'clsx';

export default function Grid({ className, children }) {
  return (
    <div className={clsx('grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}
