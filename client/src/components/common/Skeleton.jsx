import React from 'react';

export const SkeletonRow = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="tf-card p-5 space-y-3">
    <div className="skeleton h-5 w-1/3 rounded" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
    ))}
  </div>
);

export const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton h-4 w-1/2 rounded" />
    <div className="skeleton h-8 w-1/3 rounded mt-2" />
  </div>
);

const Skeleton = ({ type = 'card', count = 1, cols = 4 }) => {
  if (type === 'row') {
    return Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} cols={cols} />);
  }
  if (type === 'stat') {
    return Array.from({ length: count }).map((_, i) => <SkeletonStat key={i} />);
  }
  return Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />);
};

export default Skeleton;
