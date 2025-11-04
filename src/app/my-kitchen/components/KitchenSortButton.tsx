import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
// import { ChartColumnIncreasing, ChartColumnDecreasing } from 'lucide-react';
import { Button } from 'react-bootstrap';

type SortDirection = 'asc' | 'desc' | null;

interface KitchenSortButtonProps {
  onSort: (direction: SortDirection) => void;
  label?: string; // optional label, e.g. "Sort by Name"
}

// eslint-disable-next-line react/prop-types
const KitchenSortButton: React.FC<KitchenSortButtonProps> = ({ onSort, label }) => {
  const [direction, setDirection] = useState<SortDirection>(null);

  const toggleSort = () => {
    let newDirection: SortDirection;
    if (direction === null) newDirection = 'desc';
    else if (direction === 'desc') newDirection = 'asc';
    else newDirection = null;
    setDirection(newDirection);
    onSort(newDirection);
  };

  const activeColor = '#007bff'; // Bootstrap blue
  const inactiveColor = '#323437ff'; // muted gray

  return (
    // eslint-disable-next-line react/button-has-type
    <Button
      variant="light"
      style={{ boxShadow: 'none', backgroundColor: '#F3F4F6' }}
      onClick={toggleSort}
      className="d-flex align-items-center justify-content-center w-auto p-0 ms-1"
    >
      <div className="d-flex flex-column align-items-center" style={{ lineHeight: '1' }}>
        {/* Up Arrow */}
        <ChevronUp
          size={16}
          stroke={direction === 'asc' ? activeColor : inactiveColor}
          fill={direction === 'asc' ? activeColor : 'none'}
        />
        {/* Down Arrow */}
        <ChevronDown
          size={16}
          stroke={direction === 'desc' ? activeColor : inactiveColor}
          fill={direction === 'desc' ? activeColor : 'none'}
        />
      </div>
      {/* {direction === 'asc' ? (
        <ChartColumnIncreasing size={15} />
      ) : (
        <ChartColumnDecreasing size={15} />
      )} */}
      {label && <span className="ml-1 me-2">{label}</span>}
      {/* {direction === 'asc' ? (
        <MoveUp size={18} />
      ) : (
        <MoveDown size={18} />
      )} */}

    </Button>
  );
};

export default KitchenSortButton;
