/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
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
import KitchenSortButton from '../../components/KitchenSortButton';

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

  // Used as global filtering state (for all storage locations)
  const [filters, setFilters] = useState<{ search: string; status: string[] }>({
    search: '',
    status: [],
  });

  // Sort direction per storage (keyed by storage.id)
  const [sortDirections, setSortDirections] = useState<Record<number, 'asc' | 'desc'>>({});

  // Fetch kitchen data
  useEffect(() => {
    async function fetchHouses() {
      const res = await fetch('/api/kitchen');
      const data = await res.json();
      setHouses(data);
    }
    fetchHouses();
  }, []);

  // Flatten all stocks into items
  const handleEditItem = (id: number) => {
    const allItems: Item[] = houses.flatMap((house) =>
      house.storages.flatMap((storage) =>
        storage.stocks.map((stock) => ({
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
          category: stock.category.toLowerCase() as 'fridge' | 'pantry' | 'freezer' | 'spice rack' | 'other',
        })),
      ),
    );

    const foundItem = allItems.find((item) => item.id === id);
    if (foundItem) {
      setItemToEdit(foundItem);
      setShowEditModal(true);
    }
  };

  // Toggle sorting for one storage
  const handleSort = (storageId: number) => {
    setSortDirections((prev) => ({
      ...prev,
      [storageId]: prev[storageId] === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Get the items for one storage (filtered + sorted)
  const getDisplayedStocks = (storage: Storage): Item[] => {
    const allItems: Item[] = storage.stocks.map((stock) => ({
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
      category: stock.category.toLowerCase() as 'fridge' | 'pantry' | 'freezer' | 'spice rack' | 'other',
    }));

    // Apply filters
    const filtered = allItems.filter((item) => {
      const searchMatch = filters.search ? item.name.toLowerCase().includes(filters.search.toLowerCase()) : true;
      const statusMatch = filters.status.length > 0 ? filters.status.includes(item.status) : true;
      return searchMatch && statusMatch;
    });

    // Sorting (by name)
    const direction = sortDirections[storage.id] || 'asc';
    return filtered.sort((a, b) => (direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  };

  return (
    <Container style={{ marginTop: 40 }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '20vh',
          marginBottom: '5px',
        }}
      >
        <h1 className="fs-1">My Kitchen</h1>
        <h6>Here you can see what is in your kitchen</h6>
        <hr />
      </div>

      {/* Houses and storages */}
      <div
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '50px',
        }}
      >
        {houses.map((house) => (
          <HomeTabSelection key={house.id} id={house.id.toString()} title={house.name}>
            <Row className="justify-content-end mb-3 pr-4">
              <KitchenFilterButton
                onApply={(appliedFilters) => setFilters({ ...filters, status: appliedFilters.status })}
              />
              <Button
                style={{ width: '125px', backgroundColor: '#3A5B4F', color: 'white' }}
                variant=""
                onClick={() => setShowAddModal(true)}
              >
                <strong>Add Item +</strong>
              </Button>
            </Row>
            {house.storages.map((storage) => (
              <StorageContainer
                key={storage.id}
                id={storage.id.toString()}
                title={storage.name}
                /* Sorting for every storage space */
                feature={<KitchenSortButton label="Sort" onSort={() => handleSort(storage.id)} />}
              >
                {/* Table of items */}
                <IngredientTable items={getDisplayedStocks(storage)} onDelete={() => {}} onEdit={handleEditItem} />
              </StorageContainer>
            ))}
            <Button
              className="mt-1"
              style={{ width: '150px', backgroundColor: '#3A5B4F', borderColor: '#3A5B4F' }}
              onClick={() => setShowPantryModal(true)}
            >
              <strong>Add Storage +</strong>
            </Button>
          </HomeTabSelection>
        ))}
      </div>

      {/* Modals */}
      <AddItemModal show={showAddModal} onHide={() => setShowAddModal(false)} onAddItem={() => {}} />
      <AddPantryModal show={showPantryModal} onHide={() => setShowPantryModal(false)} onAddPantry={() => {}} />
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
