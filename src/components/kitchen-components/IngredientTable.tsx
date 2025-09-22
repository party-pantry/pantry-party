import React from "react";
import IngredientRow from "../IngredientRow";

type Item = {
  id: number;
  name: string;
  quantity: string;
  price: number;
  updated: string;
  status: "Good" | "Low Stock" | "Out of Stock" | "Expired";
};

interface Props {
  items: Item[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

const statusColors: Record<Item["status"], string> = {
  Good: "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
  Expired: "bg-red-100 text-red-700",
};

const IngredientTable: React.FC<Props> = ({ items, onDelete, onEdit }) => {
  return (
    <table className="w-full border-collapse bg-white shadow-md rounded">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">
            <input type="checkbox" />
          </th>
          <th className="p-3 text-left">    Items</th>
          <th className="p-3 text-left">Quantity</th>
          <th className="p-3 text-left">Price</th>
          <th className="p-3 text-left">Last Updated</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-6 text-center">
              No items found.
            </td>
          </tr>
        ) : (
          items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">
                <input type="checkbox" />
              </td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.quantity}</td>
              <td className="p-3">{item.price}</td>
              <td className="p-3">{item.updated}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-sm ${statusColors[item.status]}`}>
                  {item.status}
                </span>
              </td>
              <td className="p-3 flex gap-2">
                <button
                  className="text-gray-600 hover:text-blue-600"
                  onClick={() => onEdit(item.id)}
                >
                  ✏️
                </button>
                <button
                  className="text-gray-600 hover:text-red-600"
                  onClick={() => onDelete(item.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default IngredientTable;
