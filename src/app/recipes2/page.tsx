import { prisma } from '@/lib/prisma';
import { Recipe } from '@prisma/client';
import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import RecipeCard from '../../components/recipes-components/RecipeCard';


const Recipes: React.FC = async () => {
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                },
            },
        },
    });

    return (
        <Container style={{ marginBottom: 50, minHeight: '100vh'}}>
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

        {recipes.length === 0 ? (
            <p>No recipes found. Please add some recipes.</p>
        ) : (
            <Row className="g-4 justify-content-center">
                {recipes.map(recipe => (
                    <Col key={recipe.id} md={4} sm={6} xs={12} className="d-flex justify-content-center">
                        <RecipeCard recipe={recipe} />
                </Col>
                ))}
            </Row>
        )}
        </Container>
    );
};

export default Recipes;
