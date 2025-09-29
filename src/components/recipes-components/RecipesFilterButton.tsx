import { DropdownButton, Dropdown, Form, Button } from 'react-bootstrap';
import { Filter } from 'lucide-react';

const RecipesFilterButton: React.FC = () => {
    return (
        <DropdownButton id="recipes-filter-dropdown"
            title= {
                <div className="d-flex align-items-center gap-1">
                    <Filter size={20} />
                    <span>Filter</span>
                </div>
            }
            variant="outline-dark"
            align="end"
            drop="down"
        >
            <Form className="w-[250px]">
                <Form.Group className="m-3">
                    <Form.Label className="fw-bold fs-6 text-bold">Difficulty</Form.Label>
                    <Form.Check type="checkbox" label="Easy" />
                    <Form.Check type="checkbox" label="Medium" />
                    <Form.Check type="checkbox" label="Hard" />

                    <Dropdown.Divider />

                    <Form.Label className="fw-bold fs-6 text-bold">Total Time</Form.Label>
                    <Form.Check type="checkbox" label="< 30 mins" />
                    <Form.Check type="checkbox" label="30 - 60 mins" />
                    <Form.Check type="checkbox" label="> 60 mins" />

                    <Dropdown.Divider />

                    <Form.Label className="fw-bold fs-6 text-bold">Servings</Form.Label>
                    <Form.Check type="checkbox" label="1-2" />
                    <Form.Check type="checkbox" label="3-4" />
                    <Form.Check type="checkbox" label="5+" />

                    <Dropdown.Divider />


                    <Form.Label className="fw-bold fs-6 text-bold">Rating</Form.Label>
                    <Form.Check type="checkbox" label="1 Star & Up" />
                    <Form.Check type="checkbox" label="2 Stars & Up" />
                    <Form.Check type="checkbox" label="3 Stars & Up" />
                    <Form.Check type="checkbox" label="4 Stars & Up" />
                    <Form.Check type="checkbox" label="5 Stars" />

                    <Dropdown.Divider />

                    <Form.Check type="switch" label="Recipes I Can Make" className="mt-3" />

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                        <Button
                            variant="danger"
                            style={{ width: '100px' }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            style={{ width: '100px' }}
                        >
                            Apply
                        </Button>
                    </div>

                </Form.Group>
            </Form>
        </DropdownButton>
    )
}

export default RecipesFilterButton;