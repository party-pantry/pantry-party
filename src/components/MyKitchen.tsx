'use client';

/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */

import { Container, Button, Row } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import IngredientTable from '@/components/kitchen-components/IngredientTable';
import StorageContainer from '@/components/kitchen-components/StorageContainer';
import HomeTabSelection from '@/components/kitchen-components/HomeTabSelection';
import AddItemModal from '@/components/kitchen-components/AddItemModal';
import AddPantryModal from '@/components/kitchen-components/AddPantryModal';
import KitchenFilterButton from '@/components/kitchen-components/KitchenFilterButton';
import EditItemModal from '@/components/kitchen-components/EditItemModal';
import KitchenSortButton from '@/components/kitchen-components/KitchenSortButton';
import { LocalUnit } from '@/lib/Units';

type Item = {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
};

type Stock = {
  id: number;
  quantity: number;
  unit: string;
  status: 'GOOD' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
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
  const [activeHouseId, setActiveHouseId] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const userId = (useSession().data?.user as { id?: number })?.id;

  const [filters, setFilters] = useState<{ search: string; status: string[] }>({
    search: '',
    status: [],
  });

  const [sortDirections, setSortDirections] = useState<
  Record<number, 'asc' | 'desc'>
  >({});

  const fetchHouses = async () => {
    if (!userId) return;
    const res = await fetch(`/api/kitchen?userId=${userId}`);
    const data = await res.json();

    // Ensure we always store an array
    const houseArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.houses)
        ? data.houses
        : [];

    setHouses(houseArray);
    if (houseArray.length > 0) setActiveHouseId(houseArray[0].id);
  };

  useEffect(() => {
    fetchHouses();
  }, [userId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        })),
      ),
    );

    const foundItem = allItems.find((item) => item.id === id);
    if (foundItem) {
      setItemToEdit(foundItem);
      setShowEditModal(true);
    }
  };

  const handleSort = (storageId: number) => {
    setSortDirections((prev) => ({
      ...prev,
      [storageId]: prev[storageId] === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getDisplayedStocks = (storage: Storage): Item[] => {
    const allItems: Item[] = storage.stocks
      .map((stock) => ({
        id: stock.id,
        name: stock.ingredient.name,
        image: stock.ingredient.image || '',
        quantity: `${stock.quantity} ${LocalUnit[stock.unit as keyof typeof LocalUnit] || stock.unit
        }`,
        updated: new Date(stock.last_updated).toLocaleDateString('en-US'),
        status:
          stock.status === 'GOOD'
            ? 'Good'
            : stock.status === 'LOW_STOCK'
              ? 'Low Stock'
              : stock.status === 'OUT_OF_STOCK'
                ? 'Out of Stock'
                : ('Expired' as
                  | 'Good'
                  | 'Low Stock'
                  | 'Out of Stock'
                  | 'Expired'),
      }))
      .filter((item) => {
        const searchMatch = filters.search
          ? item.name.toLowerCase().includes(filters.search.toLowerCase())
          : true;
        const statusMatch = filters.status.length > 0 ? filters.status.includes(item.status) : true;
        return searchMatch && statusMatch;
      });

    const direction = sortDirections[storage.id] || 'asc';
    return allItems.sort((a, b) =>
      (direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)),
    );
  };

  return (
    <Container className="mb-12 min-h-screen mt-5">
      <div
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '50px',
        }}
      >
        <div style={{ marginTop: '24px' }}>
          {Array.isArray(houses)
            && houses
              .filter((house) => house.id === activeHouseId)
              .map((house) => (
                <HomeTabSelection
                  key={house.id}
                  id={house.id.toString()}
                  houseArray={houses.map((h) => ({ id: h.id, name: h.name }))}
                  activeHouseId={activeHouseId}
                  selectActiveHouseId={setActiveHouseId}
                  onHouseAdded={fetchHouses}
                >
                  <Row className="justify-content-end mb-3 pr-4">
                    <KitchenFilterButton
                      onApply={(appliedFilters) =>
                        setFilters({
                          search: appliedFilters.search,
                          status: appliedFilters.status,
                        })
                      }
                    />

                    <Button
                      style={{
                        width: '125px',
                        backgroundColor: '#3A5B4F',
                        color: 'white',
                      }}
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
                      feature={
                        <KitchenSortButton
                          label="Sort"
                          onSort={() => handleSort(storage.id)}
                        />
                      }
                    >
                      <IngredientTable
                        items={getDisplayedStocks(storage)}
                        onDelete={() => {}}
                        onEdit={() => {}}
                      />
                    </StorageContainer>
                  ))}

                  <Button
                    className="mt-1"
                    style={{
                      width: '150px',
                      backgroundColor: '#3A5B4F',
                      borderColor: '#3A5B4F',
                    }}
                    onClick={() => setShowPantryModal(true)}
                  >
                    <strong>Add Storage +</strong>
                  </Button>
                </HomeTabSelection>
              ))}
        </div>
      </div>

      <AddItemModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddItem={async () => {
          await fetchHouses();
          setShowAddModal(false);
        }}
        storages={
          houses.find((house) => house.id === activeHouseId)?.storages || []
        }
      />
      <AddPantryModal
        show={showPantryModal}
        onHide={() => setShowPantryModal(false)}
        onAddPantry={async () => {
          await fetchHouses();
          setShowPantryModal(false);
        }}
        houseId={activeHouseId}
      />
      <EditItemModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        itemToEdit={itemToEdit}
        onUpdateItem={fetchHouses}
      />
    </Container>
  );
};

export default MyKitchen;
