/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useMemo } from 'react';
import { MoveDown, MoveUp } from 'lucide-react';
// import { Row } from 'react-bootstrap';
import IngredientRow from './IngredientRow';
import KitchenSortButton from './KitchenSortButton';

// Properties of an ingredient item in table
type Item = {
  id: number;
  name: string;
  ingredientId: number;
  storageId: number;
  // image: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
};

interface Props {
  items: Item[];
  onDelete: (ingredientId: number, storageId: number) => void;
  onEdit: (ingredientId: number, storageId: number) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'name' | 'quantity' | 'updated' | 'status';

interface SortRule {
  field: SortField;
  direction: SortDirection;
}

// Mockup UI of what list of ingredients table could look like
const IngredientTable: React.FC<Props> = ({ items, onDelete, onEdit }) => {
  const [sortRules, setSortRules] = useState<SortRule[]>([]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortRules((prev) => {
      // Remove previous sort rule for this field
      const filtered = prev.filter((rule) => rule.field !== field);
      // Add it to the end (most recent sort has highest priority)
      return [...filtered, { field, direction }];
    });
  };

  // Apply sorting
  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    for (let i = sortRules.length - 1; i >= 0; i--) {
      const { field, direction } = sortRules[i];
      let valA: any = a[field];
      let valB: any = b[field];

      // Handle data types
      if (field === 'quantity') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (field === 'updated') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      let multiplier = direction === 'asc' ? 1 : -1;

      // Adjust for specific fields where order is reversed
      if (field === 'name' || field === 'status') {
        multiplier *= -1;
      }

      if (valA < valB) return -1 * multiplier;
      if (valA > valB) return 1 * multiplier;
    }
    return 0;
  }), [items, sortRules]);

  const getSortDirection = (field: SortField): SortDirection => {
    const rule = sortRules.find(r => r.field === field);
    return rule ? rule.direction : null;
  };

  return (
    <table className="w-full h-full border-collapse bg-white shadow-md rounded">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">
            <input type="checkbox" />
          </th>
          <th className="p-3 text-left">
            <div className="d-flex align-items-center">
              Items
              <KitchenSortButton label="" onSort={(dir) => handleSort('name', dir)} />
              <div className="ms-3">
                {getSortDirection('name') === 'asc' && <MoveUp size={18} />}
                {getSortDirection('name') === 'desc' && <MoveDown size={18} />}
              </div>
            </div>
          </th>
          {/* <th className="p-3 text-left">Image</th> */}
          <th className="p-3 text-left">
            <div className="d-flex align-items-center">
              Quantity
              <KitchenSortButton label="" onSort={(dir) => handleSort('quantity', dir)} />
              <div className="ms-3">
                {getSortDirection('quantity') === 'asc' && <MoveUp size={18} />}
                {getSortDirection('quantity') === 'desc' && <MoveDown size={18} />}
              </div>
            </div>
          </th>
          <th className="p-3 text-left">
            <div className="align-items-center d-flex">
              Last Updated
              <KitchenSortButton label="" onSort={(dir) => handleSort('updated', dir)} />
              <div className="ms-3">
                {getSortDirection('updated') === 'asc' && <MoveUp size={18} />}
                {getSortDirection('updated') === 'desc' && <MoveDown size={18} />}
              </div>
            </div>
          </th>
          <th className="p-3 text-left">
            <div className="align-items-center d-flex">
              Status
              <KitchenSortButton label="" onSort={(dir) => handleSort('status', dir)} />
              <div className="ms-3">
                {getSortDirection('status') === 'asc' && <MoveUp size={18} />}
                {getSortDirection('status') === 'desc' && <MoveDown size={18} />}
              </div>
              {/* {dir === 'asc' ? (
              <MoveUp size={18} />
              ) : (
              <MoveDown size={18} />
              )} */}
            </div>
          </th>
          <th className="p-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-6 text-center">
              No items found.
            </td>
          </tr>
        ) : (
          sortedItems.map((item, idx) => (
            <IngredientRow key={`${item.id}-${idx}`} {...item} onDelete={onDelete} onEdit={onEdit} />
          ))
        )}
      </tbody>
    </table>
  );
};

export default IngredientTable;
