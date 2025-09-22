"use client";
import React, { useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Form,
  Modal,
} from "react-bootstrap";

type ShoppingItem = {
  id: number;
  name: string;
  quantity: string;
  category: "Produce" | "Meat" | "Dairy" | "Pantry" | "Other";
  priority: "High" | "Medium" | "Low";
  purchased: boolean;
  addedDate: string;
};

const ShoppingList = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "Other" as ShoppingItem["category"],
    priority: "Medium" as ShoppingItem["priority"],
  });

  // Example shopping list data
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    {
      id: 1,
      name: "Milk",
      quantity: "1 gallon",
      category: "Dairy",
      priority: "High",
      purchased: false,
      addedDate: "Sep 9, 2025",
    },
    {
      id: 2,
      name: "Bread",
      quantity: "2 loaves",
      category: "Pantry",
      priority: "Medium",
      purchased: false,
      addedDate: "Sep 9, 2025",
    },
    {
      id: 3,
      name: "Bananas",
      quantity: "1 bunch",
      category: "Produce",
      priority: "Low",
      purchased: true,
      addedDate: "Sep 8, 2025",
    },
    {
      id: 4,
      name: "Chicken Breast",
      quantity: "2 lbs",
      category: "Meat",
      priority: "High",
      purchased: false,
      addedDate: "Sep 9, 2025",
    },
  ]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity) return;

    const item: ShoppingItem = {
      ...newItem,
      id: Math.max(...shoppingItems.map((i) => i.id), 0) + 1,
      purchased: false,
      addedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setShoppingItems((prev) => [...prev, item]);
    setNewItem({
      name: "",
      quantity: "",
      category: "Other",
      priority: "Medium",
    });
    setShowAddForm(false);
  };

  const togglePurchased = (id: number) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getPriorityColor = (priority: ShoppingItem["priority"]) => {
    switch (priority) {
      case "High":
        return "danger";
      case "Medium":
        return "warning";
      case "Low":
        return "secondary";
    }
  };

  const getCategoryColor = (category: ShoppingItem["category"]) => {
    switch (category) {
      case "Produce":
        return "success";
      case "Meat":
        return "danger";
      case "Dairy":
        return "info";
      case "Pantry":
        return "warning";
      case "Other":
        return "secondary";
    }
  };

  const unpurchasedItems = shoppingItems.filter((item) => !item.purchased);
  const purchasedItems = shoppingItems.filter((item) => item.purchased);

  return (
    <Container style={{ marginTop: 100, marginBottom: 50 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          height: "30vh",
          marginBottom: "5px",
        }}
      >
        <h1 className="fs-1">Shopping List</h1>
        <h6>Keep track of what you need to buy</h6>
        <hr />
      </div>

      <Row className="justify-content-end mb-4">
        <Button
          variant={showAddForm ? "outline-secondary" : "success"}
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ width: "125px" }}
        >
          <strong>{showAddForm ? "Cancel" : "Add Item +"}</strong>
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
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2 lbs"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        category: e.target.value as ShoppingItem["category"],
                      })
                    }
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
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        priority: e.target.value as ShoppingItem["priority"],
                      })
                    }
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
                  unpurchasedItems.filter((item) => item.priority === "High")
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
              <h5 className="mb-0">Items to Buy ({unpurchasedItems.length})</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
              {unpurchasedItems.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No items in your shopping list!
                </p>
              ) : (
                <div className="d-grid gap-3">
                  {unpurchasedItems
                    .sort((a, b) => {
                      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                      return (
                        priorityOrder[b.priority] - priorityOrder[a.priority]
                      );
                    })
                    .map((item) => (
                      <Card key={item.id} className="border">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                checked={item.purchased}
                                onChange={() => togglePurchased(item.id)}
                                className="me-3"
                              />
                              <div>
                                <div className="fw-bold text-dark">
                                  {item.name}
                                </div>
                                <small className="text-dark">
                                  {item.quantity} • Added {item.addedDate}
                                </small>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                              <Badge bg={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                style={{ width: "32px", height: "32px" }}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
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
                Recently Purchased ({purchasedItems.length})
              </h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
              {purchasedItems.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No purchased items yet!
                </p>
              ) : (
                <div className="d-grid gap-2">
                  {purchasedItems.map((item) => (
                    <Card key={item.id} className="border">
                      <Card.Body className="p-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <Form.Check
                              type="checkbox"
                              checked={item.purchased}
                              onChange={() => togglePurchased(item.id)}
                              className="me-2"
                            />
                            <div className="text-decoration-line-through opacity-75">
                              <div className="fw-bold text-dark">
                                {item.name}
                              </div>
                              <small className="text-dark">
                                {item.quantity}
                              </small>
                            </div>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            style={{ width: "28px", height: "28px" }}
                          >
                            ×
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
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
