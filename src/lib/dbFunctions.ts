'use server';

// import { Stuff, Condition } from '@prisma/client';
// import { redirect } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/prefer-default-export

import { hash } from 'bcryptjs';
import { Unit, Status, Category } from '@prisma/client';
import { prisma } from './prisma';

/* Create a new user with unique email and username */
// eslint-disable-next-line import/prefer-default-export
export async function createUser(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const password = await hash(credentials.password, 10);
  // Check if user with this email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: credentials.email }, { username: credentials.username }],
    },
  });
  if (existingUser) {
    if (existingUser.email === credentials.email) {
      throw new Error('Email already in use');
    } else {
      throw new Error('Username already in use');
    }
  }
  await prisma.user.create({
    data: {
      email: credentials.email,
      username: credentials.username,
      password,
    },
  });
}

/* Create new stock and able to create new ingredient */
export async function addStock(data: {
  name: string;
  quantity: number;
  status: Status;
  storageId: number;
  units: Unit;
}) {
  const sterilizedItemName = data.name.trim().toLowerCase();

  // Validate that the storage exists
  const storage = await prisma.storage.findUnique({
    where: { id: data.storageId },
  });

  if (!storage) {
    throw new Error(`Storage with ID ${data.storageId} does not exist`);
  }

  // First try to find existing ingredient
  let ingredient = await prisma.ingredient.findFirst({
    where: {
      name: sterilizedItemName,
    },
  });

  // If not found, try to create it (handle race condition)
  if (!ingredient) {
    try {
      ingredient = await prisma.ingredient.create({
        data: {
          name: sterilizedItemName,
        },
      });
    } catch (error: any) {
      // If creation fails due to unique constraint, try finding it again
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        ingredient = await prisma.ingredient.findFirst({
          where: {
            name: sterilizedItemName,
          },
        });
        if (!ingredient) {
          throw error; // Re-throw if still not found
        }
      } else {
        throw error;
      }
    }
  }

  const ingredientId = ingredient.id;

  // Create new stock
  await prisma.stock.create({
    data: {
      ingredientId,
      storageId: data.storageId,
      quantity: Number(data.quantity),
      unit: data.units,
      status: data.status,
    },
  });
}

/* Edit stock item */
export async function updateStock(data: {
  storageId: number;
  ingredientId: number;
  newName: string;
  quantity: number;
  unit: Unit;
  status: Status;
}) {
  const sterilizedItemName = data.newName.trim().toLowerCase();

  // Get the current stock to check current ingredient
  const currentStock = await prisma.stock.findUnique({
    where: {
      ingredientId_storageId: {
        ingredientId: data.ingredientId,
        storageId: data.storageId,
      },
    },
    include: { ingredient: true },
  });

  if (!currentStock) {
    throw new Error(`Stock not found for storage ${data.storageId} and ingredient ${data.ingredientId}`);
  }

  // Check if name is changing
  if (currentStock.ingredient.name !== sterilizedItemName) {
    // Try to find existing ingredient with the new name
    let targetIngredient = await prisma.ingredient.findFirst({
      where: { name: sterilizedItemName },
    });

    // If ingredient doesn't exist, create it
    if (!targetIngredient) {
      try {
        targetIngredient = await prisma.ingredient.create({
          data: { name: sterilizedItemName },
        });
      } catch (error: any) {
        // Handle race condition - ingredient might have been created by another request
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
          targetIngredient = await prisma.ingredient.findFirst({
            where: { name: sterilizedItemName },
          });
          if (!targetIngredient) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    // Delete the old stock entry
    await prisma.stock.delete({
      where: {
        ingredientId_storageId: {
          ingredientId: data.ingredientId,
          storageId: data.storageId,
        },
      },
    });

    // Create new stock entry with new ingredient
    const newStock = await prisma.stock.create({
      data: {
        ingredientId: targetIngredient.id,
        storageId: data.storageId,
        quantity: Number(data.quantity),
        unit: data.unit as Unit,
        status: data.status,
      },
    });

    return newStock;
  }
  // Name hasn't changed, just update other fields
  const updatedStock = await prisma.stock.update({
    where: {
      ingredientId_storageId: {
        ingredientId: data.ingredientId,
        storageId: data.storageId,
      },
    },
    data: {
      quantity: Number(data.quantity),
      unit: data.unit as Unit,
      status: data.status,
    },
  });

  return updatedStock;
}

/* Delete stock item */
export async function deleteStock(ingredientId: number, storageId: number) {
  await prisma.stock.delete({
    where: {
      ingredientId_storageId: {
        ingredientId,
        storageId,
      },
    },
  });
}

/* Create a new house */
export async function addHouse(data: { name: string; address?: string; userId: number }) {
  await prisma.house.create({
    data: {
      name: data.name,
      address: data.address,
      userId: Number(data.userId),
    },
  });
}

/* Edit house by id */
export async function updateHouse(houseId: number, data: { name: string, address?: string }) {
  const updatedHouse = await prisma.house.update({
    where: { id: houseId },
    data: {
      name: data.name,
      address: data.address,
    },
  });

  return updatedHouse;
}

/* Delete house by id */
export async function deleteHouse(houseId: number) {
  await prisma.house.delete({
    where: { id: houseId },
  });
}

/* Create a new storage/pantry */
export async function addStorage(data: { name: string; type: Category; houseId: number }) {
  await prisma.storage.create({
    data: {
      name: data.name,
      type: data.type,
      houseId: data.houseId,
    },
  });
}

/* Edit storage by id */
export async function updateStorage(houseId: number, storageId: number, data: { name: string; category: string }) {
  const updatedStorage = await prisma.storage.update({
    where: { id: storageId },
    data: {
      name: data.name,
      type: data.category as Category,
    },
  });

  return updatedStorage;
}

/* Add item to shopping list (manual or from suggestion) */
export async function addShoppingListItem(data: {
  userId: number;
  ingredientId?: number;
  name: string;
  quantity: string;
  category: string;
  priority: string;
  source: string;
  sourceStockIngredientId?: number;
  sourceStorageId?: number;
}) {
  const item = await prisma.shoppingListItem.create({
    data: {
      userId: data.userId,
      ingredientId: data.ingredientId,
      name: data.name,
      quantity: data.quantity,
      category: data.category,
      priority: data.priority,
      source: data.source,
      sourceStockIngredientId: data.sourceStockIngredientId,
      sourceStorageId: data.sourceStorageId,
    },
    include: {
      Ingredient: true,
    },
  });

  return item;
}

/* Get all shopping list items for a user */
export async function getShoppingListItems(userId: number) {
  const items = await prisma.shoppingListItem.findMany({
    where: { userId },
    include: {
      Ingredient: true,
    },
    orderBy: {
      addedDate: 'desc',
    },
  });

  return items;
}

/* Update shopping list item */
export async function updateShoppingListItem(
  itemId: number,
  data: {
    name?: string;
    quantity?: string;
    category?: string;
    priority?: string;
  },
) {
  const item = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data,
  });

  return item;
}

/* Toggle purchased status for shopping list item */
export async function toggleShoppingListItemPurchased(itemId: number) {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error(`Shopping list item with ID ${itemId} does not exist`);
  }

  const updatedItem = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { purchased: !item.purchased },
  });

  return updatedItem;
}

/* Delete shopping list item */
export async function deleteShoppingListItem(itemId: number) {
  await prisma.shoppingListItem.delete({
    where: { id: itemId },
  });
}

/* Get suggested items based on low/out of stock inventory */
export async function getSuggestedItems(userId: number) {
  // Get all items already in shopping list to filter them out
  const existingShoppingListItems = await prisma.shoppingListItem.findMany({
    where: {
      userId,
      purchased: false,
    },
    select: {
      ingredientId: true,
    },
  });

  const existingIngredientIds = existingShoppingListItems
    .map((item) => item.ingredientId)
    .filter((id): id is number => id !== null);

  // Get ALL user's stocks to check if they have the ingredient anywhere
  const allUserStocks = await prisma.stock.findMany({
    where: {
      storage: {
        house: {
          userId,
        },
      },
      ingredientId: {
        notIn: existingIngredientIds,
      },
    },
    include: {
      ingredient: true,
      storage: {
        include: {
          house: true,
        },
      },
    },
  });

  // Group stocks by ingredient
  const stocksByIngredient = allUserStocks.reduce((acc, stock) => {
    if (!acc[stock.ingredientId]) {
      acc[stock.ingredientId] = [];
    }
    acc[stock.ingredientId].push(stock);
    return acc;
  }, {} as Record<number, typeof allUserStocks>);

  // Only suggest if ALL instances of ingredient are low/out
  const suggestions = Object.entries(stocksByIngredient)
    .filter(([, stocks]) => stocks.every(
      (stock) => stock.quantity === 0
        || stock.status === Status.OUT_OF_STOCK
        || stock.status === Status.LOW_STOCK
        || stock.status === Status.EXPIRED,
    ))
    .map(([, stocks]) => {
      const firstStock = stocks[0];
      const isOutOfStock = stocks.every(
        (s) => s.quantity === 0 || s.status === Status.OUT_OF_STOCK,
      );

      return {
        ingredientId: firstStock.ingredientId,
        name: firstStock.ingredient.name,
        unit: firstStock.unit,
        status: firstStock.status,
        storageId: firstStock.storageId,
        storageName: firstStock.storage.name || firstStock.storage.type,
        storageType: firstStock.storage.type,
        houseName: firstStock.storage.house.name,
        suggestedPriority: isOutOfStock ? 'High' : 'Medium',
        currentQuantity: firstStock.quantity,
      };
    });

  return suggestions;
}
