'use client';

import React, { useEffect, useState } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import Loading from '../../components/home-components/Loading';
import RecipeCard from '../../components/recipes-components/RecipeCard';
import RecipesSearch from '../../components/recipes-components/RecipesSearch';
import RecipesFilterButton from '../../components/recipes-components/RecipesFilterButton';
import AddRecipesModal from '../../components/recipes-components/AddRecipesModal';

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    ingredient: { id: number, name: string };
  }[];
}

const Recipes: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [userIngredients, setUserIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes');
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.recipes || data.recipes.length === 0) {
          setNotFound(true);
        } else {
          setRecipes(data.recipes);
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserIngredients = async () => {
      const res = await fetch('/api/user-ingredients');
      const data = await res.json();
      setUserIngredients(new Set(data.ingredientIds));
    };

    fetchRecipes();
    fetchUserIngredients();
  }, []);

  if (loading) {
    return <div className="min-h-screen d-flex justify-content-center align-items-center"><Loading /></div>;
  }

  if (notFound) {
    return <div className="min-h-screen d-flex justify-content-center align-items-center"><p>Recipe not found.</p></div>;
  }

  return (
    <Container className="mb-12 min-h-screen mt-5">
      <div className="flex flex-col justify-center h-[30vh] mb-5">
        <h1 className="text-4xl font-bold">Recipe Suggestions</h1>
        <h6 className="text-gray-600 mt-2">Find recipes based on ingredients you already have!</h6>
        <div className="flex justify-end mt-2">
        </div>
        <hr className="mt-4 border-gray-300"/>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <RecipesSearch />
        <div className="d-flex gap-2">
          <RecipesFilterButton />
          <AddRecipesModal />
        </div>
      </div>

      <Row className="g-4 justify-content-center">
        {recipes.map(recipe => (
          <Col key={recipe.id} md={4} sm={6} xs={12} className="d-flex justify-content-center">
            <RecipeCard recipe={recipe} userIngredientsId={userIngredients} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Recipes;
