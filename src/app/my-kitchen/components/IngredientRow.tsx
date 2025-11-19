// /* eslint-disable react/button-has-type */
// /* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

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
  headerSelected?: boolean;
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
  headerSelected,
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({ id });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };

  // State for checkbox
  const [selected, setSelected] = useState(false);
  const isSelected = selected || headerSelected;

  return (
    <tr key={id} ref={setNodeRef}
      style={{
        padding: isSelected ? '0.25rem 0.5rem' : '0.5rem', // shrink vertically when selected
        paddingLeft: isSelected ? '20px' : '0px',
        height: isSelected ? '30px' : '60px', // optional, controls row shrink
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: selected ? '0.25rem 0.5rem' : '0.5rem', // shrink vertically when selected
          height: selected ? '30px' : '60px', // optional, controls row shrink
          overflow: 'hidden',
          transition: 'all 0.3s ease' }}
      > */}
        <td className="align-middle">
          {/* Drag handle */}
          <div
            style={{
              paddingLeft: selected ? '20px' : '0px',
              transition: 'padding-left 0.3s ease',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab' }}
            >
              <GripVertical size={18} />
            </span>
          </div>
        </td>
        <td className="align-middle">
          <div className="custom-checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => setSelected(!selected)} />
          </div>
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
      {/* </div> */}
    </tr>
  );
};

export default IngredientRow;

// import React, { useState } from 'react';
// import { Badge, Button } from 'react-bootstrap';
// import { Pencil, Trash2, GripVertical } from 'lucide-react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

// interface Props {
//   id: number;
//   ingredientId: number;
//   storageId: number;
//   name: string;
//   quantity: string;
//   updated: string;
//   status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
//   onDelete: (ingredientId: number, storageId: number) => void;
//   onEdit: (ingredientId: number, storageId: number) => void;
// }

// const getStatusVariant = (itemStatus: string) => {
//   switch (itemStatus) {
//     case 'Good': return 'success';
//     case 'Low Stock': return 'warning';
//     case 'Out of Stock': return 'danger';
//     case 'Expired': return 'secondary';
//     default: return 'secondary';
//   }
// };

// const IngredientRow: React.FC<Props> = ({
//   id,
//   name,
//   ingredientId,
//   storageId,
//   quantity,
//   updated,
//   status,
//   onDelete,
//   onEdit,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

//   // State for checkbox selection
//   const [selected, setSelected] = useState(false);

//   const rowStyle = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     // If selected, shrink/indent the row
//     paddingLeft: selected ? '20px' : '0px',
//     transitionProperty: 'transform, padding-left', // animate both drag & selection
//     transitionDuration: '0.3s',
//     transitionTimingFunction: 'ease',
//   };

//   // Apply drag transform
//   // const dragStyle = {
//   //   transform: CSS.Transform.toString(transform),
//   //   transition,
//   // };

//   return (
//     <tr
//       key={id}
//       ref={setNodeRef}
//       style={rowStyle}
//     >
//       <td colSpan={7} style={{ padding: 0 }}>
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '1rem',
//             padding: '0.5rem',
//             transform: selected ? 'translateX(20px)' : 'translateX(0)',
//             transition: 'transform 0.3s ease',
//           }}
//         >
//           {/* Drag handle */}
//           <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
//             <GripVertical size={18} />
//           </span>

//           {/* Checkbox */}
//           <input
//             type="checkbox"
//             checked={selected}
//             onChange={() => setSelected(!selected)}
//           />

//           {/* Name */}
//           <div className="fw-semibold" title={name} style={{ flex: 2 }}>
//             {name}
//           </div>

//           {/* Quantity */}
//           <div style={{ flex: 1 }}>{quantity}</div>

//           {/* Updated */}
//           <div style={{ flex: 1 }} className="text-muted">
//             {updated}
//           </div>

//           {/* Status */}
//           <Badge
//             bg={getStatusVariant(status)}
//             className="px-2 py-1"
//             style={{ borderRadius: '0.5rem', fontSize: '0.75rem' }}
//           >
//             {status}
//           </Badge>

//           {/* Actions */}
//           <div className="d-flex gap-2">
//             <Button
//               variant="link"
//               size="sm"
//               className="p-0 text-secondary"
//               onClick={() => onEdit(ingredientId, storageId)}
//               title="Edit"
//             >
//               <Pencil size={16} />
//             </Button>
//             <Button
//               variant="link"
//               size="sm"
//               className="p-0 text-danger"
//               onClick={() => onDelete(ingredientId, storageId)}
//               title="Delete"
//             >
//               <Trash2 size={16} />
//             </Button>
//           </div>
//         </div>
//       </td>
//     </tr>
//   );
// };

// export default IngredientRow;
