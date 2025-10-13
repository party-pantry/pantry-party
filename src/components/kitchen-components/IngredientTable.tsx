/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import IngredientRow from './IngredientRow';

// Properties of an ingredient item in table
type Item = {
  id: number;
  name: string;
  // image: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
};

interface Props {
  items: Item[];
  onDelete: (id: number) => void;
  onEdit: (ingredientId: number, stockId: number) => void;
}

// Mockup UI of what list of ingredients table could look like
const IngredientTable: React.FC<Props> = ({ items, onDelete, onEdit }) => (
  <table className="w-full h-full border-collapse bg-white shadow-md rounded">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-3 text-left">
          <input type="checkbox" />
        </th>
        <th className="p-3 text-left">Items</th>
        {/* <th className="p-3 text-left">Image</th> */}
        <th className="p-3 text-left">Quantity</th>
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
        items.map((item, idx) => (
          <IngredientRow key={`${item.id}-${idx}`} {...item} onDelete={onDelete} onEdit={onEdit} />
        ))
      )}
    </tbody>
  </table>
);

export default IngredientTable;
