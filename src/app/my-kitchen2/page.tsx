"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import StorageContainer from "@/components/StorageContainer";
import IngredientTable from "@/components/kitchen-components/IngredientTable";
import AddStorageModal from "@/components/kitchen-components/AddStorageModal";
import AddHouseModal from "@/components/kitchen-components/AddHouseModal";

const mapStatus = (status: string) => {
    switch (status) {
        case 'GOOD':
            return 'Good';
        case 'LOW_STOCK':
            return 'Low Stock';
        case 'OUT_OF_STOCK':
            return 'Out of Stock';
        case 'EXPIRED':
            return 'Expired';
        default:
            return 'Expired';
    }
}

const getFilteredStocks = (stocks: any[]): any[] => {
    return stocks.map((stock) => ({
        id: stock.id,
        name: stock.custom_name || stock.ingredient?.name || "N/A",
        quantity: `${stock.quantity} ${stock.unit.toLowerCase()}`,
        price: stock.ingredient?.price || 0,
        updated: new Date(stock.last_updated).toLocaleDateString(),
        status: mapStatus(stock.status), 
    }));
};

const myKitchen = () => {
    const [houses, setHouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addHouseModal, setAddHouseModal] = useState(false);
    const [addStorageModal, setAddStorageModal] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
    const fetchData = async () => {
        if (status === "authenticated" && session) {
            try {
                const res = await fetch("/api/kitchen", { 
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`API Error: ${res.status} - ${errorText}`);
                    return;
                }
                
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setHouses(data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    };
    fetchData();
    }, [status, session]);

    const handleAddHouse = async (house: { name: string }) => {
        console.log("Adding house:", house);
        try {
            const res = await fetch("/api/house", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(house),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error("Error response:", res.status, errorData);
                throw new Error(`Failed to add house: ${res.status}`);
            }   
            const newHouse = await res.json();
            setHouses((prev) => [...prev, newHouse]);
            setAddHouseModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddStorage = async (storage: { name: string; type: string }) => {
        console.log("Adding storage:", storage);
        try {
            const res = await fetch('/api/storage', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storage),
            });

             if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error("Error response:", res.status, errorData);
                throw new Error(`Failed to add storage: ${res.status}`);
            }
            
            const newStorage = await res.json();
            setHouses((prev) =>
                prev.map((house) =>
                    house.id === newStorage.houseId
                        ? { ...house, storages: [...house.storages, newStorage] }
                        : house
                )
            );
            setAddStorageModal(false);
        } catch (error) {
            // IMPROVE LATER: Show user-friendly error message
            console.error("Error adding storage:", error);
        }
    };

    const handleEditItem = (id: number) => {
        console.log("Edit item", id);
    }

    const handleDeleteItem = (id: number) => {
        console.log("Delete item", id);
    }
    
    if (loading) {
        return <p>Loading...</p>;
    }

    return (
    <div className="flex flex-col items-center justify-center py-10" style={{ height: "100vh" }}>
      {houses.length === 0 ? (
        <>
          <p>No houses yet.</p>
          <Button variant="success" onClick={() => setAddHouseModal(true)}>
            Add House +
          </Button>
          <AddHouseModal
            show={addHouseModal}
            onHide={() => setAddHouseModal(false)}
            onAddHouse={handleAddHouse}
          />
        </>
      ) : (
        <>
                    <div className="mb-4">
                        <Button 
                            variant="primary" 
                            onClick={() => setAddHouseModal(true)}
                            className="me-2"
                        >
                            Add House +
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={() => setAddStorageModal(true)}
                        >
                            Add Storage +
                        </Button>
                    </div>

                    <AddHouseModal
                        show={addHouseModal}
                        onHide={() => setAddHouseModal(false)}
                        onAddHouse={handleAddHouse}
                    />
                    
                    <AddStorageModal
                        show={addStorageModal}
                        onHide={() => setAddStorageModal(false)}
                        houses={houses}
                        onAddStorage={handleAddStorage}
                    />

                    {houses.map((house) => (
                        <div key={house.id} className="mb-4 w-100">
                            <h3>{house.name}</h3>
                            {house.storages && house.storages.length > 0 ? (
                                house.storages.map((storage: any) => (
                                    <StorageContainer key={storage.id} title={storage.name} id={storage.id}>
                                        <IngredientTable
                                            items={getFilteredStocks(storage.stocks || [])}
                                            onDelete={handleDeleteItem}
                                            onEdit={handleEditItem}
                                        />
                                    </StorageContainer>
                                ))
                            ) : (
                                <p>No storage areas in this house yet.</p>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default myKitchen;