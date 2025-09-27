'use client';

import { Container, Button, Row } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import IngredientTable from '../../../src/components/IngredientTable';
import StorageContainer from '../../../src/components/StorageContainer';
import HomeTabSelection from '../../../src/components/HomeTabSelection';
import AddItemModal from '../../../src/components/AddItemModal';
import AddPantryModal from '../../../src/components/AddPantryModal';
import KitchenFilterButton from '../../../src/components/KitchenFilterButton';
import EditItemModal from '../../../src/components/EditItemModal';
import KitchenSortButton from '../../../src/components/KitchenSortButton';

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

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch the houses from the db
  useEffect(() => {
    async function fetchHouses() {
      const res = await fetch('/api/kitchen');
      const data = await res.json();
      setHouses(data);
    }
    fetchHouses();
  }, []);

  // // Flatten all stocks into items
  // const handleEditItem = (id: number) => {
  //   // eslint-disable-next-line max-len
  //   const allItems: Item[] = houses.flatMap((house) => house.storages.flatMap((storage) => storage.stocks.map((stock) => ({
  //     id: stock.id,
  //     name: stock.ingredient.name,
  //     image: stock.ingredient.image || '',
  //     quantity: `${stock.quantity} ${stock.unit}`,
  //     updated: new Date(stock.last_updated).toLocaleDateString('en-US'),
  //     status:
  //           stock.status === 'GOOD'
  //             ? 'Good'
  //             : stock.status === 'LOW_STOCK'
  //               ? 'Low Stock'
  //               : stock.status === 'OUT_OF_STOCK'
  //                 ? 'Out of Stock'
  //                 : 'Expired',
  //     category: (stock.category.toLowerCase() as 'fridge' | 'pantry' | 'freezer' | 'spice rack' | 'other'),
  //   }))));

  // Flatten all stocks into ttems
  const getDisplayedItems = (): Item[] => {
    const allItems: Item[] = houses.flatMap(house => house.storages.flatMap(storage => storage.stocks.map(stock => ({
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
    }))));

    // const foundItem = allItems.find((item) => item.id === id);
    //   if (foundItem) {
    //     setItemToEdit(foundItem);
    //     setShowEditModal(true);
    //   }
    // };

    // Apply filters
    const filtered = allItems.filter(item => {
      const searchMatch = filters.search ? item.name.toLowerCase().includes(filters.search.toLowerCase()) : true;
      const statusMatch = filters.status.length > 0 ? filters.status.includes(item.status) : true;
      return searchMatch && statusMatch;
    });

    // Apply sorting by name
    const sorted = filtered.sort(
      (a, b) => (sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)),
    );
    return sorted;
  };

  const handleEditItem = (id: number) => {
    const foundItem = getDisplayedItems().find(item => item.id === id);
    if (foundItem) {
      setItemToEdit(foundItem);
      setShowEditModal(true);
    }
  };

  // const handleSort = (direction: 'asc' | 'desc') => {
  //   const sorted = [...sortedItems].sort((a, b) => (direction === 'asc'
  //     ? a.name.localeCompare(b.name)
  //     : b.name.localeCompare(a.name)));
  //   setSortedItems(sorted);
  // };

  // // Apply filters to all stocks
  // const getFilteredStocks = (stocks: Stock[]) => stocks
  //   .map((stock) => ({
  //     id: stock.id,
  //     name: stock.ingredient.name,
  //     image: stock.ingredient.image || '',
  //     quantity: `${stock.quantity} ${stock.unit}`,
  //     updated: new Date(stock.last_updated).toLocaleDateString('en-US'),
  //     status:
  //         stock.status === 'GOOD'
  //           ? 'Good'
  //           : stock.status === 'LOW_STOCK'
  //             ? 'Low Stock'
  //             : stock.status === 'OUT_OF_STOCK'
  //               ? 'Out of Stock'
  //               : 'Expired' as 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired',
  //     category: stock.category.toLowerCase(),
  //   }))
  //   .filter((item) => {
  //     const searchMatch = filters.search
  //       ? item.name.toLowerCase().includes(filters.search.toLowerCase())
  //       : true;
  //     const statusMatch = filters.status.length > 0 ? filters.status.includes(item.status) : true;
  //     return searchMatch && statusMatch;
  //   });

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
              <KitchenSortButton label="Sort" onSort={dir => setSortDirection(dir)} />
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
                  items={getDisplayedItems()}
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