'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Container, Card, Row, Col, Button, Form } from 'react-bootstrap';
import { ShoppingItem, sortItemsByPriority } from '../../utils/shoppingListUtils';
import ShoppingItemCard from '../../components/shopping-list-components/ShoppingItemCard';
import PurchasedItemCard from '../../components/shopping-list-components/PurchasedItemCard';
import SuggestedItemsSection from '../../components/shopping-list-components/SuggestedItemsSection';

interface SuggestedItem {
  ingredientId: number;
  name: string;
  unit: string;
  status: string;
  storageId: number;
  storageName: string;
  storageType: string;
  houseName: string;
  suggestedPriority: string;
  currentQuantity: number;
}

const ShoppingList: React.FC = () => {
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: 'Other' as ShoppingItem['category'],
    priority: 'Medium' as ShoppingItem['priority'],
  });

  const fetchShoppingList = async () => {
    try {
      const response = await fetch('/api/shopping-list');
      if (response.ok) {
        const data = await response.json();
        setShoppingItems(data);
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
    const { name, quantity, category, priority } = newItem;
    if (!name || !quantity) return;

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity,
          category,
          priority,
          source: 'MANUAL',
        }),
      });

      if (response.ok) {
        await fetchShoppingList();
        setNewItem({
          name: '',
          quantity: '',
          category: 'Other',
          priority: 'Medium',
        });
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
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: item.ingredientId,
          name: item.name,
          quantity,
          category,
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
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchShoppingList();
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <Container className="mb-12 min-h-screen mt-5">
        <div className="text-center py-5">Loading...</div>
      </Container>
    );
  }

  const unpurchasedItems = shoppingItems.filter((item) => !item.purchased);
  const purchasedItems = shoppingItems.filter((item) => item.purchased);

  return (
    <Container className="mb-12 min-h-screen mt-5">
      {/* <div className="flex flex-col justify-center h-[30vh] mb-5">
        <h1 className="text-4xl font-bold">Shopping List</h1>
        <h6 className="text-gray-600 mt-2">Keep track of what you need to buy</h6>
        <div className="flex justify-end mt-2" />
        <hr className="mt-4 border-gray-300" />
      </div> */}

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
                </Col >
                {/* Add Item to a list */}
                {/* <Row className="justify-content-end mb-4"> */}
                    <Col md={4} className="text-end">
                      <Button
                        variant={showAddForm ? 'outline-secondary' : 'success'}
                        onClick={() => setShowAddForm(!showAddForm)}
                        // style={{ width: '125px' }}
                      >
                        <strong>{showAddForm ? 'Cancel' : '+'}</strong>
                      </Button>
                    </Col>
                  {/* </Row> */}
              </Row>

            {showAddForm && (
              <Card className="mb-4 shadow-sm">
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
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={newItem.category}
                          onChange={(e) => setNewItem({
                            ...newItem,
                            category: e.target.value as ShoppingItem['category'],
                          })}
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
                          onChange={(e) => setNewItem({
                            ...newItem,
                            priority: e.target.value as ShoppingItem['priority'],
                          })}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </Form.Select>
                      </Col>
                      {/* <Col md={1} /> */}
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
          <Card className="shadow-sm">
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
        </Col>
      </Row>

      <SuggestedItemsSection suggestions={suggestions} onAdd={handleAddSuggestion} />

    </Container>
  );
};

export default ShoppingList;
