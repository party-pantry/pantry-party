/* eslint-disable max-len */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import Loading from './home-components/Loading';
import RecipeCard from './recipes-components/RecipeCard';
import RecipesSearch from './recipes-components/RecipesSearch';
import RecipesFilterButton from './recipes-components/RecipesFilterButton';
import ToggleReceipesCanMake from './recipes-components/ToggleRecepiesCanMake';
import RecipesSortButton from './recipes-components/RecipesSortButton';
import AddRecipesModal from './recipes-components/AddRecipesModal';
import { checkIngredients } from '../utils/recipeUtils';

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    ingredient: { id: number, name: string };
  }[];
}

const Recipes: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [userIngredientsId, setUserIngredientsId] = useState<Set<number>>(new Set());
  const [canMakeOnly, setCanMakeOnly] = useState(false);

  // Filter the recipes by ingredients available
  const filteredRecipes = useMemo(() => {
    // If not filtering by "can make only", return all recipes
    if (!canMakeOnly) return recipes;

    // Only recipes the user can make
    return recipes.filter(recipe => {
      const { missingIngredients } = checkIngredients(recipe.ingredients, userIngredientsId);
      return missingIngredients.length === 0; 
    });
  }, [recipes, userIngredientsId, canMakeOnly]);


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
      setUserIngredientsId(new Set(data.ingredientIds));
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
        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
          
          <RecipesSearch />
          <RecipesFilterButton />
          <RecipesSortButton />
          
        </div>
        <div className="d-flex justify-content-end flex-wrap gap-2 mb-2 align-items-center">
          <ToggleReceipesCanMake onToggleCanMake={setCanMakeOnly} />
          <AddRecipesModal />
        </div>

        <Row className="g-4 justify-content-center">
          {filteredRecipes.map(recipe => (
            <Col key={recipe.id} md={4} sm={6} xs={12} className="d-flex justify-content-center">
              <RecipeCard recipe={recipe} userIngredientsId={userIngredientsId} />
            </Col>
          ))}
        </Row>
      </Container>
  );
};

export default Recipes;
