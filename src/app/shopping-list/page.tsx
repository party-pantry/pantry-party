"use client";
import React, { useState } from "react";

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
    priority: "Medium" as ShoppingItem["priority"]
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
      addedDate: "Sep 9, 2025"
    },
    {
      id: 2,
      name: "Bread",
      quantity: "2 loaves",
      category: "Pantry",
      priority: "Medium",
      purchased: false,
      addedDate: "Sep 9, 2025"
    },
    {
      id: 3,
      name: "Bananas",
      quantity: "1 bunch",
      category: "Produce",
      priority: "Low",
      purchased: true,
      addedDate: "Sep 8, 2025"
    },
    {
      id: 4,
      name: "Chicken Breast",
      quantity: "2 lbs",
      category: "Meat",
      priority: "High",
      purchased: false,
      addedDate: "Sep 9, 2025"
    }
  ]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity) return;

    const item: ShoppingItem = {
      ...newItem,
      id: Math.max(...shoppingItems.map(i => i.id), 0) + 1,
      purchased: false,
      addedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };

    setShoppingItems(prev => [...prev, item]);
    setNewItem({ name: "", quantity: "", category: "Other", priority: "Medium" });
    setShowAddForm(false);
  };

  const togglePurchased = (id: number) => {
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const getPriorityColor = (priority: ShoppingItem["priority"]) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: ShoppingItem["category"]) => {
    switch (category) {
      case "Produce": return "bg-green-100 text-green-800 border-green-200";
      case "Meat": return "bg-red-100 text-red-800 border-red-200";
      case "Dairy": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pantry": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Other": return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const unpurchasedItems = shoppingItems.filter(item => !item.purchased);
  const purchasedItems = shoppingItems.filter(item => item.purchased);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Shopping List</h1>
          <p className="text-gray-600 mt-2">Keep track of what you need to buy</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Item +"}
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border">
          <form onSubmit={handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="text"
                  placeholder="e.g., 2 lbs"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value as ShoppingItem["category"]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Produce">Produce</option>
                  <option value="Meat">Meat</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({...newItem, priority: e.target.value as ShoppingItem["priority"]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                Add to List
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center border">
          <h3 className="text-3xl font-bold text-blue-600">{unpurchasedItems.length}</h3>
          <p className="text-gray-600">Items to Buy</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border">
          <h3 className="text-3xl font-bold text-green-600">{purchasedItems.length}</h3>
          <p className="text-gray-600">Items Purchased</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center border">
          <h3 className="text-3xl font-bold text-red-600">
            {unpurchasedItems.filter(item => item.priority === "High").length}
          </h3>
          <p className="text-gray-600">High Priority Items</p>
        </div>
      </div>

      {/* Shopping List Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items to Buy */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b">
              <h5 className="text-xl font-semibold">Items to Buy ({unpurchasedItems.length})</h5>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {unpurchasedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in your shopping list!</p>
              ) : (
                <div className="space-y-4">
                  {unpurchasedItems
                    .sort((a, b) => {
                      const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                    })
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.purchased}
                            onChange={() => togglePurchased(item.id)}
                            className="mr-3 w-5 h-5"
                          />
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity} • Added {item.addedDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 text-red-500 hover:bg-red-100 rounded-full flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Items */}
        <div>
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b">
              <h5 className="text-xl font-semibold">Recently Purchased ({purchasedItems.length})</h5>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {purchasedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No purchased items yet!</p>
              ) : (
                <div className="space-y-4">
                  {purchasedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => togglePurchased(item.id)}
                          className="mr-3 w-5 h-5"
                        />
                        <div className="opacity-70 line-through">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.quantity}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 text-red-500 hover:bg-red-100 rounded-full flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;