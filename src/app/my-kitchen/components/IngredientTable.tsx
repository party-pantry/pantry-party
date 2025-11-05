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
    <div className="table-responsive">
      <table className="table table-hover mb-0 table-striped">
        <thead className="table-success">
          <tr>
            <th style={{ width: '5%' }}>
              <input type="checkbox" />
            </th>
            <th style={{ width: '35%' }}>
            <div className="d-flex align-items-center">
              Items
              <KitchenSortButton label="" onSort={(dir) => handleSort('name', dir)} />
              <div className="ms-3">
                {getSortDirection('name') === 'asc' && <MoveUp size={18} />}
                {getSortDirection('name') === 'desc' && <MoveDown size={18} />}
              </div>
            </div>
          </th>
          <th style={{ width: '15%' }}>
            <div className="d-flex align-items-center">
              Quantity
              <KitchenSortButton label="" onSort={(dir) => handleSort('quantity', dir)} />
              <div className="ms-2">
                {getSortDirection('quantity') === 'asc' && <MoveUp size={16} />}
                {getSortDirection('quantity') === 'desc' && <MoveDown size={16} />}
              </div>
            </div>
          </th>
          <th style={{ width: '20%' }}>
            <div className="d-flex align-items-center">
              Last Updated
              <KitchenSortButton label="" onSort={(dir) => handleSort('updated', dir)} />
              <div className="ms-2">
                {getSortDirection('updated') === 'asc' && <MoveUp size={16} />}
                {getSortDirection('updated') === 'desc' && <MoveDown size={16} />}
              </div>
            </div>
          </th>
          <th style={{ width: '15%' }}>
            <div className="d-flex align-items-center">
              Status
              <KitchenSortButton label="" onSort={(dir) => handleSort('status', dir)} />
              <div className="ms-2">
                {getSortDirection('status') === 'asc' && <MoveUp size={16} />}
                {getSortDirection('status') === 'desc' && <MoveDown size={16} />}
              </div>
            </div>
          </th>
            <th style={{ width: '10%' }} className="text-center align-middle">
              <div className="d-flex align-items-center">Action</div>
            </th>
        </tr>
      </thead>
        <tbody>
          {sortedItems.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-5 text-muted">
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
    </div>
  );
};

export default IngredientTable;
