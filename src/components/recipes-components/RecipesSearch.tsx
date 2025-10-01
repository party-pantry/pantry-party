import { Form } from 'react-bootstrap';
import { Search } from 'lucide-react';

interface RecipesSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const RecipesSearch: React.FC<RecipesSearchProps> = ({ searchTerm, setSearchTerm }) => (
         <div className="position-relative" style={{ maxWidth: '250px' }}>
            <Search size={18} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <Form.Control
                    placeholder="Search..."
                    style={{ paddingLeft: '2rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
        </div>
);

export default RecipesSearch;
