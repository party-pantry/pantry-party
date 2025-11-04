'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Container, Card, Row, Col, Button, Form, Placeholder } from 'react-bootstrap';
import { ShoppingItem, sortItemsByPriority } from '@/utils/shoppingListUtils';
// import { parse } from 'path';
import { LocalFoodCategory } from '@/lib/Units';
import ShoppingItemCard from './ShoppingItemCard';
import PurchasedItemCard from './PurchasedItemCard';
import SuggestedItemsSection from './SuggestedItemsSection';

interface SuggestedItem {
  ingredientId: number;
  name: string;
  unit: string;
  price: number;
  status: string;
  storageId: number;
  storageName: string;
  storageType: string;
  houseName: string;
  suggestedPriority: string;
  currentQuantity: number;
  category: string;
}

// Loading Skeleton Component
const ShoppingListSkeleton: React.FC = () => (
  <Container className="mb-12 min-h-screen mt-5">
    {/* Stats Cards Skeleton */}
    <Row className="mb-4">
      {[1, 2, 3, 4].map((i) => (
        <Col key={i} md={3}>
          <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <Placeholder as="h3" animation="glow">
                <Placeholder xs={6} className="fs-2 mb-1" />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={8} size="sm" />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>

    {/* Control Bar Skeleton */}
    <div className="d-flex justify-content-between align-items-center mb-4">
      <Placeholder as="h4" animation="glow">
        <Placeholder xs={3} />
      </Placeholder>
      <div className="d-flex gap-2">
        <Placeholder.Button variant="outline-secondary" size="sm" xs={2} />
        <Placeholder.Button variant="success" xs={2} />
      </div>
    </div>

    {/* Shopping Items Grid Skeleton */}
    <Row className="g-3 mb-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col key={i} md={4} sm={6} xs={12}>
          <Card className="shopping-item-card h-100 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <div className="d-flex gap-2">
                  <Placeholder as="span" animation="glow">
                    <Placeholder xs={6} className="rounded-pill" style={{ height: '20px', width: '60px' }} />
                  </Placeholder>
                  <Placeholder as="span" animation="glow">
                    <Placeholder xs={6} className="rounded-pill" style={{ height: '20px', width: '60px' }} />
                  </Placeholder>
                </div>
                <Placeholder as="div" animation="glow">
                  <Placeholder style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                </Placeholder>
              </div>
              <Placeholder as="h6" animation="glow">
                <Placeholder xs={8} className="mb-1" />
              </Placeholder>
              <Placeholder as="p" animation="glow" className="mb-2">
                <Placeholder xs={5} size="sm" />
              </Placeholder>
              <div className="d-flex justify-content-between">
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={4} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                  <Placeholder style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </Placeholder>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>

    {/* Suggestions Section Skeleton */}
    <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
      <Card.Header>
        <Placeholder as="h4" animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {[1, 2, 3].map((i) => (
            <Col md={4} key={i}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                <Card.Body>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={9} className="mb-2" />
                    <Placeholder xs={7} size="sm" className="mb-2" />
                    <Placeholder xs={8} size="sm" className="mb-3" />
                    <Placeholder.Button variant="primary" xs={12} />
                  </Placeholder>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  </Container>
);

const ShoppingList: React.FC = () => {
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPurchased, setShowPurchased] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    price: '',
    category: 'Other' as ShoppingItem['category'],
    priority: 'Medium' as ShoppingItem['priority'],
  });

  const fetchShoppingList = async () => {
    try {
      const response = await fetch('/api/shopping-list');
      if (response.ok) {
        const data = await response.json();
        setShoppingItems(data);
        console.log(data);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/shopping-list/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  useEffect(() => {
    if (session) {
      setLoading(true);
      Promise.all([fetchShoppingList(), fetchSuggestions()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session]);

  const handleAddItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const { name, quantity, price, category, priority } = newItem;
    if (!name || !quantity || !price) return;

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity,
          price: parseFloat(price),
          category,
          priority,
          source: 'MANUAL',
        }),
      });
      if (response.ok) {
        await fetchShoppingList();
        setNewItem({ name: '', quantity: '', price: '', category: LocalFoodCategory.OTHER, priority: 'Medium' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleAddSuggestion = async (
    item: SuggestedItem,
    category: string,
    quantity: string,
  ): Promise<void> => {
    try {
      const enumCategory = LocalFoodCategory[category.toUpperCase() as keyof typeof LocalFoodCategory];
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: item.ingredientId,
          name: item.name,
          quantity,
          category: enumCategory,
          price: item.price,
          priority: item.suggestedPriority,
          source: 'SUGGESTED',
          sourceStockIngredientId: item.ingredientId,
          sourceStorageId: item.storageId,
        }),
      });

      if (response.ok) {
        await fetchShoppingList();
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Error adding suggestion:', error);
    }
  };

  const togglePurchased = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-purchased' }),
      });

      if (response.ok) {
        await fetchShoppingList();
      }
    } catch (error) {
      console.error('Error toggling purchased:', error);
    }
  };

  const removeItem = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/shopping-list/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchShoppingList();
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <ShoppingListSkeleton />;
  }

  const unpurchasedItems = shoppingItems.filter((item) => !item.purchased);
  const purchasedItems = shoppingItems.filter((item) => item.purchased);

  // const totalCost = unpurchasedItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalCost = unpurchasedItems.reduce((sum, item) => {
    const price = parseFloat(String(item.price)) || 0;
    const quantity = parseFloat(String(item.quantity)) || 1;
    return sum + price * quantity;
  }, 0);

  return (
    <Container className="mb-12 min-h-screen mt-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h2 className="mb-0 fw-bold">Shopping List</h2>
        <div className="d-flex gap-2">
          <Button
            variant={showPurchased ? 'primary' : 'secondary'}
            onClick={() => setShowPurchased(!showPurchased)}
            size="sm"
            className="px-3"
          >
            {showPurchased ? 'Hide' : 'Show'} Purchased ({purchasedItems.length})
          </Button>
          <Button
            variant="success"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4"
            style={{ backgroundColor: '#3A5B4F', borderColor: '#3A5B4F' }}
          >
            <strong>{showAddForm ? 'Cancel' : 'Add Item +'}</strong>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body className="py-4">
              <h3 className="text-primary fs-2 mb-1 fw-bold">{unpurchasedItems.length}</h3>
              <Card.Text className="text-muted small mb-0 fw-medium">Items to Buy</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body className="py-4">
              <h3 className="text-success fs-2 mb-1 fw-bold">{purchasedItems.length}</h3>
              <Card.Text className="text-muted small mb-0 fw-medium">Items Purchased</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body className="py-4">
              <h3 className="text-danger fs-2 mb-1 fw-bold">
                {unpurchasedItems.filter((item) => item.priority === 'High').length}
              </h3>
              <Card.Text className="text-muted small mb-0 fw-medium">High Priority</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body className="py-4">
              <h3 className="fs-2 mb-1 fw-bold text-dark">${totalCost.toFixed(2)}</h3>
              <Card.Text className="text-muted small mb-0 fw-medium">Total Cost</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Item Form */}
      {showAddForm && (
        <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '1rem' }}>
          <Card.Header
            className="fs-5 fw-bold text-white"
            style={{ backgroundColor: '#3A5B4F', borderRadius: '1rem 1rem 0 0' }}
          >
            Add New Item
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleAddItem}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Label className="fw-bold text-dark">Item Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                    className="border-2"
                  />
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-bold text-dark">Quantity</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2 lbs"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    required
                    className="border-2"
                  />
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-bold text-dark">Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    required
                    className="border-2"
                  />
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-bold text-dark">Category</Form.Label>
                  <Form.Select
                    value={newItem.category}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      category: e.target.value as ShoppingItem['category'],
                    })}
                    className="border-2"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-bold text-dark">Priority</Form.Label>
                  <Form.Select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      priority: e.target.value as ShoppingItem['priority'],
                    })}
                    className="border-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Form.Select>
                </Col>
                <Col md={1}>
                  <Button
                    type="submit"
                    variant="success"
                    className="w-100 fw-bold"
                    style={{ backgroundColor: '#3A5B4F', borderColor: '#3A5B4F' }}
                  >
                    Add
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Purchased Items Section */}
      {showPurchased && purchasedItems.length > 0 && (
        <>
          <h4 className="mt-5 mb-3 fw-bold">Recently Purchased</h4>
          <Row className="g-4 mb-4">
            {purchasedItems.map((item) => (
              <Col key={item.id} md={4} sm={6} xs={12} className="justify-content-center">
                <PurchasedItemCard
                  item={item}
                  onTogglePurchased={togglePurchased}
                  onRemove={removeItem}
                />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Shopping Items Grid */}
      {unpurchasedItems.length === 0 ? (
        <Card className="shadow-sm text-center py-5 border-0 mb-5" style={{ borderRadius: '1rem' }}>
          <Card.Body className="py-5">
            <div className="mb-3">
              <i className="fas fa-shopping-cart text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="text-muted mb-2 fw-bold">No items in your shopping list!</h5>
            <p className="text-muted small mb-0">Click &quot;Add Item +&quot; to get started.</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <h4 className="mt-5 mb-3 fw-bold">Your List</h4>
          <Row className="g-4 mb-4">
            {sortItemsByPriority(unpurchasedItems).map((item) => (
              <Col key={item.id} md={4} sm={6} xs={12} className="justify-content-center ">
                <ShoppingItemCard
                  item={item}
                  onTogglePurchased={togglePurchased}
                  onRemove={removeItem}
                />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Suggestions Section */}
      <SuggestedItemsSection suggestions={suggestions} onAdd={handleAddSuggestion} />
    </Container>
  );
};

export default ShoppingList;
