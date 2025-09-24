/* eslint-disable react/no-array-index-key */

'use client';

import React, { useState } from 'react';
import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import {
  Recipe,
  getMatchPercentage,
} from '../../utils/recipeUtils';
import RecipeModal from '../../components/RecipeModal';

const Recipes: React.FC = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewRecipe = (recipe: Recipe): void => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setSelectedRecipe(null);
  };
  const mockRecipes: Recipe[] = [
    {
      id: 1,
      name: 'Tomato Scrambled Eggs',
      image: '🍳',
      cookTime: '15 min',
      difficulty: 'Easy',
      availableIngredients: ['Tomatoes', 'Eggs'],
      missingIngredients: ['Salt', 'Oil'],
      description:
        'A classic breakfast dish with fresh tomatoes and fluffy scrambled eggs.',
    },
    {
      id: 2,
      name: 'Chicken Breast Salad',
      image: '🥗',
      cookTime: '20 min',
      difficulty: 'Easy',
      availableIngredients: ['Chicken Breast', 'Tomatoes'],
      missingIngredients: ['Lettuce', 'Dressing'],
      description:
        'Healthy and protein-rich salad with grilled chicken and fresh vegetables.',
    },
    {
      id: 3,
      name: 'Chicken Tomato Pasta',
      image: '🍝',
      cookTime: '30 min',
      difficulty: 'Medium',
      availableIngredients: ['Chicken Breast', 'Tomatoes'],
      missingIngredients: ['Pasta', 'Garlic', 'Onion'],
      description: 'Delicious pasta with tender chicken and rich tomato sauce.',
    },
    {
      id: 4,
      name: 'Mediterranean Bowl',
      image: '🍲',
      cookTime: '25 min',
      difficulty: 'Medium',
      availableIngredients: ['Chicken Breast', 'Tomatoes'],
      missingIngredients: ['Rice', 'Olives', 'Feta Cheese'],
      description:
        'A healthy Mediterranean-inspired bowl with fresh ingredients.',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container style={{ marginBottom: 50 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '30vh',
          marginBottom: '5px',
        }}
      >
        <h1 className="fs-1">Recipe Suggestions</h1>
        <h6>Find recipes based on ingredients you already have!</h6>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button variant="primary">+New Recipe</Button>
        </div>
        <hr />
      </div>

      <Row>
        {mockRecipes.map((recipe) => (
          <Col md={6} lg={4} key={recipe.id} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="mb-0">
                    <span style={{ fontSize: '2rem', marginRight: '10px' }}>
                      {recipe.image}
                    </span>
                    {recipe.name}
                  </Card.Title>
                  <Badge bg={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                </div>

                <Card.Text className="text-muted mb-3">
                  {recipe.description}
                </Card.Text>

                <div className="mb-3">
                  <small className="text-muted">
                    ⏱️
                    {recipe.cookTime}
                  </small>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-bold">
                      Match:
                      {' '}
                      {getMatchPercentage(recipe)}
                      %
                    </small>
                  </div>

                  <div className="mb-2">
                    <small className="text-success fw-bold">You have:</small>
                    <div>
                      {recipe.availableIngredients.map((ingredient, index) => (
                        <Badge key={index} bg="success" className="me-1 mb-1">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <small className="text-danger fw-bold">You need:</small>
                    <div>
                      {recipe.missingIngredients.map((ingredient, index) => (
                        <Badge
                          key={index}
                          bg="outline-danger"
                          text="danger"
                          className="me-1 mb-1"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    View Recipe
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    Add Missing to Shopping List
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <RecipeModal
        recipe={selectedRecipe}
        show={showModal}
        onHide={handleCloseModal}
      />
    </Container>
  );
};

export default Recipes;
