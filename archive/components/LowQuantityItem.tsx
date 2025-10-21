/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { AlertTriangle } from 'lucide-react';

type PantryItem = {
  id: number;
  name: string;
  quantity: number;
  threshold: number;
};

export default function LowQuantityItem({ item }: { item: PantryItem }) {
  return (
    <div className="rounded-xl border border-red-300 bg-white shadow-md p-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p className="text-sm text-gray-600">
          Quantity:
          {' '}
          {item.quantity}
          {' '}
          (Threshold:
          {' '}
          {item.threshold}
          )
        </p>
      </div>
      <AlertTriangle className="text-red-500 w-6 h-6" />
    </div>
  );
}
