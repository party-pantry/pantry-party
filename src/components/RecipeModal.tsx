/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Modal, Button, Badge, Row, Col, Card } from 'react-bootstrap';
import { Recipe, getDifficultyVariant, getMatchPercentage } from '../utils/recipeUtils';

interface RecipeModalProps {
  recipe: Recipe | null;
  show: boolean;
  onHide: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, show, onHide }) => {
  if (!recipe) return null;

  // Mock detailed recipe data for design purposes
  const mockDetailedRecipe = {
    ...recipe,
    servings: 4,
    prepTime: '10 min',
    ingredients: [
      { name: 'Large Eggs', amount: '4', unit: 'pieces', available: true },
      { name: 'Fresh Tomatoes', amount: '2', unit: 'medium', available: true },
      { name: 'Salt', amount: '1', unit: 'tsp', available: false },
      { name: 'Olive Oil', amount: '2', unit: 'tbsp', available: false },
      { name: 'Black Pepper', amount: '1/4', unit: 'tsp', available: false },
    ],
    instructions: [
      'Heat olive oil in a non-stick pan over medium heat.',
      'Dice the tomatoes into small pieces and add to the pan.',
      'Cook tomatoes for 2-3 minutes until they start to soften.',
      'Beat the eggs in a bowl and season with salt and pepper.',
      'Pour the beaten eggs into the pan with tomatoes.',
      'Gently scramble the eggs, stirring frequently until cooked through.',
      'Remove from heat and serve immediately while hot.',
    ],
    nutritionInfo: {
      calories: 285,
      protein: '18g',
      carbs: '8g',
      fat: '20g',
    },
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-3">
          <span style={{ fontSize: '2rem' }}>{recipe.image}</span>
          <div>
            <h4 className="mb-1">{recipe.name}</h4>
            <div className="d-flex gap-2 align-items-center">
              <Badge bg={getDifficultyVariant(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
              <small className="text-muted">
                {getMatchPercentage(recipe)}
                % match
              </small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1.5rem' }}>
        {/* Recipe Overview */}
        <div className="mb-4">
          <p className="text-dark fs-6 mb-3">{recipe.description}</p>

          <Card className="border-0 bg-light mb-4">
            <Card.Body className="p-3">
              <Row className="text-center">
                <Col xs={4}>
                  <div className="fw-bold text-dark">{mockDetailedRecipe.prepTime}</div>
                  <small className="text-muted">Prep Time</small>
                </Col>
                <Col xs={4}>
                  <div className="fw-bold text-dark">{recipe.cookTime}</div>
                  <small className="text-muted">Cook Time</small>
                </Col>
                <Col xs={4}>
                  <div className="fw-bold text-dark">{mockDetailedRecipe.servings}</div>
                  <small className="text-muted">Servings</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Ingredients Section */}
        <div className="mb-4">
          <h5 className="mb-3 text-dark">Ingredients</h5>
          <div className="mb-3">
            {mockDetailedRecipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center py-2 border-bottom"
              >
                <div>
                  <span
                    className={`text-dark ${!ingredient.available ? 'text-decoration-line-through text-muted' : ''}`}
                  >
                    {ingredient.amount}
                    {' '}
                    {ingredient.unit}
                    {' '}
                    {ingredient.name}
                  </span>
                  {!ingredient.available && (
                    <Badge bg="outline-danger" text="danger" className="ms-2" style={{ fontSize: '0.65rem' }}>
                      Need to buy
                    </Badge>
                  )}
                </div>
                {ingredient.available && (
                  <Badge bg="success" style={{ fontSize: '0.65rem' }}>
                    ✓
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="mb-4">
          <h5 className="mb-3 text-dark">Nutrition Info</h5>
          <Card className="border-0 bg-light">
            <Card.Body className="p-3">
              <div className="text-center mb-3">
                <h4 className="text-primary mb-1">{mockDetailedRecipe.nutritionInfo.calories}</h4>
                <small className="text-muted">Calories per serving</small>
              </div>
              <Row className="text-center">
                <Col xs={4}>
                  <div className="fw-bold text-dark">{mockDetailedRecipe.nutritionInfo.protein}</div>
                  <small className="text-muted">Protein</small>
                </Col>
                <Col xs={4}>
                  <div className="fw-bold text-dark">{mockDetailedRecipe.nutritionInfo.carbs}</div>
                  <small className="text-muted">Carbs</small>
                </Col>
                <Col xs={4}>
                  <div className="fw-bold text-dark">{mockDetailedRecipe.nutritionInfo.fat}</div>
                  <small className="text-muted">Fat</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Instructions Section */}
        <div>
          <h5 className="mb-3 text-dark">Instructions</h5>
          <div className="d-grid gap-2">
            {mockDetailedRecipe.instructions.map((instruction, index) => (
              <div key={index} className="d-flex align-items-start p-3 border rounded">
                <Badge
                  bg="primary"
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{ minWidth: '28px', height: '28px', fontSize: '0.8rem', borderRadius: '50%' }}
                >
                  {index + 1}
                </Badge>
                <p className="mb-0 text-dark">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="success">
          Add Missing Ingredients to Shopping List
        </Button>
        <Button variant="primary">
          Start Cooking
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecipeModal;
