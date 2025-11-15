'use client';

/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */

import { Container, Button, Row, Card, Placeholder, Col, Form } from 'react-bootstrap';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import { LocalStatus, LocalUnit } from '@/lib/Units';
import IngredientTable from './IngredientTable';
import StorageContainer from './StorageContainer';
import HomeTabSelection from './HomeTabSelection';
import AddItemModal from './AddItemModal';
import AddPantryModal from './AddPantryModal';
import KitchenFilterButton from './KitchenFilterButton';
import EditItemModal from './EditItemModal';
import DeleteItemModal from './DeleteItemModal';

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

      {/* Header Controls Skeleton */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center flex-wrap gap-4">
              <Placeholder as="div" animation="glow" style={{ width: '250px' }}>
                <Placeholder xs={12} style={{ height: '38px', borderRadius: '4px' }} />
              </Placeholder>
              <Placeholder.Button variant="outline-dark" xs={2} />
            </div>
            <div className="d-flex gap-2">
              <Placeholder.Button variant="success" />
              <Placeholder.Button variant="success" />
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards Skeleton */}
      <Row className="mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Col key={i} md={3} sm={6} xs={12} className="mb-3">
            <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
              <Card.Body className="py-4">
                <Placeholder as="h3" animation="glow">
                  <Placeholder xs={6} className="fs-2 mb-1" />
                </Placeholder>
                <Placeholder as="p" animation="glow">
                  <Placeholder xs={8} size="sm" />
                </Placeholder>
              </Card.Body>
            </Card>
          </Col>
        ))}
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

  const activeHouse = houses.find((house) => house.id === activeHouseId);
  const allItems = activeHouse?.storages.flatMap((storage) => getDisplayedStocks(storage)) || [];

  const totalItems = allItems.length;
  const goodItems = allItems.filter((item) => item.status === 'Good').length;
  const lowStockItems = allItems.filter((item) => item.status === 'Low Stock').length;
  const expiredItems = allItems.filter((item) => item.status === 'Expired').length;

  return (
    <Container className="py-5 rounded" style={{ width: '95%' }}>
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
              <Row className="mb-4">
                <Col xs={12}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center flex-wrap gap-4">
                      <div className="position-relative" style={{ maxWidth: '250px' }}>
                        <Search size={18} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                        <Form.Control
                          placeholder="Search items..."
                          style={{ paddingLeft: '2rem' }}
                          value={filters.search}
                          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        />
                      </div>
                      <KitchenFilterButton
                        onApply={(appliedFilters) =>
                          setFilters({
                            search: filters.search,
                            quantity: appliedFilters.quantity,
                            status: appliedFilters.status,
                          })
                        }
                      />
                    </div>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <Button
                        variant="success"
                        onClick={() => setShowAddModal(true)}
                      >
                        Add Item +
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => setShowPantryModal(true)}
                      >
                        Add Storage +
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={3} sm={6} xs={12} className="mb-3">
                  <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
                    <Card.Body className="py-4">
                      <h3 className="text-primary fs-2 mb-1 fw-bold">{totalItems}</h3>
                      <Card.Text className="text-muted small mb-0 fw-medium">Total Items</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12} className="mb-3">
                  <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
                    <Card.Body className="py-4">
                      <h3 className="text-success fs-2 mb-1 fw-bold">{goodItems}</h3>
                      <Card.Text className="text-muted small mb-0 fw-medium">Good</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12} className="mb-3">
                  <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
                    <Card.Body className="py-4">
                      <h3 className="text-warning fs-2 mb-1 fw-bold">{lowStockItems}</h3>
                      <Card.Text className="text-muted small mb-0 fw-medium">Low Stock</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6} xs={12} className="mb-3">
                  <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
                    <Card.Body className="py-4">
                      <h3 className="text-secondary fs-2 mb-1 fw-bold">{expiredItems}</h3>
                      <Card.Text className="text-muted small mb-0 fw-medium">Expired</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {house.storages.map((storage) => (
                <StorageContainer
                  key={storage.id}
                  id={storage.id.toString()}
                  title={storage.name}
                  onUpdate={fetchHouses}
                  feature={null}
                  storageInfo={{ name: storage.name, type: storage.type, storageId: storage.id, houseId: activeHouseId }}
                  items={getDisplayedStocks(storage)}
                  itemsCount={getDisplayedStocks(storage).length}
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
            </HomeTabSelection>
          ))}

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
