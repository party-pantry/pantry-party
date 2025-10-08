'use client';

import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

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
  const [formData, setFormData] = useState({
    userId: '', // User ID
    name: '',
    description: '',
    difficulty: '',
    prepTime: '',
    cookTime: '',
    downTime: '',
    servings: '',
    rating: '',
    ingredients: [] as Ingredient[], // Ingredients array
    instructions: '', // Instructions
    nutrition: '', // Nutrition
  });

  const [error, setError] = useState<string | null>(null);

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }],
    });
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.userId
      || !formData.name
      || !formData.difficulty
      || !formData.prepTime
      || !formData.cookTime
      || !formData.servings
      || !formData.rating
      || formData.ingredients.length === 0
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    onSubmit(formData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Recipe Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter recipe name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Enter recipe description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="difficulty" className="mb-3">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="prepTime" className="mb-3">
            <Form.Label>Prep Time (minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter prep time"
              value={formData.prepTime}
              onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="cookTime" className="mb-3">
            <Form.Label>Cook Time (minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter cook time"
              value={formData.cookTime}
              onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="downTime" className="mb-3">
            <Form.Label>Down Time (minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter down time"
              value={formData.downTime}
              onChange={(e) => setFormData({ ...formData, downTime: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="servings" className="mb-3">
            <Form.Label>Servings</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of servings"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="rating" className="mb-3">
            <Form.Label>Rating</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter rating (1-5)"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group controlId="ingredients" className="mb-3">
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
                  type="number"
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
            <Button
            className="btn btn-success"
            type="submit"
            onClick={handleAddIngredient}>
              Add Ingredient
            </Button>
          </Form.Group>
          <Button
            className="btn btn-success"
            type="submit">
            Add Recipe
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddRecipeModal;
