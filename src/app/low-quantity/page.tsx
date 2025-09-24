/* eslint-disable jsx-a11y/control-has-associated-label */
// app/page.tsx
import React from 'react';

type Item = {
  name: string;
  quantity: number;
};

const items: Item[] = [
  { name: 'Tomatoes', quantity: 3 },
  { name: 'Chicken Breast', quantity: 5 },
  { name: 'Egg', quantity: 0 },
  { name: 'Milk', quantity: 2 },
  { name: 'Bread', quantity: 1 },
  { name: 'Carrots', quantity: 0 },
  { name: 'Cheese', quantity: 0 },
  { name: 'Apples', quantity: 0 },
  { name: 'Spinach', quantity: 0 },
];

export default function Page() {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 2) return 'Low Stock';
    return 'Full Stock';
  };

  const itemsToRestock = items.filter(item => item.quantity <= 2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <table className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-1x1 text-black">
        <thead className="bg-blue-500">
          <tr>
            <th className="p-2 text-left">
              <input type="checkbox" />
            </th>
            <th className="p-2 text-left">Items</th>
            <th className="p-2 text-left">Quantity</th>
            <th className="p-2 text-left">Amount of Stocks</th>
          </tr>
        </thead>
        <tbody>
          {itemsToRestock.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={index} className="border-b last:border-b-0">
              <td className="p-2">
                <input type="checkbox" />
              </td>
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">{getStockStatus(item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
