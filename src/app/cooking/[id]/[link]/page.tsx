/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import slugify from 'slugify';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from 'react-bootstrap';
import Loading from '@/components/home-components/Loading';
import CookingTimer from '@/components/cooking-components/CookingTimer';
import { calculateTotalTime, checkIngredients } from '@/utils/recipeUtils';

const CookingPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<any>(null);

  // fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipe/${params.id}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data || !data.recipe) {
          setNotFound(true);
        } else {
          setRecipe(data.recipe);
          const expectedLink = slugify(data.recipe.name, { lower: true, strict: true });
          if (params.link !== expectedLink) {
            router.replace(`/cooking/${data.recipe.id}/${expectedLink}`);
          }
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [params.id, params.link, router]);

  if (loading) {
    return (
        <div className="min-h-screen d-flex justify-content-center align-items-center">
            <Loading />
        </div>
    );
  }

  if (notFound) {
    return (
        <div className="min-h-screen d-flex justify-content-center align-items-center">
            <p>Recipe not found.</p>
        </div>
    );
  }

  return (
    <Container className="min-h-screen py-10">
        <div className="d-flex flex-column align-items-center">
            <CookingTimer cookTime={recipe.cookTime} prepTime={recipe.prepTime} downTime={recipe.downTime} />
        </div>
    </Container>
  );
};

export default CookingPage;
