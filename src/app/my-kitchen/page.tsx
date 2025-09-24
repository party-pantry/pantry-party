/* eslint-disable no-nested-ternary */

'use client';

import { Container, Button, Row } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import IngredientTable from '../../components/IngredientTable';
import StorageContainer from '../../components/StorageContainer';
import HomeTabSelection from '../../components/HomeTabSelection';
import AddItemModal from '../../components/AddItemModal';
import AddPantryModal from '../../components/AddPantryModal';
import KitchenFilterButton from '../../components/KitchenFilterButton';
import EditItemModal from '../../components/EditItemModal';

// Types
type Item = {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
  category: 'fridge' | 'pantry' | 'freezer' | 'spice rack' | 'other';
};

type Stock = {
  id: number;
  quantity: number;
  unit: string;
  status: 'GOOD' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  category: string;
  last_updated: string;
  ingredient: {
    id: number;
    name: string;
    image?: string;
  };
};

type Storage = {
  id: number;
  name: string;
  type: string;
  stocks: Stock[];
};

type House = {
  id: number;
  name: string;
  storages: Storage[];
};

const MyKitchen = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const [filters, setFilters] = useState<{
    search: string;
    status: string[];
  }>({ search: '', status: [] });

  useEffect(() => {
    async function fetchHouses() {
      const res = await fetch('/api/kitchen');
      const data = await res.json();
      setHouses(data);
    }
    fetchHouses();
  }, []);

  const handleEditItem = (id: number) => {
    // Flatten all stocks into items
    // eslint-disable-next-line max-len
    const allItems: Item[] = houses.flatMap((house) => house.storages.flatMap((storage) => storage.stocks.map((stock) => ({
      id: stock.id,
      name: stock.ingredient.name,
      image: stock.ingredient.image || '',
      quantity: `${stock.quantity} ${stock.unit}`,
      updated: new Date(stock.last_updated).toLocaleDateString('en-US'),
      status:
            stock.status === 'GOOD'
              ? 'Good'
              : stock.status === 'LOW_STOCK'
                ? 'Low Stock'
                : stock.status === 'OUT_OF_STOCK'
                  ? 'Out of Stock'
                  : 'Expired',
      category: (stock.category.toLowerCase() as 'fridge' | 'pantry' | 'freezer' | 'spice rack' | 'other'),
    }))));

    const foundItem = allItems.find((item) => item.id === id);
    if (foundItem) {
      setItemToEdit(foundItem);
      setShowEditModal(true);
    }
  };

  // Apply filters to all stocks
  const getFilteredStocks = (stocks: Stock[]) => stocks
    .map((stock) => ({
      id: stock.id,
      name: stock.ingredient.name,
      image: stock.ingredient.image || '',
      quantity: `${stock.quantity} ${stock.unit}`,
      updated: new Date(stock.last_updated).toLocaleDateString('en-US'),
      status:
          stock.status === 'GOOD'
            ? 'Good'
            : stock.status === 'LOW_STOCK'
              ? 'Low Stock'
              : stock.status === 'OUT_OF_STOCK'
                ? 'Out of Stock'
                : 'Expired' as 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired',
      category: stock.category.toLowerCase(),
    }))
    .filter((item) => {
      const searchMatch = filters.search
        ? item.name.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const statusMatch = filters.status.length > 0 ? filters.status.includes(item.status) : true;
      return searchMatch && statusMatch;
    });

  return (
    <Container style={{ marginTop: 100 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '30vh',
          marginBottom: '5px',
        }}
      >
        <h1 className="fs-1">My Kitchen</h1>
        <h6>Here you can see what is in your kitchen</h6>
        <hr />
      </div>

      <div
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '50px',
        }}
      >
        {/* Map houses from db */}
        {houses.map((house) => (
          <HomeTabSelection key={house.id} id={house.id.toString()} title={house.name}>
            <Row className="justify-content-end mb-4">
              <KitchenFilterButton
                onApply={(appliedFilters) => setFilters({ ...filters, status: appliedFilters.status })}
              />
              <Button
                style={{ width: '125px' }}
                variant="success"
                onClick={() => setShowAddModal(true)}
              >
                <strong>Add Item +</strong>
              </Button>
            </Row>

            {house.storages.map((storage) => (
              <StorageContainer key={storage.id} id={storage.id.toString()} title={storage.name}>
                <IngredientTable
                  items={getFilteredStocks(storage.stocks)}
                  onDelete={() => {}}
                  onEdit={handleEditItem}
                />
              </StorageContainer>
            ))}

            <Button
              style={{ width: '150px', backgroundColor: '#028383ff' }}
              onClick={() => setShowPantryModal(true)}
            >
              <strong>Add Storage +</strong>
            </Button>
          </HomeTabSelection>
        ))}
      </div>

      <AddItemModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddItem={() => {}}
        storages={houses.flatMap((house) => house.storages.map((storage) => ({ id: storage.id, name: storage.name })))}
      />
      <AddPantryModal
        show={showPantryModal}
        onHide={() => setShowPantryModal(false)}
        onAddPantry={() => {}}
      />
      <EditItemModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        itemToEdit={itemToEdit}
        onUpdateItem={() => {}}
      />
    </Container>
  );
};

export default MyKitchen;
