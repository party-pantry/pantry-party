import React from "react";
import { Modal, Button, Badge, Row, Col, Card, ListGroup } from "react-bootstrap";
import { Recipe, getDifficultyVariant, getMatchPercentage } from "../utils/recipeUtils";

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
    prepTime: "10 min",
    ingredients: [
      { name: "Large Eggs", amount: "4", unit: "pieces", available: true },
      { name: "Fresh Tomatoes", amount: "2", unit: "medium", available: true },
      { name: "Salt", amount: "1", unit: "tsp", available: false },
      { name: "Olive Oil", amount: "2", unit: "tbsp", available: false },
      { name: "Black Pepper", amount: "1/4", unit: "tsp", available: false },
    ],
    instructions: [
      "Heat olive oil in a non-stick pan over medium heat.",
      "Dice the tomatoes into small pieces and add to the pan.",
      "Cook tomatoes for 2-3 minutes until they start to soften.",
      "Beat the eggs in a bowl and season with salt and pepper.",
      "Pour the beaten eggs into the pan with tomatoes.",
      "Gently scramble the eggs, stirring frequently until cooked through.",
      "Remove from heat and serve immediately while hot.",
    ],
    nutritionInfo: {
      calories: 285,
      protein: "18g",
      carbs: "8g",
      fat: "20g",
    },
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-3">
          <span style={{ fontSize: "2rem" }}>{recipe.image}</span>
          <div>
            <h4 className="mb-1">{recipe.name}</h4>
            <div className="d-flex gap-2 align-items-center">
              <Badge bg={getDifficultyVariant(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
              <small className="text-muted">
                {getMatchPercentage(recipe)}% match
              </small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Recipe Overview */}
        <Row className="mb-4">
          <Col md={8}>
            <p className="text-dark">{recipe.description}</p>
          </Col>
          <Col md={4}>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">Prep Time:</small>
                  <strong>{mockDetailedRecipe.prepTime}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">Cook Time:</small>
                  <strong>{recipe.cookTime}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Servings:</small>
                  <strong>{mockDetailedRecipe.servings}</strong>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Ingredients Section */}
        <Row className="mb-4">
          <Col md={6}>
            <h5 className="mb-3">Ingredients</h5>
            <ListGroup variant="flush">
              {mockDetailedRecipe.ingredients.map((ingredient, index) => (
                <ListGroup.Item
                  key={index}
                  className={`d-flex justify-content-between align-items-center border-0 px-0 ${
                    !ingredient.available ? "text-muted" : ""
                  }`}
                >
                  <div>
                    <span className={!ingredient.available ? "text-decoration-line-through" : ""}>
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                    {!ingredient.available && (
                      <Badge bg="outline-danger" text="danger" className="ms-2" style={{ fontSize: "0.7rem" }}>
                        Need to buy
                      </Badge>
                    )}
                  </div>
                  {ingredient.available && (
                    <Badge bg="success" style={{ fontSize: "0.7rem" }}>
                      ✓
                    </Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* Nutrition Info */}
          <Col md={6}>
            <h5 className="mb-3">Nutrition Info</h5>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <div className="text-center mb-3">
                  <h3 className="text-primary mb-1">{mockDetailedRecipe.nutritionInfo.calories}</h3>
                  <small className="text-muted">Calories per serving</small>
                </div>
                <Row className="text-center">
                  <Col>
                    <div className="fw-bold text-dark">{mockDetailedRecipe.nutritionInfo.protein}</div>
                    <small className="text-muted">Protein</small>
                  </Col>
                  <Col>
                    <div className="fw-bold text-dark">{mockDetailedRecipe.nutritionInfo.carbs}</div>
                    <small className="text-muted">Carbs</small>
                  </Col>
                  <Col>
                    <div className="fw-bold text-dark">{mockDetailedRecipe.nutritionInfo.fat}</div>
                    <small className="text-muted">Fat</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Instructions Section */}
        <div>
          <h5 className="mb-3">Instructions</h5>
          <div className="d-grid gap-3">
            {mockDetailedRecipe.instructions.map((instruction, index) => (
              <Card key={index} className="border">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-start">
                    <Badge
                      bg="primary"
                      className="me-3 mt-1"
                      style={{ minWidth: "30px", height: "30px", fontSize: "0.9rem" }}
                    >
                      {index + 1}
                    </Badge>
                    <p className="mb-0 text-dark">{instruction}</p>
                  </div>
                </Card.Body>
              </Card>
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