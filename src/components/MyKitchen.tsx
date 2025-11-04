'use client';

/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */

import { Container, Button, Row, Card, Placeholder, Col } from 'react-bootstrap';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { LocalStatus, LocalUnit } from '@/lib/Units';
import IngredientTable from '@/components/kitchen-components/IngredientTable';
import StorageContainer from '@/components/kitchen-components/StorageContainer';
import HomeTabSelection from '@/components/kitchen-components/HomeTabSelection';
import AddItemModal from '@/components/kitchen-components/AddItemModal';
import AddPantryModal from '@/components/kitchen-components/AddPantryModal';
import KitchenFilterButton from '@/components/kitchen-components/KitchenFilterButton';
import EditItemModal from '@/components/kitchen-components/EditItemModal';
import DeleteItemModal from './kitchen-components/DeleteItemModal';

type BaseItem = {
  id: number;
  ingredientId: number;
  storageId: number;
};

type Item = BaseItem & {
  name: string;
  // image: string;
  quantity: string;
  updated: string;
  status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
  rawQuantity?: number;
};

type EditItem = BaseItem & {
  name: string;
  quantity: number;
  unit: LocalUnit;
  status: LocalStatus;
};

type Stock = BaseItem & {
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
  address?: string;
  storages: Storage[];
};

// Loading Skeleton Component
const KitchenSkeleton: React.FC = () => (
  <Container className="mb-12 min-h-screen mt-5">
    <div className="mt-4">
      {/* House Tab Skeleton */}
      <div className="mb-4">
        <Placeholder as="div" animation="glow">
          <Placeholder xs={3} className="rounded py-3" />
        </Placeholder>
      </div>

      {/* Filter and Add Button Skeleton */}
      <Row className="justify-content-end mb-3">
        <Col xs="auto" className="d-flex gap-2">
          <Placeholder.Button variant="outline-dark" className="px-4" />
          <Placeholder.Button variant="success" className="px-4" />
        </Col>
      </Row>

      {/* Storage Containers Skeleton */}
      {[1, 2].map((storageIndex) => (
        <Card key={storageIndex} className="mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Placeholder as="h5" animation="glow">
              <Placeholder xs={4} />
            </Placeholder>
            <Placeholder.Button variant="outline-secondary" size="sm" xs={2} />
          </Card.Header>
          <Card.Body>
            {/* Table Header Skeleton */}
            <Row className="mb-3 pb-2 border-bottom">
              <Col xs={5}>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={6} size="sm" />
                </Placeholder>
              </Col>
              <Col xs={2}>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={8} size="sm" />
                </Placeholder>
              </Col>
              <Col xs={3}>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={8} size="sm" />
                </Placeholder>
              </Col>
              <Col xs={2}>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={6} size="sm" />
                </Placeholder>
              </Col>
            </Row>

            {/* Table Rows Skeleton */}
            {[1, 2, 3, 4].map((rowIndex) => (
              <Row key={rowIndex} className="align-items-center py-3 border-bottom">
                <Col xs={5} className="d-flex align-items-center gap-2">
                  <Placeholder
                    as="div"
                    animation="glow"
                    className="rounded"
                  >
                    <Placeholder className="d-block" style={{ width: '40px', height: '40px' }} />
                  </Placeholder>
                  <Placeholder as="div" animation="glow" className="flex-grow-1">
                    <Placeholder xs={8} />
                  </Placeholder>
                </Col>
                <Col xs={2}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </Col>
                <Col xs={3}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} size="sm" />
                  </Placeholder>
                </Col>
                <Col xs={2}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} className="rounded-pill" />
                  </Placeholder>
                </Col>
              </Row>
            ))}
          </Card.Body>
        </Card>
      ))}

      {/* Add Storage Button Skeleton */}
      <Placeholder.Button variant="success" className="mt-1 px-4" />
    </div>
  </Container>
);

const MyKitchen = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [activeHouseId, setActiveHouseId] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<EditItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BaseItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const userId = (useSession().data?.user as { id?: number })?.id;

  const [filters, setFilters] = useState<{ search: string; quantity?: number; status: string[] }>({
    search: '',
    quantity: undefined,
    status: [],
  });

  const fetchHouses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/kitchen?userId=${userId}`);
      const data = await res.json();

      const houseArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.houses)
          ? data.houses
          : [];

      setHouses(houseArray);
      if (houseArray.length > 0) setActiveHouseId(houseArray[0].id);
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const getDisplayedStocks = (storage: Storage): Item[] => {
    const allItems: Item[] = storage.stocks
      .map((stock) => ({
        id: stock.id,
        ingredientId: stock.ingredient.id,
        storageId: stock.storageId,
        name: stock.ingredient.name,
        image: stock.ingredient.image || '',
        quantity: `${stock.quantity} ${LocalUnit[stock.unit as keyof typeof LocalUnit] || stock.unit
        }`,
        updated: new Date(stock.last_updated).toLocaleDateString('en-US', { timeZone: 'UTC' }),
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
        rawQuantity: stock.quantity,
      }))
      .filter((item) => {
        const searchMatch = filters.search
          ? item.name.toLowerCase().includes(filters.search.toLowerCase())
          : true;
        const statusMatch = filters.status.length > 0 ? filters.status.includes(item.status) : true;
        const quantityMatch = filters.quantity !== undefined
          ? item.rawQuantity <= filters.quantity
          : true;
        return searchMatch && statusMatch && quantityMatch;
      });

    return allItems;
  };

  const handleEditItem = (ingredientId: number, storageId: number) => {
    for (const house of houses) {
      for (const storage of house.storages) {
        const items = getDisplayedStocks(storage);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const item = items.find(item =>
          item.storageId === storageId && item.ingredientId === ingredientId,
        );
        if (item) {
          setItemToEdit({
            id: item.id,
            ingredientId: item.ingredientId,
            storageId: item.storageId,
            name: item.name,
            quantity: item.rawQuantity ?? 0,
            unit: (item.quantity.split(' ')[1] as LocalUnit) ?? '' as LocalUnit,
            status: item.status as LocalStatus,
          });
          setShowEditModal(true);
          return;
        }
      }
    }
  };

  const handleDeleteItem = (ingredientId: number, storageId: number) => {
    for (const house of houses) {
      for (const storage of house.storages) {
        const items = getDisplayedStocks(storage);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const item = items.find(item =>
          item.storageId === storageId && item.ingredientId === ingredientId,
        );
        if (item) {
          setItemToDelete({
            id: item.id,
            ingredientId: item.ingredientId,
            storageId: item.storageId,
          });
          setShowDeleteItemModal(true);
          return;
        }
      }
    }
  };

  if (loading) {
    return <KitchenSkeleton />;
  }

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
                  houseArray={houses.map((h) => ({ houseId: h.id, name: h.name, address: h.address }))}
                  activeHouseId={activeHouseId}
                  selectActiveHouseId={setActiveHouseId}
                  onHouseAdded={fetchHouses}
                >
                  <Row className="justify-content-end mb-3 pr-4">
                    <KitchenFilterButton
                      onApply={(appliedFilters) =>
                        setFilters({
                          search: appliedFilters.search,
                          quantity: appliedFilters.quantity,
                          status: appliedFilters.status,
                        })
                      }
                      onSearchChange={(value) =>
                        setFilters((prev) => ({ ...prev, search: value }))
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
                      onUpdate={fetchHouses}
                      feature={null}
                      storageInfo={{ name: storage.name, type: storage.type, storageId: storage.id, houseId: activeHouseId }}
                    >
                      <IngredientTable
                        items={getDisplayedStocks(storage)}
                        onDelete={(ingredientId, storageId) => {
                          handleDeleteItem(ingredientId, storageId);
                          setShowDeleteItemModal(true);
                        }}
                        onEdit={(ingredientId, storageId) => {
                          handleEditItem(ingredientId, storageId);
                          setShowEditModal(true);
                        }}
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
        onUpdateItem={async () => {
          await fetchHouses();
          setShowEditModal(false);
        }}
        item={itemToEdit}
      />
      <DeleteItemModal
        show={showDeleteItemModal}
        onClose={() => setShowDeleteItemModal(false)}
        onDelete={async () => {
          await fetchHouses();
          setShowDeleteItemModal(false);
        }}
        item={itemToDelete}
      />
    </Container>
  );
};

export default MyKitchen;
