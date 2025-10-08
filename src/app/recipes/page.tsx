/* eslint-disable max-len */

'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import { useDebounce } from 'use-debounce';
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

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

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

  let filteredRecipes = recipes;

  // Improve search to be more strict (ex. match whole words)?
  filteredRecipes = filteredRecipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const ingredientMatch = recipe.ingredients.some(ing =>
      ing.ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return nameMatch || ingredientMatch;
  });

  // Chain other filters (difficulty, time, serving, ratings, etc) later

  return (
    <Container className="mb-12 min-h-screen mt-5">
      <div className="flex flex-col justify-center h-[30vh]">
        <h1 className="text-4xl font-bold">Recipe Suggestions</h1>
        <h6 className="text-gray-600 mt-2">Find recipes based on ingredients you already have!</h6>
        <div className="flex justify-end mt-2">
        </div>
        <hr className="mt-4 border-gray-300"/>
      </div>

      <div className="d-flex justify-content-end flex-wrap gap-2 mb-2">
        <AddRecipesModal />
      </div>
      <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
        <RecipesSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <RecipesFilterButton />
        <RecipesSortButton />
      </div>
      {filteredRecipes.length === 0 ? (
        <div className="min-h-[50vh] d-flex flex-column justify-content-center align-items-center">
          <p>No recipes match your search. Try adjusting your filters!</p>
        </div>
      ) : (
        <Row className="g-4 justify-content-center">
          {filteredRecipes.map(recipe => (
            <Col key={recipe.id} xl={4} lg={4} md={6} sm={12} className="d-flex">
              <RecipeCard recipe={recipe} userIngredientsId={userIngredients} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Recipes;
