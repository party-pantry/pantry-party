/* eslint-disable max-len */

'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import Loading from '../../components/home-components/Loading';
import RecipeCard from '../../components/recipes-components/RecipeCard';
import RecipesSearch from '../../components/recipes-components/RecipesSearch';
import RecipesFilterButton from '../../components/recipes-components/RecipesFilterButton';
import RecipesSortButton from '../../components/recipes-components/RecipesSortButton';
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
      <div className="d-flex justify-content-end flex-wrap gap-2 mb-2">
        <AddRecipesModal />
      </div>
      <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
        <RecipesSearch />
        <RecipesFilterButton />
        <RecipesSortButton />
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
