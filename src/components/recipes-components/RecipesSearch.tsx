import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Search } from 'lucide-react';

interface RecipesSearchProps {
  onApply?: (search: string) => void;
}

const RecipesSearch: React.FC<RecipesSearchProps> = ({ onApply }) => {
  const [search, setSearch] = useState('');

  //   const handleReset = () => {
  //     setSearch('');
  //     if (onApply) onApply( {search: ''} );
  //   };

  const handleApply = () => {
    if (onApply) onApply(search);
  };

  return (
        <div className="position-relative" style={{ maxWidth: '250px' }}>
            <Search size={18} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <Form.Control
                    placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply();
              }
            }}
            style={{ paddingLeft: '2rem' }}
                />
        </div>
  );
};

export default RecipesSearch;
