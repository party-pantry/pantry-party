"use client";

import { Container, Button } from "react-bootstrap";
import React, { useState } from "react";
import IngredientTable from "../../components/IngredientTable";
import StorageContainer from "../../components/StorageContainer";
import AddItemModal from "../../components/AddItemModal";
import AddPantryModal from "../../components/AddPantryModal";
import KitchenFilterButton from "../../components/KitchenFilterButton";
import EditItemModal from "../../components/EditItemModal";

type Item = {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: "Good" | "Low Stock" | "Out of Stock" | "Expired";
};

type Storage = {
  id: number;
  name: string;
  type: string;
}

const MyKitchen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const [filters, setFilters] = useState<{
    search: string;
    quantity?: number;
    status: Item["status"][];
  }>({ search: "", quantity: undefined, status: [] });

  // Example test data of items in kitchen
  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      name: "Tomatoes",
      image: "🍅",
      quantity: "20",
      updated: "Sep 8, 2025",
      status: "Good",
    },
    {
      id: 2,
      name: "Chicken Breast",
      image: "🍗",
      quantity: "5",
      updated: "Sep 8, 2025",
      status: "Low Stock",
    },
    {
      id: 3,
      name: "Egg",
      image: "🥚",
      quantity: "0",
      updated: "Sep 8, 2025",
      status: "Out of Stock",
    },
    {
      id: 4,
      name: "Milk",
      image: "🥛",
      quantity: "2",
      updated: "Sep 8, 2025",
      status: "Low Stock",
    },
    {
      id: 5,
      name: "Bread",
      image: "🍞",
      quantity: "1",
      updated: "Sep 8, 2025",
      status: "Low Stock",
    },
    {
      id: 6,
      name: "Carrots",
      image: "🥕",
      quantity: "15",
      updated: "Sep 8, 2025",
      status: "Good",
    },
    {
      id: 7,
      name: "Cheese",
      image: "🧀",
      quantity: "3",
      updated: "Sep 8, 2025",
      status: "Low Stock",
    },
    {
      id: 8,
      name: "Apples",
      image: "🍎",
      quantity: "10",
      updated: "Sep 8, 2025",
      status: "Good",
    },
    {
      id: 9,
      name: "Spinach",
      image: "🥬",
      quantity: "0",
      updated: "Sep 8, 2025",
      status: "Out of Stock",
    },
    {
      id: 10,
      name: "Butter",
      image: "🧈",
      quantity: "2",
      updated: "Sep 8, 2025",
      status: "Low Stock",
    },
    {
      id: 11,
      name: "Rice",
      image: "🍚",
      quantity: "25",
      updated: "Sep 8, 2025",
      status: "Good",
    },
    {
      id: 12,
      name: "Banana",
      image: "🍌",
      quantity: "6",
      updated: "Sep 8, 2025",
      status: "Good",
    },
    {
      id: 13,
      name: "Yogurt",
      image: "🥣",
      quantity: "1",
      updated: "Jul 8, 2025",
      status: "Expired",
    },
    {
      id: 14,
      name: "Potatoes",
      image: "🥔",
      quantity: "12",
      updated: "Sep 8, 2025",
      status: "Good",
    },
    {
      id: 15,
      name: "Chicken Strips",
      image: "🐥",
      quantity: "1",
      updated: "June 1, 2024",
      status: "Expired",
    },
  ]);
  
  const [pantryArray, setPantryArray] = useState<Storage[]>([]);

  const handleAddItem = (newItem: Omit<Item, "id" | "updated">) => {
    const item: Item = {
      ...newItem,
      id: Math.max(...items.map((i) => i.id), 0) + 1,
      updated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setItems((prev) => [...prev, item]);
  };

  const handleDeleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditItem = (id: number) => {
    const foundItem = items.find((item) => item.id === id);
    if (foundItem) {
      setItemToEdit(foundItem);
      setShowEditModal(true);
    }
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setShowEditModal(false);
    setItemToEdit(null);
  };

  const filteredItems = items.filter((item) => {
    const searchMatch = filters.search
      ? item.name.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    const statusMatch =
      filters.status.length > 0 ? filters.status.includes(item.status) : true;

    const quantityMatch =
      filters.quantity != null && filters.quantity != undefined
        ? Number(item.quantity) <= filters.quantity
        : true;

    return searchMatch && statusMatch && quantityMatch;
  });

  const handleAddPantry = (newPantry: { name: string; type: string }) => {
    const pantry: Storage = {
      ...newPantry,
      id: Math.max(...pantryArray.map((p) => p.id), 0) + 1,
    };
    setPantryArray((prev) => [...prev, pantry]);
  };

  return (
    <Container style={{ marginTop: 100 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "10vh",
          paddingTop: 5,
        }}
      >
        <Button
          style={{ width: "125px" }}
          variant="success"
          onClick={() => setShowAddModal(true)}
        >
          <strong>Add Item +</strong>
        </Button>
        <KitchenFilterButton
          onApply={(filters) =>
            setFilters({
              ...filters,
              status: filters.status as Item["status"][],
            })
          }
        />
      </div>
      <div>
        <Button
          style={{ width: "126px"}}
          variant="success"
          onClick={() => setShowPantryModal(true)}
        >
          <strong>Add Pantry +</strong>
        </Button>
      </div>

      {/* Mockup Ingredient Table */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginBottom: "50px",
        }}
      >
        {/* Multiple storage spaces for a single location (aka. one home) */}
       
        <StorageContainer id="1" title="Fridge 1">
          <IngredientTable
            items={filteredItems}
            onDelete={handleDeleteItem}
            onEdit={handleEditItem}
          />
        </StorageContainer>
        <StorageContainer id="1" title="Fridge 2">
          <IngredientTable
            items={filteredItems}
            onDelete={handleDeleteItem}
            onEdit={handleEditItem}
          />
        </StorageContainer>
        <StorageContainer id="1" title="Pantry 1">
          <IngredientTable
            items={filteredItems}
            onDelete={handleDeleteItem}
            onEdit={handleEditItem}
          />
        </StorageContainer>

         {pantryArray.map((pantry: Storage) => (
          <StorageContainer key={pantry.id} id={pantry.id.toString()} title={pantry.name}>
            <IngredientTable
              items={filteredItems}
              onDelete={handleDeleteItem}
              onEdit={handleEditItem}
            />
          </StorageContainer>
          ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
          height: "50vh",
          marginBottom: "200px",
        }}
      >
        <h1>My Kitchen</h1>
        <h2>Here you can see what is in your kitchen (for single location)</h2>
      </div>

      <AddItemModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddItem={handleAddItem}
      />
      <AddPantryModal
        show={showPantryModal}
        onHide={() => setShowPantryModal(false)}
        onAddPantry={handleAddPantry}
      />
      <EditItemModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        itemToEdit={itemToEdit}
        onUpdateItem={handleUpdateItem}
      />
    </Container>
  );
};

export default MyKitchen;
