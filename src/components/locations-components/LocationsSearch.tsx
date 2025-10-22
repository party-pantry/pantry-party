import { Form, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';

interface LocationsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const LocationsSearch: React.FC<LocationsSearchProps> = ({ searchTerm, setSearchTerm }) => (
        <div className="flex flex-row gap-2">
            <div className="position-relative" style={{ maxWidth: '250px' }}>
                <Search size={18} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <Form.Control
                    placeholder="Address or name..."
                    style={{ paddingLeft: '2rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Search
            </Button>
        </div>
);

export default LocationsSearch;
