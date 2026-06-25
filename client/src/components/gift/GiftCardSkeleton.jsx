import React from 'react';

const GiftCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-48 rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-4 w-10 rounded" />
      </div>
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="flex justify-between items-center pt-1">
        <div className="skeleton h-6 w-16 rounded" />
        <div className="skeleton h-7 w-20 rounded-xl" />
      </div>
    </div>
  </div>
);

export const GiftGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => <GiftCardSkeleton key={i} />)}
  </div>
);

export default GiftCardSkeleton;
