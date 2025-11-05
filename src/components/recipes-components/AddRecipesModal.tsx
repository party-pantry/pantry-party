'use client';

import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { addRecipe } from '@/lib/dbFunctions'; // Import the addRecipe function
import { Difficulty } from '@prisma/client'; // Import the Difficulty enum

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface AddRecipeModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (recipeData: any) => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ show, onHide, onSubmit }) => {
  const { data: session } = useSession();
  const userID = Number((session?.user as { id: number | string }).id);
  const [formData, setFormData] = useState({
    userId: userID,
    name: '',
    description: '',
    difficulty: 'EASY',
    prepTime: '',
    cookTime: '',
    downTime: '',
    servings: '',
    rating: '',
    ingredients: [] as Ingredient[], // Ingredients array
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Submitting recipe...');
      const result = await addRecipe({
        ...formData,
        difficulty: formData.difficulty as Difficulty,
        prepTime: parseInt(formData.prepTime, 10) || 0,
        cookTime: parseInt(formData.cookTime, 10) || 0,
        downTime: parseInt(formData.downTime, 10) || 0,
        servings: parseInt(formData.servings, 10) || 0,
        rating: parseInt(formData.rating, 10) || 0,
      });

      console.log(result.id);
      onSubmit(result); // Pass the result to the parent component
      onHide(); // Close the modal
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }],
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Recipe Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter recipe name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Enter recipe description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="difficulty">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select
              value={formData.difficulty}
              onChange={(e) => {
                const value = e.target.value as Difficulty;
                if (value === Difficulty.EASY || value === Difficulty.MEDIUM || value === Difficulty.HARD) {
                  setFormData({ ...formData, difficulty: value });
                }
              }}
            >
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="prepTime">
            <Form.Label>Prep Time</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter preparation time"
              value={formData.prepTime}
              onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="cookTime">
            <Form.Label>Cook Time</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter cooking time"
              value={formData.cookTime}
              onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="downTime">
            <Form.Label>Down Time</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter down time"
              value={formData.downTime}
              onChange={(e) => setFormData({ ...formData, downTime: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="servings">
            <Form.Label>Servings</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of servings"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="rating">
            <Form.Label>Rating</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter rating"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="ingredients">
            <Form.Label>Ingredients</Form.Label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  required
                />
                <Form.Control
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  required
                />
                <Form.Control
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  required
                />
              </div>
            ))}
            <Button className="btn btn-success" type="button" onClick={handleAddIngredient}>
              +
            </Button>
          </Form.Group>
          <Button className="btn btn-success" type="submit">
            Submit Recipe
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddRecipeModal;