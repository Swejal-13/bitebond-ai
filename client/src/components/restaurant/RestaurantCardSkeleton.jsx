/**
 * RestaurantCardSkeleton — animated placeholder while loading
 */
import React from 'react';

const RestaurantCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-44 rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between gap-2">
        <div className="skeleton h-5 rounded-lg flex-1" />
        <div className="skeleton h-5 w-14 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-4 w-16 rounded-md" />
        <div className="skeleton h-4 w-20 rounded-md" />
        <div className="skeleton h-4 w-14 rounded-md" />
      </div>
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex gap-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
  </div>
);

export const RestaurantGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <RestaurantCardSkeleton key={i} />
    ))}
  </div>
);

export default RestaurantCardSkeleton;
