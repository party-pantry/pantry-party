'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Placeholder } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import RecipeCard from './RecipeCard';

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    ingredient: { id: number; name: string };
  }[];
}

const RecommendedRecipesSkeleton: React.FC = () => (
  <Row className="g-4 justify-content-center">
    {[1, 2, 3].map((i) => (
      <Col key={i} md={4} sm={6} xs={12} className="d-flex justify-content-center">
        <Card className="recipe-card h-100" style={{ width: '100%' }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Placeholder as="div" animation="glow">
                <Placeholder xs={4} className="rounded-pill" style={{ height: '24px' }} />
              </Placeholder>
              <Placeholder as="div" animation="glow">
                <Placeholder
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                  }}
                />
              </Placeholder>
            </div>
            <div className="mb-2">
              <Placeholder as="h5" animation="glow">
                <Placeholder xs={9} />
              </Placeholder>
            </div>
            <Placeholder as="p" animation="glow" className="mb-3">
              <Placeholder xs={12} size="sm" />
              <Placeholder xs={10} size="sm" />
            </Placeholder>
            <div className="d-flex flex-wrap justify-content-around text-center py-3 border-top border-bottom mb-3">
              {[1, 2, 3].map((stat) => (
                <div key={stat} className="flex-fill">
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} className="fw-bold fs-5 mb-1" />
                    <Placeholder xs={10} size="sm" />
                  </Placeholder>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-center">
              <Placeholder.Button variant="success" xs={9} style={{ height: '42px' }} />
            </div>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);

const RecommendedRecipes: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [userIngredientsId, setUserIngredientsId] = useState<Set<number>>(new Set());

  const handleToggleFavorite = (recipeId: number, newIsStarredStatus: boolean) => {
    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) => {
        if (recipe.id === recipeId) {
          return { ...recipe, isStarred: newIsStarredStatus };
        }
        return recipe;
      }),
    );
  };

  useEffect(() => {
    const fetchRecommendedRecipes = async () => {
      try {
        const res = await fetch('/api/recipes/recommended');
        if (res.ok) {
          const data = await res.json();
          setRecipes(data.recipes || []);
        }
      } catch (error) {
        console.error('Error fetching recommended recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserIngredients = async () => {
      try {
        const res = await fetch('/api/user-ingredients');
        const data = await res.json();
        setUserIngredientsId(new Set(data.ingredientIds || []));
      } catch (error) {
        console.error('Error fetching user ingredients:', error);
      }
    };

    fetchRecommendedRecipes();
    fetchUserIngredients();
  }, []);

  if (loading) {
    return (
      <Container className="mb-5" style={{ width: '95%' }}>
        <h2 className="mb-4">Recommended Recipes</h2>
        <RecommendedRecipesSkeleton />
      </Container>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <Container className="mb-5" style={{ width: '95%' }}>
      <h2 className="mb-4">Recommended Recipes</h2>
      <p className="text-muted mb-4">
        Top-rated recipes loved by our community
      </p>
      <Row className="g-4 justify-content-center">
        {recipes.map((recipe) => (
          <Col key={recipe.id} md={4} sm={6} xs={12} className="justify-content-center">
            <RecipeCard
              recipe={recipe}
              userIngredientsId={userIngredientsId}
              searchTerm=""
              onToggleFavorite={handleToggleFavorite}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default RecommendedRecipes;
