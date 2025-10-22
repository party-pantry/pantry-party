'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Container, Card, Row, Col, Button, Form, Placeholder } from 'react-bootstrap';
import { ShoppingItem, sortItemsByPriority } from '@/utils/shoppingListUtils';
import ShoppingItemCard from './shopping-list-components/ShoppingItemCard';
import PurchasedItemCard from './shopping-list-components/PurchasedItemCard';
import SuggestedItemsSection from './shopping-list-components/SuggestedItemsSection';
import { parse } from 'path';

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
}

// Loading Skeleton Component
const ShoppingListSkeleton: React.FC = () => (
  <Container className="mb-12 min-h-screen mt-5">
    {/* Stats Cards Skeleton */}
    <Row className="mb-4">
      <Col md={4}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Placeholder as="h3" animation="glow">
              <Placeholder xs={6} className="fs-2" />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={8} />
            </Placeholder>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Placeholder as="h3" animation="glow">
              <Placeholder xs={6} className="fs-2" />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={8} />
            </Placeholder>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center shadow-sm">
          <Card.Body>
            <Placeholder as="h3" animation="glow">
              <Placeholder xs={6} className="fs-2" />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={8} />
            </Placeholder>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Main Content Skeleton */}
    <Row className="mb-4">
      <Col lg={8}>
        <Card className="shadow-sm">
          <Card.Header>
            <Row>
              <Col md={8}>
                <Placeholder as="h4" animation="glow">
                  <Placeholder xs={7} />
                </Placeholder>
              </Col>
              <Col md={4} className="text-end">
                <Placeholder.Button variant="success" xs={4} />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <div className="d-grid gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border">
                  <Card.Body>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={8} className="mb-2" />
                      <Placeholder xs={5} size="sm" className="mb-2" />
                      <Placeholder xs={6} size="sm" />
                    </Placeholder>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Row>
          {/* Recently Purchased Skeleton */}
          <Card className="shadow-sm mb-2">
            <Card.Header>
              <Placeholder as="h4" animation="glow">
                <Placeholder xs={9} />
              </Placeholder>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <div className="d-grid gap-2">
                {[1, 2].map((i) => (
                  <Card key={i} className="border">
                    <Card.Body>
                      <Placeholder as="div" animation="glow">
                        <Placeholder xs={7} size="sm" className="mb-1" />
                        <Placeholder xs={5} size="sm" />
                      </Placeholder>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Total Cost Skeleton */}
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Placeholder as="h3" animation="glow">
                <Placeholder xs={6} className="fs-2" />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} />
              </Placeholder>
            </Card.Body>
          </Card>
        </Row>
      </Col>
    </Row>

    {/* Suggestions Skeleton */}
    <Card className="shadow-sm">
      <Card.Header>
        <Placeholder as="h4" animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {[1, 2, 3].map((i) => (
            <Col md={4} key={i}>
              <Card className="border">
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
        setNewItem({ name: '', quantity: '', price: '', category: 'Other', priority: 'Medium' });
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
      // const price = item.ingredient?.price ?? 0;
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: item.ingredientId,
          name: item.name,
          quantity,
          category,
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
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="text-primary fs-2">{unpurchasedItems.length}</h3>
              <Card.Text className="text-dark">Items to Buy</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="text-success fs-2">{purchasedItems.length}</h3>
              <Card.Text className="text-dark">Items Purchased</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="text-danger fs-2">
                {unpurchasedItems.filter((item) => item.priority === 'High').length}
              </h3>
              <Card.Text className="text-dark">High Priority Items</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <Row>
                <Col md={8}>
                  <h4 className="mt-1">Items to Buy ({unpurchasedItems.length})</h4>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    variant={showAddForm ? 'outline-secondary' : 'success'}
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <strong>{showAddForm ? 'Cancel' : '+'}</strong>
                  </Button>
                </Col>
              </Row>
              {showAddForm && (
                <Card className="mt-1 mb-4 shadow-sm">
                  <Card.Body>
                    <Form onSubmit={handleAddItem}>
                      <Row className="g-3 align-items-end">
                        <Col md={4}>
                          <Form.Label>Item Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter item name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            required
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., 2 lbs"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                            required
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>Price ($)</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            required
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Label>Category</Form.Label>
                          <Form.Select
                            value={newItem.category}
                            // eslint-disable-next-line max-len
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ShoppingItem['category'] })
                            }
                          >
                            <option value="Produce">Produce</option>
                            <option value="Meat">Meat</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Frozen">Frozen</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Col>
                        <Col md={2}>
                          <Form.Label>Priority</Form.Label>
                          <Form.Select
                            value={newItem.priority}
                            // eslint-disable-next-line max-len
                            onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as ShoppingItem['priority'] })
                            }
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </Form.Select>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-2 align-items-end">
                        <Col md={10} />
                        <Col md={2}>
                          <Button type="submit" variant="primary" className="w-100">
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              )}
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {unpurchasedItems.length === 0 ? (
                <p className="text-muted text-center py-4">No items in your shopping list!</p>
              ) : (
                <div className="d-grid gap-3">
                  {sortItemsByPriority(unpurchasedItems).map((item) => (
                    <ShoppingItemCard
                      key={item.id}
                      item={item}
                      onTogglePurchased={togglePurchased}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Row>
            <Card className="shadow-sm mb-2">
              <Card.Header>
                <h4 className="mt-1">Recently Purchased ({purchasedItems.length})</h4>
              </Card.Header>
              <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {purchasedItems.length === 0 ? (
                  <p className="text-muted text-center py-4">No purchased items yet!</p>
                ) : (
                  <div className="d-grid gap-2">
                    {purchasedItems.map((item) => (
                      <PurchasedItemCard
                        key={item.id}
                        item={item}
                        onTogglePurchased={togglePurchased}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="fs-2">${totalCost.toFixed(2)}</h3>
                <Card.Text className="text-dark">Total Cost</Card.Text>
              </Card.Body>
            </Card>
          </Row>
        </Col>
      </Row>

      <SuggestedItemsSection suggestions={suggestions} onAdd={handleAddSuggestion} />
    </Container>
  );
};

export default ShoppingList;
