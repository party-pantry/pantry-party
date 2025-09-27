/* eslint-disable react/no-array-index-key */

'use client';

import React, { useState } from 'react';
import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import {
  Recipe,
  getMatchPercentage,
} from '../../utils/recipeUtils';
import RecipeModal from '../../components/recipes-components/RecipeModal';

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
    <Container style={{ marginBottom: 50, minHeight: '100vh'}}>
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


      
    </Container>
  );
};

export default Recipes;
