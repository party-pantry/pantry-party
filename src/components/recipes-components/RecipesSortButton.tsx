import { DropdownButton, Dropdown } from 'react-bootstrap';
import { ArrowUpDown } from 'lucide-react';

const RecipesSortButton: React.FC = () => {
    return (
        <DropdownButton id="recipes-sort-dropdown"
            title= {
                <div className="d-flex align-items-center gap-1">
                    <ArrowUpDown size={20} />
                    <span>Sort</span>
                </div>
            }
            variant="outline-dark"
            align="end"
            drop="down"
        >
            <Dropdown.Item eventKey="name">Name</Dropdown.Item>
            <Dropdown.Item eventKey="difficulty">Difficulty</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="time">Total Time</Dropdown.Item>
            <Dropdown.Item eventKey="servings">Servings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="rating">Rating</Dropdown.Item>
            <Dropdown.Item eventKey="postdate">Post Date</Dropdown.Item>
        </DropdownButton>
    )
}

export default RecipesSortButton;