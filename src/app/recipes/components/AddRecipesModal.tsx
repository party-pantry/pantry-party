'use client';

import React from 'react';
import { Modal, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { addRecipe, addInstruction, addRecipeNutrition, findIngredientByName, addRecipeIngredient, addIngredient } from '@/lib/dbFunctions';
import { Difficulty, Unit } from '@prisma/client';

interface Ingredient {
  name: string;
  quantity: string;
  unit: Unit;
}

interface Instruction {
  step: number;
  content: string;
}

interface Nutrition {
  name: string;
  description?: string;
  difficulty: Difficulty;
  prepTime?: number;
  cookTime?: number;
  downTime?: number;
  servings: number;
  rating?: number;
  image?: string | null;
  ingredients: {
    name: string;
    quantity: string;
    unit: Unit;
  }[];
  instructions: {
    content: string;
  }[];
  nutritions?: {
    name: string;
    amount: number;
    unit: string;
  }[];
}

interface AddRecipeModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (recipeData: any) => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Recipe name is mandatory.'),
  description: Yup.string().optional(),
  image: Yup.string().url('Must be a valid URL').optional().nullable(),
  difficulty: Yup.mixed<Difficulty>()
    .oneOf(Object.values(Difficulty), 'Invalid difficulty level')
    .required('Difficulty is required'),
  // not negative checks
  prepTime: Yup.number()
    .typeError('Prep Time must be a number.')
    .min(0, 'Prep Time cannot be negative.'),
  cookTime: Yup.number()
    .typeError('Cook Time must be a number.')
    .min(0, 'Cook Time cannot be negative.'),
  downTime: Yup.number()
    .typeError('Down Time must be a number.')
    .min(0, 'Down Time cannot be negative.')
    .optional(),
  servings: Yup.number()
    .typeError('Servings must be a number.')
    .min(1, 'Servings must be at least 1.')
    .integer('Servings must be a whole number.'),
  rating: Yup.number()
    .typeError('Rating must be a number.')
    .min(0, 'Rating cannot be negative.')
    .max(5, 'Rating cannot exceed 5.')
    .optional(),
  // array validation
  ingredients: Yup.array()
    .min(1, 'At least one ingredient is required.')
    .of(
      Yup.object().shape({
        name: Yup.string().required('Name is required.'),
        quantity: Yup.string().required('Quantity is required.'),
        unit: Yup.mixed<Unit>().oneOf(Object.values(Unit), 'Invalid Unit').required('Unit is required.'),
      }),
    ).required('Ingredients are required.'),
  instructions: Yup.array()
    .min(1, 'At least one instruction is required.')
    .of(
      Yup.object().shape({
        content: Yup.string().required('Instruction step content is required.'),
      }),
    ).required('Instructions are required.'),
  nutritions: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Name is required.'),
        amount: Yup.number()
          .typeError('Amount must be a number.')
          .min(0, 'Amount cannot be negative.')
          .required('Amount is required.'),
        unit: Yup.string().required('Unit is required.'),
      }),
    ).optional(),
});

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ show, onHide, onSubmit }) => {
  const { data: session } = useSession();
  const userID = Number((session?.user as { id: number | string }).id);

  const defaultValues: RecipeFormData = {
    name: '',
    description: '',
    difficulty: Difficulty.EASY,
    prepTime: 0,
    cookTime: 0,
    downTime: 0,
    servings: 0,
    rating: 0,
    image: '',
    ingredients: [
      { name: '', quantity: '', unit: Unit.OUNCE },
    ],
    instructions: [],
    nutritions: [],
  };

  const {
    register,
    handleSubmit,
    control, // For useFieldArray
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<RecipeFormData, any>,
    defaultValues,
    mode: 'onTouched',
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions',
  });
  const { fields: nutritionFields, append: appendNutrition, remove: removeNutrition } = useFieldArray({
    control,
    name: 'nutritions',
  });

  const onSubmitHandler = async (data: RecipeFormData) => {
    try {
      const recipeData = {
        ...data,
        userId: userID,
        prepTime: data.prepTime ? Number(data.prepTime) : 0,
        cookTime: data.cookTime ? Number(data.cookTime) : 0,
        downTime: data.downTime ? Number(data.downTime) : 0,
        servings: data.servings ? Number(data.servings) : 0,
        rating: data.rating ? Number(data.rating) : 0,
      };
      const result = await addRecipe(recipeData);

      await Promise.all(
        data.ingredients.map((ingredient) => addIngredient(
          result.id,
          Number(ingredient.quantity),
          ingredient.unit,
          ingredient.name,
        )),
      );

      await Promise.all(
        data.instructions.map((instruction, index) => addInstruction(result.id, index + 1, instruction.content)),
      );

      await Promise.all(
        (data.nutritions || []).map(nutrition => addRecipeNutrition(
          result.id,
          nutrition.name,
          Number(nutrition.amount),
          nutrition.unit,
        )),
      );
      await Promise.all(
        formData.ingredients.map(async ingredient => {
          let ingredientId = await findIngredientByName(ingredient.name);
          if (!ingredientId) {
            // If ingredient is not found, add it to the database
            ingredientId = await addIngredient({
              name: ingredient.name,
              price: 5, // Default price, adjust as needed
              foodCategory: 'OTHER', // Default category, adjust as needed
            });
            if (!ingredientId) {
              console.error(`Failed to add ingredient: ${ingredient.name}`);
              return;
            }
          }
          await addRecipeIngredient(
            result.id,
            ingredientId,
            parseFloat(ingredient.quantity),
            ingredient.unit,
            ingredient.name,
          );
        }),
      );
      onSubmit(result);
      onHide();
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | Unit) => {
    const updatedIngredients = [...formData.ingredients];
    if (field === 'unit') {
      updatedIngredients[index][field] = value as Unit;
    } else {
      updatedIngredients[index][field] = value;
    }
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: '', quantity: '', unit: Unit.GRAM }, // Default unit set to Unit.GRAM
      ],
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleInstructionChange = (index: number, field: 'step' | 'content', value: string | number) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      [field]: value,
    };
    setFormData({ ...formData, instructions: updatedInstructions });
  };

  const handleAddInstruction = () => {
    const newStep = formData.instructions.length + 1;
    setFormData({
      ...formData,
      instructions: [
        ...formData.instructions,
        { step: newStep, content: '' },
      ],
    });
  };

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: updatedInstructions });
  };
  const handleNutritionChange = (index: number, field: keyof Nutrition, value: string | number) => {
    const updatedNutritions = [...formData.nutritions];
    if (field === 'amount') {
      updatedNutritions[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    } else {
      updatedNutritions[index][field] = typeof value === 'number' ? value.toString() : value;
    }
    setFormData({ ...formData, nutritions: updatedNutritions });
  };

  const handleAddNutrition = () => {
    setFormData({
      ...formData,
      nutritions: [...formData.nutritions, { name: '', amount: 0, unit: '' }],
    });
  };

  const handleRemoveNutrition = (index: number) => {
    const updatedNutritions = formData.nutritions.filter((_, i) => i !== index);
    setFormData({ ...formData, nutritions: updatedNutritions });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered >
      <Modal.Header closeButton>
        <Modal.Title>Add Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
        <Form onSubmit={handleSubmit(onSubmitHandler)} noValidate>
          <Container>
            <Row>
              <Col>
                {/* Recipe Name */}
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Recipe Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter recipe name"
                    isInvalid={!!errors.name}
                    {...register('name')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Description */}
                <Form.Group controlId="description" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Enter recipe description"
                    isInvalid={!!errors.description}
                    {...register('description')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                {/* Image URL */}
                <Form.Group controlId="image" className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Paste image URL"
                    isInvalid={!!errors.image}
                    {...register('image')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.image?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Difficulty */}
                <Form.Group controlId="difficulty" className="mb-3">
                  <Form.Label>Difficulty</Form.Label>
                  <Form.Select
                    isInvalid={!!errors.difficulty}
                    {...register('difficulty')}
                  >
                    <option value={Difficulty.EASY}>Easy</option>
                    <option value={Difficulty.MEDIUM}>Medium</option>
                    <option value={Difficulty.HARD}>Hard</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.difficulty?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                {/* Prep Time */}
                <Form.Group controlId="prepTime" className="mb-3">
                  <Form.Label>Prep Time (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter preparation time"
                    isInvalid={!!errors.prepTime}
                    min="0"
                    {...register('prepTime')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.prepTime?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Servings */}
                <Form.Group controlId="servings" className="mb-3">
                  <Form.Label>Servings <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter number of servings"
                    isInvalid={!!errors.servings}
                    min="1"
                    {...register('servings')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.servings?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col>
                {/* Cook Time */}
                <Form.Group controlId="cookTime" className="mb-3">
                  <Form.Label>Cook Time (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter cooking time"
                    isInvalid={!!errors.cookTime}
                    min="0"
                    {...register('cookTime')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cookTime?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Rating */}
                <Form.Group controlId="rating" className="mb-3">
                  <Form.Label>Rating (0-5)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="Enter rating"
                    isInvalid={!!errors.rating}
                    min="0"
                    max="5"
                    {...register('rating')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.rating?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
          </Row>

          {/* Ingredients */}
          <Form.Group controlId="ingredients" className="mb-3 p-3 border rounded">
            <Form.Label className="fw-bold">Ingredients <span className="text-danger">*</span></Form.Label>
            {errors.ingredients && (
                <Alert variant="danger" className="py-2">
                    {errors.ingredients.message || 'Missing required fields.'}
                </Alert>
            )}
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="d-flex gap-2 mb-2">
                {/* Ingredient name */}
                <Form.Control
                  type="text"
                  placeholder="Name"
                  isInvalid={!!errors.ingredients?.[index]?.name}
                  {...register(`ingredients.${index}.name`)}
                />
                {/* Ingredient quantity */}
                <Form.Control
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  required
                />
                <Form.Select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value as Unit)}
                  required
                >
                  <option value="" disabled>
                    Select Unit
                  </option>
                  {Object.values(Unit).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="danger" className='fw-bold' onClick={() => handleRemoveIngredient(index)}>
                  -
                </Button>
              </div>
            ))}

            <Button className="btn btn-success fw-bold mt-2 d-block" type="button" onClick={() => appendIngredient({ name: '', quantity: '', unit: Unit.OUNCE })}>
              + Add Ingredient
            </Button>
          </Form.Group>
          {/* Instructions */}
          <Form.Group controlId="instructions" className="mb-3 p-3 border rounded">
            <Form.Label className="fw-bold">Instructions <span className="text-danger">*</span></Form.Label>
            {errors.instructions && (
                <Alert variant="danger" className="py-2">
                    {errors.instructions.message || 'Missing required fields.'}
                </Alert>
            )}
            {instructionFields.map((field, index) => (
              <div key={field.id} className="d-flex gap-2 mb-2 align-items-center">
                <span className="fw-bold">Step {index + 1}:</span>
                <Form.Control
                  as="textarea"
                  placeholder={`Content for Step ${index + 1}`}
                  isInvalid={!!errors.instructions?.[index]?.content}
                  {...register(`instructions.${index}.content`)}
                />
                <Button
                  variant="danger"
                  onClick={() => removeInstruction(index)}
                  className='fw-bold'
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              className="btn btn-success fw-bold mt-2 d-block"
              onClick={() => appendInstruction({ content: '' })}
            >
              + Add Instruction
            </Button>
          </Form.Group>

           {/* Nutrition facts */}
           <Form.Group controlId="nutritions" className="mb-3 p-3 border rounded">
            <Form.Label className="fw-bold">Nutrition Facts</Form.Label>
            {nutritionFields.map((field, index) => (
              <div key={field.id} className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  placeholder="Nutrition name"
                  isInvalid={!!errors.nutritions?.[index]?.name}
                  {...register(`nutritions.${index}.name`)}
                />
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Value"
                  isInvalid={!!errors.nutritions?.[index]?.amount}
                  min="0"
                  {...register(`nutritions.${index}.amount`)}
                />
                <Form.Control
                  type="text"
                  placeholder="Unit"
                  isInvalid={!!errors.nutritions?.[index]?.unit}
                  {...register(`nutritions.${index}.unit`)}
                />
                <Button
                  variant="danger"
                  onClick={() => removeNutrition(index)}
                  className='fw-bold'
                >
                  -
                </Button>
                <Form.Control.Feedback type="invalid" className="d-block">
                    {errors.nutritions?.[index]?.amount?.message}
                </Form.Control.Feedback>
              </div>
            ))}
            <Button className="btn btn-success fw-bold mt-2 d-block" onClick={() => appendNutrition({ name: '', amount: 0, unit: '' })}>+ Add Nutrition</Button>
          </Form.Group>

          {/* Submit button */}
          <Button className="btn btn-success mt-3" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Recipe'}
          </Button>
          </Container>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddRecipeModal;
