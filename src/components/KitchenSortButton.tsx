import { useState } from 'react';
import { ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { Button, Col, Row } from 'react-bootstrap';

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
      className=""
    >
      {/* <Row>
        {label && <span>{label}</span>}
        {direction === 'asc' ? (
          <ArrowUpAZ className="w-4 h-10" />
        ) : (
          <ArrowDownAZ className="w-4 h-10" />
        )}
      </Row> */}
      <Row className="align-items-center">
        {label && <Col xs="2">{label}</Col>}
        <Col xs="auto">
          {direction === 'asc' ? (
            <ArrowUpAZ className="w-4 h-4" />
          ) : (
            <ArrowDownAZ className="w-4 h-4" />
          )}
        </Col>
      </Row>
    </Button>
  );
};

export default KitchenSortButton;
