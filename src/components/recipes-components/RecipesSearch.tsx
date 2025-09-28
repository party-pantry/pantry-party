import { Button, Form } from 'react-bootstrap';

const RecipesSearch: React.FC = () => {
    return (
        <Form className="d-flex" role="search">
            <Form.Control
                type="search"
                placeholder="Search Recipes"
                className="me-2"
                aria-label="Search"
            />
            <Button variant="outline-success">Search</Button>
        </Form>
    )
}

export default RecipesSearch;