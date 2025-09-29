import { Form } from 'react-bootstrap';
import { Search } from 'lucide-react';

const RecipesSearch: React.FC = () => (
         <div className="position-relative" style={{ maxWidth: '250px' }}>
            <Search size={18} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <Form.Control
                    placeholder="Search..."
                    style={{ paddingLeft: '2rem' }}
                />
        </div>
);

export default RecipesSearch;
