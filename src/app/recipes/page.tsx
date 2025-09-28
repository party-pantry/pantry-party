'use client';

import React, { useEffect, useState } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import RecipeCard from '../../components/recipes-components/RecipeCard';

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    ingredient: { id: number, name: string };
  }[];
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [userIngredients, setUserIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchRecipes = async () => {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data.recipes);
    };

    const fetchUserIngredients = async () => {
      const res = await fetch('/api/user-ingredients');
      const data = await res.json();;
      setUserIngredients(new Set(data.ingredientIds));
    };

    fetchRecipes();
    fetchUserIngredients();
  }, []);

  return (
    <Container className="mb-12 min-h-screen mt-5">
      <div className="flex flex-col justify-center h-[30vh] mb-5">
        <h1 className="text-4xl font-bold">Recipe Suggestions</h1>
        <h6 className="text-gray-600 mt-2">Find recipes based on ingredients you already have!</h6>
        <div className="flex justify-end mt-2">
        </div>
        <hr className="mt-4 border-gray-300"/>
      </div>

      {recipes.length === 0 ? (
        <p>No recipes found. Please add some recipes.</p>
      ) : (
        <Row className="g-4 justify-content-center">
          {recipes.map(recipe => (
            <Col key={recipe.id} md={4} sm={6} xs={12} className="d-flex justify-content-center">
              <RecipeCard recipe={recipe} userIngredientsId={userIngredients} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Recipes;
