/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  id: number;
  ingredientId: number;
  storageId: number;
  name: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
  onDelete: (ingredientId: number, storageId: number) => void;
  onEdit: (ingredientId: number, storageId: number) => void;
}

const getStatusVariant = (itemStatus: string) => {
  switch (itemStatus) {
    case 'Good':
      return 'success';
    case 'Low Stock':
      return 'warning';
    case 'Out of Stock':
      return 'danger';
    case 'Expired':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const IngredientRow: React.FC<Props> = ({
  id,
  name,
  ingredientId,
  storageId,
  quantity,
  updated,
  status,
  onDelete,
  onEdit,
}) => (
  <tr key={id}>
    <td className="align-middle">
      <input type="checkbox" />
    </td>
    <td className="align-middle">
      <div className="fw-semibold" title={name}>
        {name}
      </div>
    </td>
    <td className="align-middle">{quantity}</td>
    <td className="align-middle text-muted">{updated}</td>
    <td className="align-middle">
      <Badge
        bg={getStatusVariant(status)}
        className="px-2 py-1"
        style={{ borderRadius: '0.5rem', fontSize: '0.75rem' }}
      >
        {status}
      </Badge>
    </td>
    <td className="align-middle">
      <div className="d-flex gap-2">
        <Button
          variant="link"
          size="sm"
          className="p-0 text-secondary"
          onClick={() => onEdit(ingredientId, storageId)}
          title="Edit"
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-danger"
          onClick={() => onDelete(ingredientId, storageId)}
          title="Delete"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </td>
  </tr>
);

export default IngredientRow;
