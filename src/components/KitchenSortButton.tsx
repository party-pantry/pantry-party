import { useState } from 'react';
import { ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { Button } from 'react-bootstrap';

type SortDirection = 'asc' | 'desc';

interface KitchenSortButtonProps {
  onSort: (direction: SortDirection) => void;
  label?: string; // optional label, e.g. "Sort by Name"
}

// eslint-disable-next-line react/prop-types
const KitchenSortButton: React.FC<KitchenSortButtonProps> = ({ onSort, label }) => {
  const [direction, setDirection] = useState<SortDirection>('asc');

  const toggleSort = () => {
    const newDirection = direction === 'asc' ? 'desc' : 'asc';
    setDirection(newDirection);
    onSort(newDirection);
  };

  return (
    // eslint-disable-next-line react/button-has-type
    <Button
      onClick={toggleSort}
      className="d-flex align-items-center justify-content-center w-auto"
    >
      {label && <span className="me-2">{label}</span>}
      {direction === 'asc' ? (
        <ArrowUpAZ size={28} />
      ) : (
        <ArrowDownAZ size={28} />
      )}

    </Button>
  );
};

export default KitchenSortButton;
