/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';

interface Props {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

const statusColors: Record<Props['status'], string> = {
  Good: 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out of Stock': 'bg-red-100 text-red-700',
  Expired: 'bg-red-100 text-red-700',
};

const IngredientRow: React.FC<Props> = ({
  id,
  name,
  image,
  quantity,
  updated,
  status,
  onDelete,
  onEdit,
}) => (
  <tr key={id} className="border-b">
    <td className="p-3">
      <input type="checkbox" />
    </td>
    <td className="p-3">{name}</td>
    <td className="p-3 text-xl">{image}</td>
    <td className="p-3">{quantity}</td>
    <td className="p-3">{updated}</td>
    <td className="p-3">
      <span className={`px-2 py-1 rounded text-sm ${statusColors[status]}`}>
        {status}
      </span>
    </td>
    <td className="p-3 flex gap-2">
      <button
        className="text-gray-600 hover:text-blue-600"
        onClick={() => onEdit(id)}
      >
        ✏️
      </button>
      <button
        className="text-gray-600 hover:text-red-600"
        onClick={() => onDelete(id)}
      >
        🗑️
      </button>
    </td>
  </tr>
);

export default IngredientRow;
