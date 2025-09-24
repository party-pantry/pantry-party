import { useState } from 'react';
import { ArrowUpAZ, ArrowDownAZ, ChartColumnIncreasing, ChartColumnDecreasing } from 'lucide-react';
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
      style={{ width: '125px', backgroundColor: '#3A5B4F', borderColor: '#3A5B4F', color: 'white' }}
      onClick={toggleSort}
      className="d-flex align-items-center justify-content-center w-auto"
    >
      {direction === 'asc' ? (
        <ChartColumnIncreasing size={15} />
      ) : (
        <ChartColumnDecreasing size={15} />
      )}
      {label && <span className="ml-1 me-2">{label}</span>}
      {direction === 'asc' ? (
        <ArrowUpAZ size={28} />
      ) : (
        <ArrowDownAZ size={28} />
      )}

    </Button>
  );
};

export default KitchenSortButton;
