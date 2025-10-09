import { useState } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { ArrowUpDown } from 'lucide-react';

interface RecipesSortButtonProps {
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const RecipesSortButton: React.FC<RecipesSortButtonProps> = ({ onSort }) => {
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (sortBy: string) => {
    // If clicking the same sort option, toggle the order
    if (selectedSort === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      if (onSort) {
        onSort(sortBy, newOrder);
      }
    } else {
      // New sort option selected, default to ascending
      setSelectedSort(sortBy);
      setSortOrder('asc');
      if (onSort) {
        onSort(sortBy, 'asc');
      }
    }
  };

  const getSortLabel = (sortBy: string) => {
    if (selectedSort !== sortBy) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <DropdownButton
      id="recipes-sort-dropdown"
      title={
        <div className="d-flex align-items-center gap-1">
          <ArrowUpDown size={20} />
          <span>Sort</span>
        </div>
      }
      variant="outline-dark"
      align="end"
      drop="down"
    >
      <Dropdown.Item 
        eventKey="name" 
        onClick={() => handleSort('name')}
        active={selectedSort === 'name'}
      >
        Name (A-Z){getSortLabel('name')}
      </Dropdown.Item>
      <Dropdown.Item 
        eventKey="difficulty" 
        onClick={() => handleSort('difficulty')}
        active={selectedSort === 'difficulty'}
      >
        Difficulty (Easy-Hard){getSortLabel('difficulty')}
      </Dropdown.Item>
      <Dropdown.Item 
        eventKey="time" 
        onClick={() => handleSort('time')}
        active={selectedSort === 'time'}
      >
        Total Time{getSortLabel('time')}
      </Dropdown.Item>
      <Dropdown.Item 
        eventKey="match-percent" 
        onClick={() => handleSort('match-percent')}
        active={selectedSort === 'match-percent'}
      >
        Match % (High-Low){getSortLabel('match-percent')}
      </Dropdown.Item>
      <Dropdown.Item 
        eventKey="rating" 
        onClick={() => handleSort('rating')}
        active={selectedSort === 'rating'}
      >
        Rating (High-Low){getSortLabel('rating')}
      </Dropdown.Item>
      <Dropdown.Item 
        eventKey="postdate" 
        onClick={() => handleSort('postdate')}
        active={selectedSort === 'postdate'}
      >
        Post Date (Recent){getSortLabel('postdate')}
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default RecipesSortButton;