'use client';

import slugify from 'slugify';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Col, Row } from 'react-bootstrap';
import Loading from '@/components/home-components/Loading';
import CookingTimer from '@/components/cooking-components/CookingTimer';
import CookingGuide from '@/components/cooking-components/CookingGuide';
import CookingProgressBar from '@/components/cooking-components/CookingProgressBar';
import CustomAlert from '@/components/CustomAlert';

const CookingPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleTimerFinish = useCallback(() => {
    setShowAlert(true);
  }, []);

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
    <>
    <Container className='min-h-screen py-5'>
        <div className='mb-4 text-center'>
          <h1 className='display-5'>{recipe.name}</h1>
        </div>

        <Row className="gap-4 mt-5">
          <Col md={4} lg={3}>
            <div className="sticky-top top-5" style={{ zIndex: '1'}}>
              <div className="text-center mb-3">
                <CookingTimer
                  cookTime={recipe.cookTime}
                  prepTime={recipe.prepTime}
                  downTime={recipe.downTime}
                  onTimerFinish={handleTimerFinish}
                />
              </div>
            </div>
          </Col>

          <Col>
            <div className="top-5">
              <CookingGuide
                recipe={recipe}
                currentStep={currentStep}
                onStepChange={handleStepChange}
              />
            </div>
          </Col>
        </Row>

        <div className="mt-auto">
          <CookingProgressBar currentStep={currentStep} totalInstructions={recipe.instructions.length} />
        </div>
    </Container>

    <CustomAlert
      show={showAlert}
      title="Success"
      message="Time's up! Your dish should be ready :)"
      position="bottom-end"
      onClose={() => setShowAlert(false)}
    />
    </>
  );
};

export default CookingPage;
