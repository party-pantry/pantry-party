/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import slugify from 'slugify';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Col, Row } from 'react-bootstrap';
import Loading from '@/components/home-components/Loading';
import CookingTimer from '@/components/cooking-components/CookingTimer';
import CookingGuide from '@/components/cooking-components/CookingGuide';

const CookingPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<any>(null);

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
        <div className='min-h-screen d-flex justify-content-center align-items-center'>
            <Loading />
        </div>
    );
  }

  if (notFound) {
    return (
        <div className='min-h-screen d-flex justify-content-center align-items-center'>
            <p>Recipe not found.</p>
        </div>
    );
  }

  return (
    <Container className='min-h-screen py-10'>
        <div className='mb-4 text-center'>
          <h1 className='display-5'>{recipe.name}</h1>
          <p className='text-muted'>Follow the step-by-step guide below</p>
        </div>

        <Row>
          <Col>
            <div className="sticky-top top-[20px]">
              <div className="text-center mb-4">
                <h3 className="text-center mb-4">Cooking Timer</h3>
                <CookingTimer cookTime={recipe.cookTime} prepTime={recipe.prepTime} downTime={recipe.downTime} />
              </div>
            </div>
          </Col>
          <Col>
            <div className="sticky-top top-[20px]">
              <div className="text-center mb-4">
                <h3 className="text-center mb-4">Cooking Guide</h3>
                <CookingGuide recipe={recipe} />
              </div>
            </div>
          </Col>
        </Row>
    </Container>
  );
};

export default CookingPage;
