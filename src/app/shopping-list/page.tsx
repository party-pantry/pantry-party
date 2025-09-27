'use client';

import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Form } from 'react-bootstrap';
import { ShoppingItem, sortItemsByPriority } from '../../utils/shoppingListUtils';
import ShoppingItemCard from '../../components/shopping-list-components/ShoppingItemCard';
import PurchasedItemCard from '../../components/shopping-list-components/PurchasedItemCard';

const ShoppingList: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: 'Other' as ShoppingItem['category'],
    priority: 'Medium' as ShoppingItem['priority'],
  });

  // Example shopping list data
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    {
      id: 1,
      name: 'Milk',
      quantity: '1 gallon',
      category: 'Dairy',
      priority: 'High',
      purchased: false,
      addedDate: 'Sep 9, 2025',
    },
    {
      id: 2,
      name: 'Bread',
      quantity: '2 loaves',
      category: 'Pantry',
      priority: 'Medium',
      purchased: false,
      addedDate: 'Sep 9, 2025',
    },
    {
      id: 3,
      name: 'Bananas',
      quantity: '1 bunch',
      category: 'Produce',
      priority: 'Low',
      purchased: true,
      addedDate: 'Sep 8, 2025',
    },
    {
      id: 4,
      name: 'Chicken Breast',
      quantity: '2 lbs',
      category: 'Meat',
      priority: 'High',
      purchased: false,
      addedDate: 'Sep 9, 2025',
    },
  ]);

  // Object destructuring for better readability
  const handleAddItem = (e: React.FormEvent): void => {
    e.preventDefault();
    const { name, quantity } = newItem;
    if (!name || !quantity) return;

    const item: ShoppingItem = {
      ...newItem,
      id: Math.max(...shoppingItems.map(({ id }) => id), 0) + 1,
      purchased: false,
      addedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setShoppingItems((prev) => [...prev, item]);
    setNewItem({
      name: '',
      quantity: '',
      category: 'Other',
      priority: 'Medium',
    });
    setShowAddForm(false);
  };

  // Arrow functions with proper typing
  const togglePurchased = (id: number): void => {
    setShoppingItems((prev) => prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item)));
  };

  const removeItem = (id: number): void => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const unpurchasedItems = shoppingItems.filter((item) => !item.purchased);
  const purchasedItems = shoppingItems.filter((item) => item.purchased);

  return (
    <Container style={{ marginBottom: 50 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '30vh',
          marginBottom: '5px',
        }}
      >
        <h1 className="fs-1">Shopping List</h1>
        <h6>Keep track of what you need to buy</h6>
        <hr />
      </div>

      <Row className="justify-content-end mb-4">
        <Button
          variant={showAddForm ? 'outline-secondary' : 'success'}
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ width: '125px' }}
        >
          <strong>{showAddForm ? 'Cancel' : 'Add Item +'}</strong>
        </Button>
      </Row>

      {/* Add Item Form */}
      {showAddForm && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Form onSubmit={handleAddItem}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
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
                    <option value="Pantry">Pantry</option>
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
                <Col md={3}>
                  <Button type="submit" variant="primary" className="w-100">
                    <strong>Add to List</strong>
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Statistics */}
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
                {
                  unpurchasedItems.filter((item) => item.priority === 'High')
                    .length
                }
              </h3>
              <Card.Text className="text-dark">High Priority Items</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Shopping List Items */}
      <Row>
        {/* Items to Buy */}
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                Items to Buy (
                {unpurchasedItems.length}
                )
              </h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {unpurchasedItems.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No items in your shopping list!
                </p>
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

        {/* Purchased Items */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                Recently Purchased (
                {purchasedItems.length}
                )
              </h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {purchasedItems.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No purchased items yet!
                </p>
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
    </Container>
  );
};

export default ShoppingList;
