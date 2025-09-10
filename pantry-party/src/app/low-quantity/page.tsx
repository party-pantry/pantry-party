// app/page.tsx
import React from "react";

type Item = {
  name: string;
  quantity: number;
};

const items: Item[] = [
  { name: "Tomatoes", quantity: 3, },
  { name: "Chicken Breast", quantity: 5, },
  { name: "Egg", quantity: 0, },
  { name: "Milk", quantity: 2, },
  { name: "Bread", quantity: 1, },
  { name: "Carrots", quantity: 0, },
  { name: "Cheese", quantity: 0,  },
  { name: "Apples", quantity: 0, },
  { name: "Spinach", quantity: 0, },
];

export default function Page() {
  const restockThreshold = 5;

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
            <th className="p-2 text-left">Need to be Restock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="p-2">
                <input type="checkbox" />
              </td>
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">
                {item.quantity <= restockThreshold ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
